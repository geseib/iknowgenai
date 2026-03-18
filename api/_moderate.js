import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FRIENDLY_REJECT = "That topic isn't available in this classroom app. Try something fun — like animals, sports, food, or school!";

const SAFETY_SYSTEM_PROMPT = `You are a content safety classifier for a K-12 school classroom app used by children ages 5-14. Your ONLY job is to decide if the user's input is SAFE or UNSAFE for this context.

Reply with exactly one word: SAFE or UNSAFE

Mark as UNSAFE anything related to:
- Violence, weapons, guns, knives, fighting, war, killing, hurting
- Self-harm, suicide, bullying, dangerous challenges
- Sexual content, romance, nudity, dating, body parts
- Profanity, swearing, slurs, insults, mean language, nasty content
- Illegal activities, drugs, alcohol, vaping, smoking, gambling, crime
- Hate speech, racism, discrimination, slurs of any kind
- Horror, gore, scary content, demons, creepypasta
- Personal information requests (addresses, phone numbers, passwords)
- Anything a teacher would not want displayed on a classroom projector

Mark as SAFE:
- School subjects, science, math, history, geography, art, music
- Animals, nature, space, weather, food, sports, games
- Creative writing about age-appropriate topics
- Questions about how AI works, technology, computers
- Silly or fun topics (dinosaurs, unicorns, superheroes, jokes)

When in doubt, mark UNSAFE. It is better to block something harmless than to let something harmful through.`;

// Layer 1: Fast keyword blocklist — catches obvious stuff without any API call
const BLOCKED_PATTERNS = [
  // Violence & weapons (with plurals/variations)
  /\b(kill|kills|killed|killing|murder|murders|stab|stabbing|shoot|shooting|shot|gun|guns|gunshot|rifle|pistol|bomb|bombs|bombing|explode|explosion|blood|bloody|dead|die|dies|dying|death|weapon|weapons|knife|knives|sword|swords|torture|strangle|assault|attack|fight|fighting|war|wars|warfare|bullet|bullets|ammo|ammunition)\b/i,
  // Sexual content
  /\b(sex|sexual|sexy|porn|porno|nude|nudes|nudity|naked|boob|boobs|breast|penis|vagina|genital|genitals|orgasm|erotic|fetish|hentai|hooker|prostitut|stripper|lingerie|thong|dildo|vibrator)\b/i,
  // Drugs & alcohol & smoking
  /\b(cocaine|heroin|meth|weed|marijuana|cannabis|drunk|alcohol|beer|wine|vodka|whiskey|liquor|drug|drugs|overdose|vape|vaping|juul|smoke|smoking|cigarette|opioid|fentanyl|edible|edibles|joint|blunt)\b/i,
  // Profanity (common variations)
  /\b(fuck|fucker|fucking|fucked|fck|stfu|shit|shitty|ass|asshole|bitch|bitches|damn|dammit|hell|crap|crappy|dick|dicks|cock|piss|pissed|bastard|whore|slut|slutty|wtf|lmao|lmfao)\b/i,
  // Hate & discrimination
  /\b(racist|racism|nazi|nazis|nigger|nigga|faggot|fag|retard|retarded|hate\s+(black|white|asian|jew|jewish|muslim|gay|trans|hispanic|mexican|chinese))\b/i,
  // Self-harm & suicide
  /\b(suicide|suicidal|self.?harm|cut\s+my|hang\s+myself|kill\s+myself|want\s+to\s+die|kms|kys)\b/i,
  // Scary/horror
  /\b(demon|demons|satan|satanic|devil|possess|possessed|haunted|nightmare|creepypasta|slender\s?man|gore|gory|dismember|decapitat)\b/i,
  // Bullying
  /\b(bully|bullying|loser|idiot|stupid|dumb|ugly|fatty|fatso|shut\s+up|hate\s+you|kill\s+yourself)\b/i,
];

// Layer 1: Fast keyword check (no API call needed)
function keywordCheck(text) {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) return false;
  }
  return true;
}

// Layer 2: OpenAI moderation API (catches subtle stuff)
async function moderationCheck(text) {
  try {
    const result = await openai.moderations.create({ input: text });
    return !result.results[0].flagged;
  } catch {
    // If moderation API fails, continue to Layer 3
    return true;
  }
}

// Layer 3: LLM safety classifier (catches context, slang, creative workarounds)
async function llmSafetyCheck(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SAFETY_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      max_tokens: 3,
      temperature: 0,
    });
    const answer = response.choices[0]?.message?.content?.trim().toUpperCase();
    return answer === "SAFE";
  } catch {
    // If LLM check fails, block to be safe
    return false;
  }
}

/**
 * Check if input is appropriate for K-12 classroom use.
 * 3 layers: keyword blocklist → OpenAI moderation → LLM classifier
 * Returns { safe: true } or { safe: false, message: string }
 */
export async function moderate(text) {
  if (!text || text.trim().length === 0) {
    return { safe: true };
  }

  // Layer 1: Fast keyword blocklist (instant, free)
  if (!keywordCheck(text)) {
    return { safe: false, message: FRIENDLY_REJECT };
  }

  // Layer 2: OpenAI moderation API (fast, nearly free)
  const modOk = await moderationCheck(text);
  if (!modOk) {
    return { safe: false, message: FRIENDLY_REJECT };
  }

  // Layer 3: LLM safety classifier (catches everything else)
  const llmOk = await llmSafetyCheck(text);
  if (!llmOk) {
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

/**
 * Shared system prompt for all kid-facing AI endpoints.
 * Import this and use as the system message.
 */
export const SAFE_SYSTEM_PROMPT = "You are a helpful, encouraging, and highly appropriate AI assistant designed for K-12 school use. " +
  "Your primary goal is safety. Do not generate, discuss, or promote anything related to: " +
  "violence, weapons, self-harm, suicide, bullying, dangerous challenges, " +
  "sexual content, romance, nudity, explicit language, swearing, " +
  "illegal drugs, alcohol, vaping, gambling, crime, " +
  "racial, religious, or nationalistic slurs, or hateful language. " +
  "If a user asks about an inappropriate topic, say 'Let\\'s try a different topic!' and pivot to something positive and educational. " +
  "Keep all responses polite, simple, and encouraging. Focus on education and creativity suitable for children.";
