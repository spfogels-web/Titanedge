// Returns today's "Policy Watch" hero image + headline for the News page.
//
// Behavior:
//   - If NEWS_API_KEY is set, fetches the top US business headline that has an
//     image and returns its imageUrl + title + source.
//   - Otherwise rotates through a small curated set of public-domain D.C.
//     macro/policy images (White House, Federal Reserve, Capitol). The pick
//     is deterministic by day-of-year so it changes once per day.
//   - Result is cached in-memory for 6 hours to stay well under any free-tier
//     news API quota.
//
// To wire real headlines:
//   1. Get a free key at https://newsapi.org
//   2. Add NEWS_API_KEY=xxxx to Railway env vars
//   3. Redeploy. No code change needed.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface PolicyImageResponse {
  imageUrl: string;
  headline: string;
  source: string;
  publishedAt: string;
  linkUrl: string;              // where clicking the panel sends you
  fallback: boolean;            // true = curated rotation, false = live NewsAPI
}

interface CuratedImage {
  url: string;
  headline: string;
  source: string;
  linkUrl: string;
}

// Curated, public-domain images of D.C. policy landmarks.
// Images are served from /public/policy/ so we never depend on an external
// CDN at runtime (no 404s, no rate limits, no hotlink blocks).
const CURATED: CuratedImage[] = [
  {
    url: "/policy/white-house.jpg",
    headline: "White House — Executive Watch",
    source: "Wikimedia Commons · Public domain",
    linkUrl: "https://www.whitehouse.gov/briefing-room/",
  },
  {
    url: "/policy/federal-reserve.jpg",
    headline: "Federal Reserve — Rate Decision Watch",
    source: "Wikimedia Commons · Public domain",
    linkUrl: "https://www.federalreserve.gov/newsevents/pressreleases.htm",
  },
  {
    url: "/policy/capitol.jpg",
    headline: "U.S. Capitol — Fiscal Policy Watch",
    source: "Wikimedia Commons · Public domain",
    linkUrl: "https://www.congress.gov/",
  },
  {
    url: "/policy/treasury.jpg",
    headline: "Treasury — Debt & Yield Watch",
    source: "Wikimedia Commons · Public domain",
    linkUrl: "https://home.treasury.gov/news/press-releases",
  },
];

interface CacheEntry {
  data: PolicyImageResponse;
  expires: number;
}
let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h

// ---- NewsAPI (kept for backwards compat; not the primary source) ----

interface NewsApiArticle {
  title?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: { name?: string };
}
interface NewsApiResponse {
  status?: string;
  articles?: NewsApiArticle[];
}

