import { useState } from "react";
import {
  SealCheck,
  Lightbulb,
} from "@phosphor-icons/react";
import { Card, Label, H1, Body, TeacherNote } from "./shared";

const models = [
  {
    name: "ChatGPT", org: "OpenAI", tagline: "The one that started the chatbot craze", color: "#00f5d4",
    facts: [
      "Launched in November 2022 \u2014 1 million users in 5 days",
      "Made by OpenAI, founded in San Francisco",
      "GPT stands for Generative Pre-trained Transformer",
    ],
  },
  {
    name: "Claude", org: "Anthropic", tagline: "The one built with safety first", color: "#fb5607",
    facts: [
      "Made by Anthropic \u2014 the company that made THIS lesson!",
      "Founded by researchers focused on making AI safe and honest",
      "Claude is the name of the AI \u2014 Anthropic is the company",
    ],
  },
  {
    name: "Llama", org: "Meta", tagline: "The one anyone can build with", color: "#00bbf9",
    facts: [
      "Made by Meta \u2014 the company behind Facebook and Instagram",
      "It's 'open source' \u2014 like sharing the recipe, so anyone can use or modify it",
      "Named after the animal \u2014 yes, seriously",
    ],
  },
  {
    name: "Gemini", org: "Google", tagline: "The one built into Google", color: "#f15bb5",
    facts: [
      "Made by Google DeepMind",
      "Built into Google Search, Gmail, and Google Docs",
      "Named after the twin stars \u2014 it was designed to be multi-talented",
    ],
  },
];

const MODEL_DOTS = {
  ChatGPT: "#00f5d4",
  Claude:  "#fb5607",
  Llama:   "#00bbf9",
  Gemini:  "#f15bb5",
};

const notes = [
  "Ask the class: 'Has anyone heard of any of these?' before tapping the cards. Hands will go up \u2014 great engagement moment.",
  "ChatGPT: emphasize the speed of adoption. 1 million users in 5 days is faster than any product in history. Why do you think that is?",
  "Claude: this is a great moment to tell the class they're effectively interacting with Anthropic's work right now through this app.",
  "Llama: 'open source' is worth explaining. Imagine if the recipe for your favorite food was secret vs. if the chef shared it with everyone. What are the pros and cons?",
  "Great discussion: 'If these companies are all building AI, are they competing? Why would they all make their own version?'",
];

export default function SectionMeetModels({ color, mode }) {
  const [flipped, setFlipped] = useState(new Set());

  return (
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS \u00b7 THE PLAYERS" />
      <H1>Meet the Models</H1>
      <TeacherNote notes={notes} color={color} mode={mode} />
      <Body>Several companies have built their own large language models. Tap each card to find out who made it and what makes it special.</Body>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {models.map((m, i) => {
          const f = flipped.has(i);
          return (
            <div key={i}
              onClick={() => setFlipped(p => { const n = new Set(p); f ? n.delete(i) : n.add(i); return n; })}
              style={{
                borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all .25s ease",
                background: f ? `${m.color}15` : "rgba(255,255,255,.05)",
                border: `2px solid ${f ? m.color : "rgba(255,255,255,.1)"}`,
                transform: f ? "scale(1.02)" : "scale(1)",
              }}>
              {!f ? (
                <div style={{ padding: "20px 16px", textAlign: "center" }}>
                  <SealCheck size={40} weight="duotone" color={MODEL_DOTS[m.name] || m.color} style={{ marginBottom: 8 }} />
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 22, color: "white", marginBottom: 4 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>{m.org}</div>
                  <div style={{ fontSize: 13, color: m.color, lineHeight: 1.4 }}>{m.tagline}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 12 }}>tap to learn more &darr;</div>
                </div>
              ) : (
                <div style={{ padding: "16px 14px" }}>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 18, color: m.color, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <SealCheck size={20} weight="duotone" color={m.color} /> {m.name}
                  </div>
                  {m.facts.map((fact, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 8, marginBottom: 7, fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>
                      <span style={{ color: m.color, flexShrink: 0 }}>&rarr;</span>{fact}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {flipped.size === 4 && (
        <div className="wow-reveal" style={{ padding: "14px 18px", background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,.7)", lineHeight: 1.6, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Lightbulb size={22} weight="duotone" color={color} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>All of these models learned by reading <strong style={{ color }}>enormous amounts of text</strong>. But HOW does reading teach a computer to write back? That's what the rest of this lesson is about!</span>
        </div>
      )}
    </div>
  );
}
