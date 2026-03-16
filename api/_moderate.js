import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fast keyword blocklist — catches obvious stuff without an API call
const BLOCKED_PATTERNS = [
  // Violence & weapons
  /\b(kill|murder|stab|shoot|gun|bomb|explode|blood|dead|die|death|weapon|knife|sword|torture|strangle)\b/i,
  // Sexual content
  /\b(sex|porn|nude|naked|boob|penis|vagina|genital|orgasm|erotic|fetish|hentai)\b/i,
  // Drugs & alcohol
  /\b(cocaine|heroin|meth|weed|marijuana|drunk|alcohol|beer|wine|vodka|drug|overdose)\b/i,
  // Profanity
  /\b(fuck|shit|ass|bitch|damn|hell|crap|dick|cock|piss|bastard|whore|slut)\b/i,
  // Hate & discrimination
  /\b(racist|nazi|nigger|faggot|retard|hate\s+(black|white|asian|jew|muslim|gay|trans))\b/i,
  // Self-harm
  /\b(suicide|self.?harm|cut\s+my|hang\s+myself|kill\s+myself)\b/i,
  // Scary/horror for young kids
  /\b(demon|satan|devil|possess|haunted|nightmare|creepypasta|slender\s?man)\b/i,
];

const FRIENDLY_REJECT = "That topic isn't available in this classroom app. Try something fun — like animals, sports, food, or school!";

// Layer 1: Fast keyword check (no API call needed)
function keywordCheck(text) {
  const lower = text.toLowerCase();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(lower)) return false;
  }
  return true;
}

// Layer 2: OpenAI moderation API (catches subtle stuff)
async function moderationCheck(text) {
  try {
    const result = await openai.moderations.create({ input: text });
    return !result.results[0].flagged;
  } catch {
    // If moderation API fails, allow through (keyword check already passed)
    return true;
  }
}

/**
 * Check if input is appropriate for kids under 10.
 * Returns { safe: true } or { safe: false, message: string }
 */
export async function moderate(text) {
  if (!text || text.trim().length === 0) {
    return { safe: true };
  }

  // Layer 1: Fast keyword blocklist
  if (!keywordCheck(text)) {
    return { safe: false, message: FRIENDLY_REJECT };
  }

  // Layer 2: OpenAI moderation (catches context-dependent issues)
  const modOk = await moderationCheck(text);
  if (!modOk) {
    return { safe: false, message: FRIENDLY_REJECT };
  }

  return { safe: true };
}

/**
 * Check an array of words (for embeddings).
 * Returns { safe: true } or { safe: false, message: string }
 */
export async function moderateWords(words) {
  const joined = words.join(" ");
  return moderate(joined);
}