async function fetchFromNewsApi(apiKey: string): Promise<PolicyImageResponse | null> {
  try {
    const res = await fetch(
      "https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=20",
      {
        headers: { "X-Api-Key": apiKey },
        next: { revalidate: 21600 },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as NewsApiResponse;
    const articles = json.articles ?? [];
    const article = articles.find((a) => a.urlToImage && a.urlToImage.startsWith("http"));
    if (!article || !article.urlToImage) return null;
    return {
      imageUrl: article.urlToImage,
      headline: article.title ?? "Top business headline",
      source: article.source?.name ?? "NewsAPI",
      publishedAt: article.publishedAt ?? new Date().toISOString(),
      linkUrl: article.url ?? "https://newsapi.org",
      fallback: false,
    };
  } catch {
    return null;
  }
}

// ---- Finnhub (preferred source — 60 req/min free, finance-specific) ----

interface FinnhubNewsItem {
  category?: string;
  datetime?: number;        // unix seconds
  headline?: string;
  id?: number;
  image?: string;
  related?: string;
  source?: string;
  summary?: string;
  url?: string;
}

// Heuristic: which headlines are actually "Policy Watch" material?
// We bias toward macro / Fed / fiscal / tariff / regulatory.
const POLICY_KEYWORDS = [
  "fed", "fomc", "powell", "rate", "rates", "rate cut", "rate hike",
  "inflation", "cpi", "ppi", "pce", "jobs", "payrolls", "unemployment",
  "treasury", "yield", "yields", "bond", "bonds",
  "white house", "biden", "trump", "executive order", "tariff", "tariffs",
  "sanction", "sanctions", "stimulus", "debt ceiling", "shutdown",
  "yellen", "bessent",
  "gdp", "recession", "ism", "pmi",
  "sec", "regulation", "fcc", "ftc", "antitrust",
];

function scorePolicyRelevance(item: FinnhubNewsItem): number {
  const text = `${item.headline ?? ""} ${item.summary ?? ""}`.toLowerCase();
  let score = 0;
  for (const kw of POLICY_KEYWORDS) {
    if (text.includes(kw)) score += 1;
  }
  // Boost recency
  if (item.datetime) {
    const ageHours = (Date.now() / 1000 - item.datetime) / 3600;
    if (ageHours < 2) score += 3;
    else if (ageHours < 6) score += 2;
    else if (ageHours < 24) score += 1;
  }
  return score;
}

interface FinnhubFetchResult {
  payload: PolicyImageResponse | null;
  debug: {
    httpStatus: number | null;
    itemCount: number;
    itemsWithImage: number;
    policyMatchCount: number;
    pickedScore: number | null;
    error?: string;
  };
}

async function fetchFromFinnhub(apiKey: string): Promise<FinnhubFetchResult> {
  const debug: FinnhubFetchResult["debug"] = {
    httpStatus: null,
    itemCount: 0,
    itemsWithImage: 0,
    policyMatchCount: 0,
    pickedScore: null,
  };
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`,
      { next: { revalidate: 900 } }, // 15 min server-side
    );
    debug.httpStatus = res.status;
    if (!res.ok) return { payload: null, debug };
    const items = (await res.json()) as FinnhubNewsItem[];
    if (!Array.isArray(items) || items.length === 0) return { payload: null, debug };
    debug.itemCount = items.length;

    const withImage = items.filter(
      (i) => i.image && i.image.startsWith("http") && i.headline,
    );
    debug.itemsWithImage = withImage.length;

    const scored = withImage
      .map((i) => ({ item: i, score: scorePolicyRelevance(i) }))
      .sort((a, b) => b.score - a.score);

    debug.policyMatchCount = scored.filter((x) => x.score > 0).length;

    // Prefer a policy-relevant article (score > 0); otherwise just take the
    // freshest article with an image so we always show real news when Finnhub
    // is up.
    const top = scored[0];
    if (!top) return { payload: null, debug };
    debug.pickedScore = top.score;

    return {
      payload: {
        imageUrl: top.item.image!,
        headline: top.item.headline!,
        source: top.item.source ?? "Finnhub",
        publishedAt: top.item.datetime
          ? new Date(top.item.datetime * 1000).toISOString()
          : new Date().toISOString(),
        linkUrl: top.item.url ?? "https://finnhub.io",
        fallback: false,
      },
      debug,
    };
  } catch (e) {
    debug.error = e instanceof Error ? e.message : String(e);
    return { payload: null, debug };
  }
}

function pickCurated(): PolicyImageResponse {
  // Deterministic daily rotation: day-of-year mod N
  const day = Math.floor(Date.now() / 86_400_000);
  const item = CURATED[day % CURATED.length];
  return {
    imageUrl: item.url,
    headline: item.headline,
    source: item.source,
    publishedAt: new Date().toISOString(),
    linkUrl: item.linkUrl,
    fallback: true,
  };
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const debugMode = url.searchParams.get("debug") === "1";

  // Serve from cache if fresh (skip cache in debug mode so we re-trace)
  if (!debugMode && cache && cache.expires > Date.now()) {
    return Response.json(cache.data);
  }

  let payload: PolicyImageResponse | null = null;
  // Show env var NAMES (not values) that aren't standard Node/system noise.
  // Helps diagnose whether Railway is injecting user-added vars at all.
  const SYSTEM_PREFIXES = ["NODE_", "NPM_", "PATH", "HOME", "USER", "PWD", "SHLVL", "_", "HOSTNAME", "LANG", "LC_", "TZ", "TERM"];
  const userEnvNames = Object.keys(process.env)
    .filter((k) => !SYSTEM_PREFIXES.some((p) => k.startsWith(p)))
    .sort();

  const trace: Record<string, unknown> = {
    finnhubKeyPresent: !!process.env.FINNHUB_API_KEY,
    newsApiKeyPresent: !!process.env.NEWS_API_KEY,
    matchingEnvNames: Object.keys(process.env).filter(
      (k) =>
        k.toLowerCase().includes("finnhub") ||
        k.toLowerCase().includes("news") ||
        k.toLowerCase().includes("api_key"),
    ),
    totalEnvKeys: Object.keys(process.env).length,
    userEnvNames,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID ?? null,
    railwayProjectId: process.env.RAILWAY_PROJECT_ID ?? null,
  };

  // 1. Try Finnhub first (preferred — finance-specific, 60 req/min free)
  const finnhubKey = process.env.FINNHUB_API_KEY;
  trace.finnhubKeyPresent = !!finnhubKey;
  if (finnhubKey) {
    const result = await fetchFromFinnhub(finnhubKey);
    trace.finnhub = result.debug;
    if (result.payload) payload = result.payload;
  }

  // 2. Try NewsAPI as a secondary option (kept for backwards compat)
  if (!payload) {
    const newsApiKey = process.env.NEWS_API_KEY;
    trace.newsApiKeyPresent = !!newsApiKey;
    if (newsApiKey) {
      payload = await fetchFromNewsApi(newsApiKey);
    }
  }

  // 3. Fall back to curated daily rotation
  if (!payload) {
    payload = pickCurated();
    trace.usedCurated = true;
  }

  // Live news caches for 15 min; curated for 6h
  const ttl = payload.fallback ? CACHE_TTL_MS : 15 * 60 * 1000;
  cache = { data: payload, expires: Date.now() + ttl };

  if (debugMode) {
    return Response.json({ ...payload, _debug: trace });
  }
  return Response.json(payload);
}
