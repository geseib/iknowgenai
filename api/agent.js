import OpenAI from "openai";
import { moderate, SAFE_SYSTEM_PROMPT } from "./_moderate.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Small knowledge base for the search tool
const KNOWLEDGE_BASE = [
  { title: "AI Training Data", content: "Modern AI models like GPT-4 were trained on hundreds of billions of words from books, websites, and code. Training took months using thousands of specialized computer chips called GPUs." },
  { title: "The Moon", content: "The Moon is about 238,900 miles from Earth. It takes about 3 days to travel there by spacecraft. The first humans walked on the Moon on July 20, 1969 during the Apollo 11 mission." },
  { title: "Octopus Facts", content: "Octopuses have three hearts, blue blood, and nine brains (one central brain and one in each arm). They can change color and texture in milliseconds to camouflage." },
  { title: "School Pizza Party", content: "A large pizza typically has 8 slices. Most kids eat 2-3 slices. A large cheese pizza costs about $12-15. Don't forget napkins, plates, and drinks!" },
  { title: "Transformer Architecture", content: "The Transformer was invented in 2017 by researchers at Google in a paper called 'Attention Is All You Need'. It uses self-attention to process all words in parallel instead of one at a time." },
  { title: "World Records", content: "The tallest building is the Burj Khalifa at 2,717 feet. The fastest land animal is the cheetah at 70 mph. The largest ocean is the Pacific Ocean covering 63 million square miles." },
];

// Tool definitions for OpenAI function calling
const TOOL_DEFS = {
  calculator: {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform a math calculation. Use this for any arithmetic, multiplication, division, etc.",
      parameters: {
        type: "object",
        properties: {
          expression: { type: "string", description: "The math expression to evaluate, e.g. '847 * 293' or '50 / 3'" },
        },
        required: ["expression"],
      },
    },
  },
  get_date: {
    type: "function",
    function: {
      name: "get_date",
      description: "Get today's current date and time. Use this when asked about today, the current date, or time.",
      parameters: { type: "object", properties: {} },
    },
  },
  search_docs: {
    type: "function",
    function: {
      name: "search_docs",
      description: "Search a knowledge base for information. Use this when you need facts you might not know or aren't sure about.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
        },
        required: ["query"],
      },
    },
  },
};

// Execute a tool call
function executeTool(name, args) {
  if (name === "calculator") {
    try {
      // Safe math evaluation — only allow numbers and basic operators
      const expr = args.expression.replace(/[^0-9+\-*/.() ]/g, "");
      const result = Function(`"use strict"; return (${expr})`)();
      return String(result);
    } catch {
      return "Error: Could not calculate that expression";
    }
  }
  if (name === "get_date") {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
  }
  if (name === "search_docs") {
    const query = (args.query || "").toLowerCase();
    // Simple keyword matching
    const scored = KNOWLEDGE_BASE.map(doc => {
      const words = query.split(/\s+/);
      const score = words.filter(w => doc.title.toLowerCase().includes(w) || doc.content.toLowerCase().includes(w)).length;
      return { ...doc, score };
    }).filter(d => d.score > 0).sort((a, b) => b.score - a.score);
    if (scored.length === 0) return "No relevant documents found.";
    return scored.slice(0, 2).map(d => `[${d.title}]: ${d.content}`).join("\n\n");
  }
  return "Unknown tool";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { prompt, tools = [] } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });
  if (prompt.length > 500) return res.status(400).json({ error: "prompt too long" });

  const check = await moderate(prompt);
  if (!check.safe) return res.status(422).json({ error: "blocked", message: check.message });

  // Build tool list from enabled tools
  const enabledTools = tools
    .filter(t => TOOL_DEFS[t])
    .map(t => TOOL_DEFS[t]);

  const systemPrompt = SAFE_SYSTEM_PROMPT + `
You are helping students learn about AI tools and agents. Keep responses short (2-3 sentences).
If you have tools available, use them when appropriate — especially for math, dates, or facts you're unsure about.
If you don't have a needed tool, say so honestly.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const steps = [];
  const MAX_LOOPS = 4;

  try {
    for (let loop = 0; loop < MAX_LOOPS; loop++) {
      const params = {
        model: "gpt-4o-mini",
        messages,
        max_tokens: 200,
        temperature: 0.3,
      };
      if (enabledTools.length > 0) params.tools = enabledTools;

      const response = await openai.chat.completions.create(params);
      const choice = response.choices[0];

      // If the model wants to call tools
      if (choice.finish_reason === "tool_calls" || choice.message.tool_calls?.length > 0) {
        const toolCalls = choice.message.tool_calls;
        messages.push(choice.message); // add assistant message with tool calls

        for (const tc of toolCalls) {
          const fnName = tc.function.name;
          const fnArgs = JSON.parse(tc.function.arguments || "{}");

          steps.push({ type: "tool_call", tool: fnName, input: fnArgs.expression || fnArgs.query || "" });

          const result = executeTool(fnName, fnArgs);
          steps.push({ type: "tool_result", tool: fnName, output: result });

          messages.push({ role: "tool", tool_call_id: tc.id, content: result });
        }
        continue; // loop back for the model to use the tool results
      }

      // Final text response
      const text = choice.message.content || "";
      steps.push({ type: "response", content: text });
      break;
    }

    return res.status(200).json({ steps });
  } catch (err) {
    console.error("agent error:", err);
    return res.status(500).json({ error: err.message });
  }
}
