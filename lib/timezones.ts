// Curated worldwide timezone list for the Header clock + Calendar popover.
// Grouped by region so the <optgroup> in the select reads cleanly.

export interface TimezoneOption {
  id: string;       // IANA tz id, e.g. "America/New_York"
  label: string;    // Display name with abbreviation
  region: "Americas" | "Europe" | "Asia" | "Africa" | "Pacific" | "Other";
}

export const TIMEZONES: TimezoneOption[] = [
  // Americas
  { id: "America/New_York",     label: "Eastern (ET) — New York",       region: "Americas" },
  { id: "America/Chicago",      label: "Central (CT) — Chicago",        region: "Americas" },
  { id: "America/Denver",       label: "Mountain (MT) — Denver",        region: "Americas" },
  { id: "America/Phoenix",      label: "Arizona (MST) — Phoenix",       region: "Americas" },
  { id: "America/Los_Angeles",  label: "Pacific (PT) — Los Angeles",    region: "Americas" },
  { id: "America/Anchorage",    label: "Alaska (AKT) — Anchorage",      region: "Americas" },
  { id: "Pacific/Honolulu",     label: "Hawaii (HST) — Honolulu",       region: "Americas" },
  { id: "America/Toronto",      label: "Eastern — Toronto",             region: "Americas" },
  { id: "America/Vancouver",    label: "Pacific — Vancouver",           region: "Americas" },
  { id: "America/Mexico_City",  label: "Central — Mexico City",         region: "Americas" },
  { id: "America/Sao_Paulo",    label: "BRT — São Paulo",               region: "Americas" },
  { id: "America/Argentina/Buenos_Aires", label: "ART — Buenos Aires",  region: "Americas" },

  // Europe
  { id: "Europe/London",        label: "GMT/BST — London",              region: "Europe" },
  { id: "Europe/Dublin",        label: "GMT/IST — Dublin",              region: "Europe" },
  { id: "Europe/Paris",         label: "CET — Paris",                   region: "Europe" },
  { id: "Europe/Berlin",        label: "CET — Berlin",                  region: "Europe" },
  { id: "Europe/Madrid",        label: "CET — Madrid",                  region: "Europe" },
  { id: "Europe/Rome",          label: "CET — Rome",                    region: "Europe" },
  { id: "Europe/Amsterdam",     label: "CET — Amsterdam",               region: "Europe" },
  { id: "Europe/Zurich",        label: "CET — Zurich",                  region: "Europe" },
  { id: "Europe/Stockholm",     label: "CET — Stockholm",               region: "Europe" },
  { id: "Europe/Helsinki",      label: "EET — Helsinki",                region: "Europe" },
  { id: "Europe/Athens",        label: "EET — Athens",                  region: "Europe" },
  { id: "Europe/Istanbul",      label: "TRT — Istanbul",                region: "Europe" },
  { id: "Europe/Moscow",        label: "MSK — Moscow",                  region: "Europe" },

  // Asia
  { id: "Asia/Dubai",           label: "GST — Dubai",                   region: "Asia" },
  { id: "Asia/Tehran",          label: "IRST — Tehran",                 region: "Asia" },
  { id: "Asia/Karachi",         label: "PKT — Karachi",                 region: "Asia" },
  { id: "Asia/Kolkata",         label: "IST — Mumbai/Delhi",            region: "Asia" },
  { id: "Asia/Bangkok",         label: "ICT — Bangkok",                 region: "Asia" },
  { id: "Asia/Singapore",       label: "SGT — Singapore",               region: "Asia" },
  { id: "Asia/Hong_Kong",       label: "HKT — Hong Kong",               region: "Asia" },
  { id: "Asia/Shanghai",        label: "CST — Shanghai",                region: "Asia" },
  { id: "Asia/Seoul",           label: "KST — Seoul",                   region: "Asia" },
  { id: "Asia/Tokyo",           label: "JST — Tokyo",                   region: "Asia" },
  { id: "Asia/Manila",          label: "PHT — Manila",                  region: "Asia" },

  // Africa
  { id: "Africa/Cairo",         label: "EET — Cairo",                   region: "Africa" },
  { id: "Africa/Johannesburg",  label: "SAST — Johannesburg",           region: "Africa" },
  { id: "Africa/Lagos",         label: "WAT — Lagos",                   region: "Africa" },
  { id: "Africa/Nairobi",       label: "EAT — Nairobi",                 region: "Africa" },

  // Pacific
  { id: "Australia/Perth",      label: "AWST — Perth",                  region: "Pacific" },
  { id: "Australia/Sydney",     label: "AEST/AEDT — Sydney",            region: "Pacific" },
  { id: "Australia/Melbourne",  label: "AEST/AEDT — Melbourne",         region: "Pacific" },
  { id: "Pacific/Auckland",     label: "NZST/NZDT — Auckland",          region: "Pacific" },

  // Other
  { id: "UTC",                  label: "UTC",                           region: "Other" },
];

export const DEFAULT_TIMEZONE = "America/New_York";

export const REGIONS: TimezoneOption["region"][] = [
  "Americas", "Europe", "Asia", "Africa", "Pacific", "Other",
];
