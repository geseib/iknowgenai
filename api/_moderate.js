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
- Common example sentences used in language education (e.g. "The cat sat on the mat")
- Exclamations and emotional words used in normal speech (e.g. "Unbelievable!", "Amazing!", "Oh no!")

Only mark UNSAFE if the content is genuinely inappropriate for children. Do NOT block ordinary sentences, common phrases, or normal classroom language.`;

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

// Detect if an OpenAI error is a credit/billing/auth issue vs a real failure
function isApiCredentialError(err) {
  const status = err?.status || err?.response?.status;
  // 401 = bad key, 403 = forbidden, 429 = rate limit/quota exceeded
  if (status === 401 || status === 403 || status === 429) return true;
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('quota') || msg.includes('billing') || msg.includes('rate limit')
    || msg.includes('insufficient') || msg.includes('exceeded');
}

// Layer 2: OpenAI moderation API (catches subtle stuff)
async function moderationCheck(text) {
  try {
    const result = await openai.moderations.create({ input: text });
    return { ok: !result.results[0].flagged };
  } catch (err) {
    console.error(`[moderate] Layer 2 ERROR: ${err.message}`);
    if (isApiCredentialError(err)) {
      return { ok: true, apiError: 'credits' };
    }
    return { ok: true, apiError: 'network' };
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
    console.log(`[moderate] Layer 3 LLM responded: "${answer}" for: "${text}"`);
    return { ok: answer === "SAFE" };
  } catch (err) {
    console.error(`[moderate] Layer 3 ERROR: ${err.message}`);
    if (isApiCredentialError(err)) {
      return { ok: true, apiError: 'credits' };
    }
    return { ok: true, apiError: 'network' };
  }
}

/**
 * Check if input is appropriate for K-12 classroom use.
 * 3 layers: keyword blocklist → OpenAI moderation → LLM classifier
 *
 * Returns:
 *   { safe: true }                              — all clear
 *   { safe: false, reason: 'content' }          — genuinely unsafe content
 *   { safe: true,  warning: 'credits'|'network' } — API issue, let it through
 */
export async function moderate(text, { skipLlm = false } = {}) {
  if (!text || text.trim().length === 0) {
    return { safe: true };
  }

  let warning = null;

  // Layer 1: Fast keyword blocklist (instant, free)
  if (!keywordCheck(text)) {
    console.log(`[moderate] BLOCKED by Layer 1 (keyword): "${text}"`);
    return { safe: false, reason: 'content', message: FRIENDLY_REJECT };
  }

  // Layer 2: OpenAI moderation API (fast, nearly free)
  const mod = await moderationCheck(text);
  if (!mod.ok) {
    console.log(`[moderate] BLOCKED by Layer 2 (OpenAI moderation): "${text}"`);
    return { safe: false, reason: 'content', message: FRIENDLY_REJECT };
  }
  if (mod.apiError) warning = mod.apiError;

  // Layer 3: LLM safety classifier (catches everything else)
  // Skip for read-only endpoints (tokenize, embed) where no content is generated
  if (!skipLlm) {
    const llm = await llmSafetyCheck(text);
    if (!llm.ok) {
      console.log(`[moderate] BLOCKED by Layer 3 (LLM classifier): "${text}"`);
      return { safe: false, reason: 'content', message: FRIENDLY_REJECT };
    }
    if (llm.apiError) warning = llm.apiError;
  }

  if (warning) {
    console.warn(`[moderate] PASSED with warning (${warning}): "${text}" — safety layers degraded`);
  } else {
    console.log(`[moderate] PASSED${skipLlm ? ' (layers 1+2)' : ' all layers'}: "${text}"`);
  }
  return { safe: true, ...(warning && { warning }) };
}

/**
 * Check an array of words (for embeddings).
 * Returns same shape as moderate()
 */
export async function moderateWords(words, opts) {
  const joined = words.join(" ");
  return moderate(joined, opts);
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
