// Mock data for the /chat page (document upload + chat-with-the-bot UI).
// Real implementation needs: file upload API, file storage, PDF/DOCX
// parsing, vector embedding / RAG, Anthropic Claude call.

export interface UploadedDocument {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "csv";
  sizeKb: number;
  uploadedAt: string;
  pages?: number;
}

export const sampleDocuments: UploadedDocument[] = [
  { id: "d1", name: "Morning Brief — May 23, 2026.pdf",     type: "pdf",  sizeKb: 412, uploadedAt: "Today, 07:30 AM",   pages: 3  },
  { id: "d2", name: "TitanEdge Trade Plan v3.docx",          type: "docx", sizeKb: 184, uploadedAt: "May 10, 2026",      pages: 8  },
  { id: "d3", name: "FOMC Minutes — May 2026.pdf",           type: "pdf",  sizeKb: 1240,uploadedAt: "Yesterday, 03:12 PM", pages: 24 },
  { id: "d4", name: "Pivot Master v4 — Strategy Notes.pdf",  type: "pdf",  sizeKb: 638, uploadedAt: "Apr 28, 2026",      pages: 12 },
  { id: "d5", name: "MNQ historical trades export.csv",      type: "csv",  sizeKb: 96,  uploadedAt: "May 18, 2026" },
];

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: string;
  citations?: { docId: string; page?: number; quote?: string }[];
}

export const seedConversation: ChatMessage[] = [
  {
    id: "m1",
    role: "bot",
    text:
      "Hi Sean. I've indexed your 5 uploaded documents (Morning Brief, Trade Plan, FOMC Minutes, Strategy Notes, MNQ historical trades). Ask me anything — I can summarize, compare, or pull specific numbers across them.",
    timestamp: "10:24 AM",
  },
  {
    id: "m2",
    role: "user",
    text: "What were the key takeaways from yesterday's FOMC minutes?",
    timestamp: "10:25 AM",
  },
  {
    id: "m3",
    role: "bot",
    text:
      "Three things stood out:\n\n• The committee remains data-dependent with no immediate plans for rate cuts.\n• Three members supported holding rates steady longer; two leaned dovish, citing softening labor data.\n• Discussion of balance-sheet runoff pace was unchanged.\n\nFor futures trading: this reinforces the prevailing trending-up regime. VIX dropped 2.8% on the print, and Mag 7 breadth held at 6/7 bullish. I'd favor your Slingshot longs on MNQ pullbacks until the next CPI release on June 12.",
    timestamp: "10:25 AM",
    citations: [{ docId: "d3", page: 14, quote: "remains data-dependent and is not in a hurry to reduce policy restraint" }],
  },
  {
    id: "m4",
    role: "user",
    text: "Summarize my Trade Plan for me — what setups am I supposed to be running?",
    timestamp: "10:27 AM",
  },
  {
    id: "m5",
    role: "bot",
    text:
      "Your Trade Plan v3 lists four primary setups:\n\n1. 3-Touch Pivot Bounce — must have 3+ touches before entry.\n2. Slingshot Continuation — pullback to 21 EMA + bullish rejection candle.\n3. VIX Divergence — counter-trend when VIX rises into highs.\n4. EMA Reclaim — rejection of broken 9 or 21 EMA.\n\nRisk: max daily loss $500, max 4 contracts, max 8 trades per day. Performance side — your MNQ export shows Slingshot is your strongest at 72.4% over 28 trades. Recommendation per your own bias rules: bump Slingshot size by 25%.",
    timestamp: "10:27 AM",
    citations: [
      { docId: "d2", page: 2, quote: "Primary setups: 3-touch pivot, slingshot, VIX divergence, EMA reclaim" },
      { docId: "d5", quote: "Slingshot win rate: 72.4%, n=28" },
    ],
  },
];

// Canned responses for new user messages. Picked round-robin until a real
// LLM call is wired.
export const cannedResponses: string[] = [
  "Based on your morning brief and the current market regime (TRENDING UP, 82% confidence): favor Slingshot and Trend Continuation longs on MNQ. Avoid counter-trend shorts until VIX flips back above 15. Best entry window today: 9:45 – 10:30 AM EST.",
  "Looking at your MNQ historical export, your worst trades cluster in the 11:30 AM – 1:30 PM window (41% win rate, $—236 avg). Strong recommendation: pause or tighten filters during that window.",
  "Per your Trade Plan v3 and the FOMC minutes you uploaded: a 2pm Fed event historically moves MNQ ±20 points in the 30 minutes after release. Your plan caps trading 15 minutes before/after — I'd suggest staying flat from 1:45 to 2:30 PM today.",
  "Across the 5 documents you've uploaded, your Slingshot setup has the strongest expectancy ($112/trade). The Rejection Long setup has negative expectancy (-$16/trade). Consider deprecating Rejection Long until you've adjusted entry criteria.",
];
