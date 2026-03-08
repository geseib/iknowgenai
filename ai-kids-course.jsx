import { useState } from "react";

// ── CSS ───────────────────────────────────────────────────────────────────────
const ALL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes twinkle { 0%{opacity:.1;transform:scale(.7)} 100%{opacity:.8;transform:scale(1.3)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes blobPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes probIn { from{width:0!important} }
  @keyframes wowReveal {
    0%{opacity:0;transform:translateY(18px) scale(.95)}
    65%{transform:translateY(-3px) scale(1.02)}
    100%{opacity:1;transform:translateY(0) scale(1)}
  }
  @keyframes popIn {
    0%{opacity:0;transform:scale(.8)}
    70%{transform:scale(1.05)}
    100%{opacity:1;transform:scale(1)}
  }
  .fade-up { animation: fadeUp .45s ease forwards; }
  .wow-reveal { animation: wowReveal .6s cubic-bezier(.34,1.56,.64,1) forwards; }
  .pop-in { animation: popIn .4s cubic-bezier(.34,1.56,.64,1) forwards; }
  .word-chip {
    display:inline-flex; align-items:center; padding:8px 14px; border-radius:10px;
    border:2px solid rgba(255,255,255,.18); background:rgba(255,255,255,.07); color:white;
    font-family:'Fredoka',sans-serif; font-size:17px; cursor:pointer;
    transition:all .2s ease; user-select:none;
  }
  .word-chip:hover{background:rgba(255,255,255,.13)}
  .word-chip.active{color:#000}
  .word-chip.lit{background:rgba(255,255,255,.12)}
  .layer-row {
    background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
    border-radius:12px; padding:13px 16px; cursor:pointer; transition:all .2s ease; margin-bottom:7px;
  }
  .layer-row:hover{background:rgba(255,255,255,.1)}
  .layer-row.open{background:rgba(255,255,255,.1)}
  .cta-btn {
    display:inline-flex; align-items:center; gap:7px; padding:11px 22px;
    border-radius:50px; border:none; font-family:'Fredoka',sans-serif;
    font-size:17px; font-weight:600; cursor:pointer; transition:all .18s ease;
  }
  .cta-btn:hover:not(:disabled){transform:scale(1.05)}
  .cta-btn:active:not(:disabled){transform:scale(.97)}
  .cta-btn:disabled{opacity:.4;cursor:default}
  .ghost-btn {
    display:inline-flex; align-items:center; gap:7px; padding:11px 22px; border-radius:50px;
    background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); color:white;
    font-family:'Fredoka',sans-serif; font-size:17px; font-weight:600; cursor:pointer; transition:all .18s ease;
  }
  .ghost-btn:hover:not(:disabled){background:rgba(255,255,255,.13)}
  .ghost-btn:disabled{opacity:.3;cursor:default}
  .temp-slider { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:3px; outline:none; cursor:pointer; background:transparent; }
  .temp-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:24px; height:24px; border-radius:50%; background:white; border:3px solid #000; cursor:pointer; transition:transform .15s ease; box-shadow:0 2px 8px rgba(0,0,0,.5); }
  .temp-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}
  .mode-card { transition:all .2s ease; cursor:pointer; }
  .mode-card:hover { transform:translateY(-4px); }
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
`;

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const COLORS = ["#00f5d4","#00bbf9","#fee440","#f15bb5","#9b5de5","#fb5607","#06d6a0","#00f5d4","#fee440","#f15bb5","#9b5de5","#00bbf9","#fb5607"];
const TOTAL  = 13;
const GROUPS = [
  { name:"Introduction",  emoji:"👋", start:0, end:2  },
  { name:"Meet the LLMs", emoji:"🤝", start:3, end:6  },
  { name:"How AI Thinks", emoji:"🧠", start:7, end:12 },
];
const TITLES = [
  "Who's Used AI? 🙋","What IS AI? 🤔","Rules vs Learning 📋",
  "Brain vs AI 🧠","What's an LLM? 📚","Meet the Models 🤝","The Big Question ❓",
  "Numbers & Words 🔢","Words in Space 🗺️","Attention! 🔦",
  "The Thinking Layer 🧠","Rinse & Repeat 🔁","Predict! 🔮",
];

// ── EMBEDDINGS DATA ───────────────────────────────────────────────────────────
const WORD_MAP = [
  {w:"cat",x:16,y:24,g:"animals"},{w:"dog",x:23,y:17,g:"animals"},
  {w:"bird",x:11,y:36,g:"animals"},{w:"fish",x:7,y:47,g:"animals"},
  {w:"king",x:66,y:14,g:"royalty"},{w:"queen",x:74,y:21,g:"royalty"},{w:"prince",x:61,y:29,g:"royalty"},
  {w:"pizza",x:37,y:73,g:"food"},{w:"burger",x:44,y:79,g:"food"},{w:"sushi",x:51,y:67,g:"food"},
  {w:"robot",x:80,y:69,g:"tech"},{w:"phone",x:75,y:77,g:"tech"},{w:"computer",x:86,y:62,g:"tech"},
  {w:"run",x:33,y:31,g:"action"},{w:"jump",x:41,y:25,g:"action"},{w:"swim",x:27,y:38,g:"action"},
];
const GC = {animals:"#fee440",royalty:"#f15bb5",food:"#fb5607",tech:"#00bbf9",action:"#9b5de5"};

// ── DIMENSION EXPLORER DATA ───────────────────────────────────────────────────
const P2_EMOJIS = {cat:"🐱",dog:"🐶",bird:"🐦",fish:"🐟",plane:"✈️",train:"🚂",car:"🚗",boat:"⛵"};
const P2_ANIMALS  = ["cat","dog","bird","fish"];
const P2_VEHICLES = ["plane","train","car","boat"];
const P2_STEPS = [
  {title:"Two neighbourhoods",body:"These 8 words live in totally different parts of vector space. Animals over here — vehicles over there.",dimLabel:null,scores:null,focusGroup:null},
  {title:"Let's zoom in on 🐱 cat and 🐶 dog",body:"They sit really close together. The AI thinks they're similar — but WHY? What's the same about them?",dimLabel:null,scores:null,focusGroup:"cd"},
  {title:"Dimension: Animal 🐾",body:"They're both animals! Cat and dog score HIGH. Plane and train score zero.",dimLabel:"Animal 🐾",scores:{cat:2,dog:2,bird:2,fish:2,plane:0,train:0,car:0,boat:0},focusGroup:"cd",dimColor:"#fee440"},
  {title:"Dimension: Has Fur 🪮",body:"Both cat and dog have fur. Bird has feathers. Fish has scales. Plane has... metal. Very different!",dimLabel:"Has Fur 🪮",scores:{cat:2,dog:2,bird:0,fish:0,plane:0,train:0,car:0,boat:0},focusGroup:"cd",dimColor:"#fb5607"},
  {title:"Dimension: Has 4 Legs 🦵",body:"Four legs each — confirmed. A bird has two. A fish has none. Each difference becomes different numbers!",dimLabel:"Has 4 Legs 🦵",scores:{cat:2,dog:2,bird:1,fish:0,plane:0,train:0,car:0,boat:0},focusGroup:"cd",dimColor:"#9b5de5"},
  {title:"Now look at 🐦 bird and ✈️ plane",body:"These live in different neighbourhoods... but do they share anything surprising?",dimLabel:null,scores:null,focusGroup:"bp"},
  {title:"Dimension: Has Wings 🪶",body:"Both bird AND plane score HIGH on wings! The AI noticed this connection across totally different groups.",dimLabel:"Has Wings 🪶",scores:{cat:0,dog:0,bird:2,fish:0,plane:2,train:0,car:0,boat:0},focusGroup:"bp",dimColor:"#00bbf9"},
  {title:"But... would you ride a bird to school? 🤔",body:"Plane scores HIGH on 'you can ride it'. Bird scores almost zero. Same wings — totally different purpose!",dimLabel:"You Can Ride It 🎫",scores:{cat:0,dog:0,bird:0,fish:0,plane:2,train:2,car:2,boat:2},focusGroup:"veh",dimColor:"#f15bb5"},
  {title:"Every word is a mix of ALL dimensions 💡",body:"Cat = [animal:high, fur:high, legs:high, wings:zero, rideable:zero...] × 12,288 dimensions. That's what those numbers actually mean!",dimLabel:"All dimensions at once",scores:{cat:2,dog:2,bird:1,fish:1,plane:2,train:2,car:2,boat:2},focusGroup:null,dimColor:"#fee440"},
];

// ── ATTENTION DATA ────────────────────────────────────────────────────────────
const BAT_S1 = ["I","swung","the","bat","and","hit","the","ball","!"];
const BAT_S2 = ["The","bat","flew","out","of","the","cave","at","dusk","."];
const BAT_A1 = {
  1:[.55,1.0,.08,.90,.10,.68,.08,.74,.05],
  3:[.42,.88,.08,1.0,.08,.84,.08,.92,.05],
  5:[.30,.72,.08,.88,.08,1.0,.08,.80,.05],
  7:[.22,.68,.08,.90,.08,.76,.08,1.0,.05],
};
const BAT_A2 = {
  1:[.12,1.0,.92,.20,.10,.12,.88,.15,.94,.05],
  2:[.10,.88,1.0,.18,.08,.10,.70,.12,.58,.05],
  6:[.08,.82,.68,.14,.08,.08,1.0,.12,.54,.05],
  8:[.08,.86,.62,.12,.08,.08,.58,.12,1.0,.05],
};

// ── PREDICT DATA ──────────────────────────────────────────────────────────────
const P_POSITIONS = [
  {candidates:[["The",-0.12],["A",-2.53],["One",-3.51]]},
  {candidates:[["sleepy",-0.89],["big",-1.20],["tiny",-1.24]]},
  {candidates:[["cat",-0.33],["dog",-1.66],["bird",-2.41]]},
  {candidates:[["sat",-0.46],["slept",-1.42],["napped",-2.04]]},
  {candidates:[["on",-0.09],["near",-2.81],["beside",-3.51]]},
  {candidates:[["a",-0.19],["the",-1.97],["my",-3.51]]},
  {candidates:[["warm",-0.94],["soft",-1.08],["cozy",-1.32]]},
  {candidates:[["mat",-0.40],["cushion",-1.56],["rug",-2.04]]},
  {candidates:[[".",-0.15],["!",-2.21],["?",-2.81]]},
];
function applyTemp(candidates,temp){
  if(temp<.08) return candidates.map(([w],i)=>({word:w,pct:i===0?100:0}));
  const scaled=candidates.map(([w,l])=>({word:w,exp:Math.exp(l/temp)}));
  const sum=scaled.reduce((a,b)=>a+b.exp,0);
  return scaled.map(s=>({word:s.word,pct:Math.round((s.exp/sum)*100)}));
}
function sampleWord(dist){
  const r=Math.random()*100; let acc=0;
  for(const d of dist){acc+=d.pct; if(r<acc) return d.word;}
  return dist[dist.length-1].word;
}
function tempMeta(t){
  if(t<.12) return{emoji:"🧊",name:"Frozen",bar:"#a0d8ef",desc:"Always picks the top word. Perfectly predictable — no surprises."};
  if(t<.45) return{emoji:"❄️",name:"Cold",bar:"#00f5d4",desc:"Sticks closely to likely words. Safe and sensible."};
  if(t<.85) return{emoji:"😊",name:"Balanced",bar:"#fee440",desc:"A nice mix — mostly sensible, occasionally creative."};
  if(t<1.3) return{emoji:"🔥",name:"Warm",bar:"#fb5607",desc:"Getting adventurous! Surprising words start appearing."};
  return {emoji:"🌋",name:"Wild",bar:"#f15bb5",desc:"Full chaos mode — literally anything could come next!"};
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Card({children,style}){
  return <div style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",borderRadius:16,padding:"20px 22px",...style}}>{children}</div>;
}
const Label=({color,text})=>(
  <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:12,color:`${color}99`,letterSpacing:2.5,textTransform:"uppercase",marginBottom:12}}>{text}</div>
);
const H1=({children})=>(
  <h1 style={{fontFamily:"'Fredoka',sans-serif",fontSize:40,fontWeight:700,color:"white",lineHeight:1.15,marginBottom:10}}>{children}</h1>
);
const Body=({children})=>(
  <p style={{color:"rgba(255,255,255,.62)",fontSize:16,lineHeight:1.65,marginBottom:18,maxWidth:500}}>{children}</p>
);
function TriviaBox({color,number,label,fact,visible}){
  if(!visible) return null;
  return(
    <div className="wow-reveal" style={{background:`${color}10`,border:`1px solid ${color}40`,borderRadius:14,padding:"16px 18px",marginTop:18}}>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:11,color:`${color}bb`,letterSpacing:2.5,textTransform:"uppercase",marginBottom:6}}>🤯 Wow Fact Unlocked!</div>
      {number&&<div style={{fontFamily:"'Fredoka',sans-serif",fontSize:44,fontWeight:700,color,lineHeight:1,marginBottom:2}}>{number}</div>}
      {label&&<div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,color:`${color}cc`,marginBottom:6}}>{label}</div>}
      <div style={{fontSize:14,color:"rgba(255,255,255,.62)",lineHeight:1.55}}>{fact}</div>
    </div>
  );
}
function TeacherNote({notes,color,mode}){
  const [open,setOpen]=useState(false);
  if(mode!=="classroom") return null;
  return(
    <div style={{marginBottom:14}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px dashed rgba(255,255,255,.18)",color:"rgba(255,255,255,.5)",fontFamily:"'Fredoka',sans-serif",fontSize:13,cursor:"pointer"}}>
        <span>👩‍🏫</span> Talking points {open?"▲":"▼"}
      </button>
      {open&&(
        <div style={{marginTop:8,padding:"14px 16px",background:`${color}08`,border:`1px solid ${color}28`,borderRadius:10,animation:"fadeUp .25s ease"}}>
          {notes.map((n,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<notes.length-1?10:0,fontSize:13.5,color:"rgba(255,255,255,.68)",lineHeight:1.6}}>
              <span style={{color,marginTop:2,flexShrink:0}}>•</span><span>{n}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function DiscussionGate({question,hint,color,mode,children}){
  const [revealed,setRevealed]=useState(mode==="solo");
  if(revealed) return <div style={{animation:"fadeUp .4s ease"}}>{children}</div>;
  return(
    <Card style={{textAlign:"center",padding:"32px 24px",marginBottom:16}}>
      <div style={{fontSize:36,marginBottom:14}}>💬</div>
      <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,color:"white",lineHeight:1.35,marginBottom:hint?10:22}}>{question}</div>
      {hint&&<div style={{fontSize:14,color:"rgba(255,255,255,.38)",marginBottom:22,fontStyle:"italic"}}>{hint}</div>}
      <button onClick={()=>setRevealed(true)} className="cta-btn" style={{background:color,color:"#000",margin:"0 auto"}}>Reveal →</button>
    </Card>
  );
}

// ── SECTION 0 ─────────────────────────────────────────────────────────────────
function SectionWhoIsHere({color,mode}){
  const [phase,setPhase]=useState(mode==="classroom"?-1:0);
  const [sel,setSel]=useState(new Set());
  const examples=[
    {emoji:"🗣️",label:"Siri or Alexa",desc:"Voice assistants"},
    {emoji:"🎬",label:"Netflix / YouTube",desc:"Video suggestions"},
    {emoji:"🎮",label:"Video games",desc:"Enemy AI & NPCs"},
    {emoji:"📸",label:"Phone camera",desc:"Face recognition"},
    {emoji:"💬",label:"ChatGPT / Claude",desc:"Chatbots"},
    {emoji:"🎵",label:"Spotify",desc:"Music suggestions"},
    {emoji:"🔍",label:"Google Search",desc:"Search predictions"},
    {emoji:"😊",label:"Snapchat / TikTok",desc:"Face filters & FYP"},
  ];
  const notes=[
    "Start with a show of hands: 'Raise your hand if you've ever talked to Siri, Alexa, or Google.' Most hands should go up immediately.",
    "Then: 'Keep your hand up if YouTube or Netflix has ever suggested something you actually liked.' This almost always gets every hand up — great moment to say that's AI at work.",
    "Don't pressure kids to define AI yet. You're just warming up and surfacing their existing experience. Accept all answers.",
    "Common misconceptions at this stage: kids often think AI only means robots or sci-fi computers. Reassure them the boring helpful everyday stuff counts too.",
    "If nobody raises their hand at first, try: 'Has anyone ever been recommended a song, video, or game by an app?' That usually unlocks it.",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · WARM UP"/>
      <H1>Who's Already Used AI? 🙋</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      {mode==="classroom"?(
        <DiscussionGate question="Raise your hand if you've ever used AI — or think you might have!" hint="Give the class 30 seconds to think and discuss..." color={color} mode={mode}>
          <Body>Here's something surprising — look at everything that already uses AI:</Body>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            {examples.map((e,i)=>(
              <Card key={i} style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:12,animation:`fadeUp .3s ${i*.05}s ease both`}}>
                <span style={{fontSize:26}}>{e.emoji}</span>
                <div>
                  <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:15,color:"white"}}>{e.label}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{e.desc}</div>
                </div>
              </Card>
            ))}
          </div>
          <div style={{padding:"14px 16px",background:`${color}12`,border:`1px solid ${color}35`,borderRadius:12,fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
            💡 <strong style={{color}}>AI is already everywhere.</strong> If you've ever gotten a suggestion from Netflix, YouTube, or Spotify — that was AI figuring out what you'd like!
          </div>
        </DiscussionGate>
      ):(
        <>
          {phase===0&&(
            <div style={{animation:"fadeUp .3s ease"}}>
              <Body>Tap everything you've used before:</Body>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {examples.map((e,i)=>{
                  const s=sel.has(i);
                  return(
                    <div key={i} onClick={()=>setSel(p=>{const n=new Set(p);s?n.delete(i):n.add(i);return n;})}
                      style={{padding:"12px 14px",borderRadius:14,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all .2s ease",
                        background:s?`${color}20`:"rgba(255,255,255,.04)",
                        border:`1.5px solid ${s?color:"rgba(255,255,255,.1)"}`,
                        transform:s?"scale(1.02)":"scale(1)"}}>
                      <span style={{fontSize:26}}>{e.emoji}</span>
                      <div>
                        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,color:"white"}}>{e.label}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{e.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {sel.size>0&&(
                <div style={{textAlign:"center",animation:"fadeUp .3s ease"}}>
                  <button onClick={()=>setPhase(1)} className="cta-btn" style={{background:color,color:"#000"}}>See what these have in common →</button>
                </div>
              )}
            </div>
          )}
          {phase===1&&(
            <div style={{animation:"fadeUp .4s ease"}}>
              <Card style={{textAlign:"center",padding:"28px 22px",marginBottom:16}}>
                <div style={{fontSize:48,marginBottom:12}}>🤯</div>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,color,marginBottom:12}}>All of those use AI!</div>
                <p style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.65}}>
                  AI isn't just robots in movies. It's already all around you — in your phone, your TV, your games. And today you're going to find out <strong style={{color}}>exactly how it works!</strong>
                </p>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── SECTION 1 ─────────────────────────────────────────────────────────────────
function SectionWhatIsAI({color,mode}){
  const [picked,setPicked]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const choices=[
    {id:"robot",emoji:"🤖",label:"A robot",response:"Great guess! But AI doesn't need a body. It can live entirely inside a computer — no arms, no legs required.",},
    {id:"program",emoji:"💻",label:"A really smart program",response:"You're onto something! It IS a program — but there's one important twist that makes it different from all other programs.",},
    {id:"brain",emoji:"🧠",label:"A digital brain",response:"Interesting! AI was inspired by how brains work — but it doesn't have feelings, memories between chats, or consciousness.",},
  ];
  const notes=[
    "Ask the class to vote by raising hands for each option. Tally roughly and tap the winning answer.",
    "'Robot' is the most common misconception — great teaching opportunity. AI is software, not hardware. It can run on a phone, a laptop, or a massive data center.",
    "'Smart program' is the closest — acknowledge that. The key nuance to tease out: what makes AI different from a calculator or a thermostat?",
    "'Digital brain' opens a great philosophical discussion. AI was inspired by neurons, but it doesn't have emotions or self-awareness. We're honest about that uncertainty.",
    "After the class votes and you reveal: ask 'what do you think ALL three answers are missing?' Then reveal the key insight below.",
  ];
  const choice=choices.find(c=>c.id===picked);
  return(
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · THE BIG QUESTION"/>
      <H1>What IS AI? 🤔</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      {mode==="classroom"?(
        <DiscussionGate question="Ask the class: what do YOU think AI is?" hint="Take a class vote — hold up fingers for 1, 2, or 3" color={color} mode={mode}>
          <Body>Three popular answers — tap the one your class voted for most:</Body>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            {choices.map((c)=>(
              <button key={c.id} onClick={()=>{setPicked(c.id);setRevealed(true);}}
                style={{display:"flex",alignItems:"center",gap:16,padding:"16px 18px",borderRadius:14,cursor:"pointer",transition:"all .2s ease",textAlign:"left",
                  background:picked===c.id?`${color}22`:"rgba(255,255,255,.05)",
                  border:`2px solid ${picked===c.id?color:"rgba(255,255,255,.12)"}`,
                  boxShadow:picked===c.id?`0 0 16px ${color}40`:"none"}}>
                <span style={{fontSize:36}}>{c.emoji}</span>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:"white"}}>{c.label}</div>
              </button>
            ))}
          </div>
          {revealed&&choice&&(
            <div style={{animation:"fadeUp .4s ease"}}>
              <Card style={{marginBottom:14,background:`${color}0d`,border:`1px solid ${color}35`}}>
                <p style={{fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.65}}>{choice.response}</p>
              </Card>
              <Card style={{background:"rgba(255,255,255,.04)"}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:"white",marginBottom:10}}>Here's what makes AI special 💡</div>
                <p style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.65}}>
                  A normal program follows <strong style={{color}}>rules someone wrote</strong> — like a recipe with exact steps.<br/><br/>
                  AI is different: it <strong style={{color}}>learns from examples</strong>. Nobody wrote the rules. It figured them out by looking at millions of examples, the same way you learned to talk by hearing people talk.
                </p>
              </Card>
            </div>
          )}
        </DiscussionGate>
      ):(
        <>
          {!picked?(
            <>
              <Body>What do you think AI is? Pick your best guess:</Body>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                {choices.map(c=>(
                  <button key={c.id} onClick={()=>setPicked(c.id)}
                    style={{display:"flex",alignItems:"center",gap:16,padding:"18px 20px",borderRadius:14,cursor:"pointer",textAlign:"left",background:"rgba(255,255,255,.05)",border:`2px solid ${color}45`,color:"white",transition:"all .15s ease"}}>
                    <span style={{fontSize:38}}>{c.emoji}</span>
                    <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18}}>{c.label}</div>
                  </button>
                ))}
              </div>
            </>
          ):(
            <div style={{animation:"fadeUp .4s ease"}}>
              <Card style={{marginBottom:14,background:`${color}0d`,border:`1px solid ${color}35`}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:36,marginBottom:8}}>{choice.emoji}</div>
                <p style={{fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.65}}>{choice.response}</p>
              </Card>
              <Card style={{background:"rgba(255,255,255,.04)"}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:"white",marginBottom:10}}>Here's what makes AI special 💡</div>
                <p style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.65}}>
                  A normal program follows <strong style={{color}}>rules someone wrote</strong> — like a recipe.<br/><br/>
                  AI is different: it <strong style={{color}}>learns from examples</strong>. Nobody wrote the rules. It figured them out by looking at millions of examples — the same way you learned to talk by hearing people talk.
                </p>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── SECTION 2 ─────────────────────────────────────────────────────────────────
function SectionProgramsVsAI({color,mode}){
  const [revealed,setRevealed]=useState(new Set());
  const scenarios=[
    {emoji:"🧮",label:"A calculator adds 2+2",answer:"regular",why:"The rule '2+2=4' was written in by a programmer. It never learned — it just follows instructions."},
    {emoji:"🐱",label:"An app tells a cat from a dog",answer:"ai",why:"No one wrote 'if pointy ears and whiskers, then cat.' It looked at millions of cat and dog photos and figured it out."},
    {emoji:"🚦",label:"Traffic lights change on a timer",answer:"regular",why:"It's just a countdown clock — the timing was programmed in. No learning, no adapting."},
    {emoji:"🎵",label:"Spotify picks your next song",answer:"ai",why:"It learned what songs you skip, replay, and like — and uses that to guess what you'll love next."},
    {emoji:"📱",label:"Your phone screen turns off after 30s",answer:"regular",why:"A programmer set the rule: 'after 30 seconds of no touching, turn off the screen.'"},
    {emoji:"📸",label:"Your camera auto-focuses on a face",answer:"ai",why:"It learned what faces look like from millions of photos. Nobody described a face in code."},
  ];
  const notes=[
    "The key concept here: traditional programming is explicit — every rule must be written out. AI is implicit — the rules emerge from patterns in data.",
    "Use the bike analogy: you can't learn to ride a bike by reading instructions. You learn by doing — falling, adjusting, improving. That's closer to how AI learns.",
    "A great class question: 'If I showed you 1,000 pictures of cats and 1,000 pictures of dogs, could you learn to tell them apart without anyone explaining the rules?' That's exactly what AI does.",
    "Watch for the misconception that 'AI = smart = always right.' Emphasize that AI learns from examples, so if the examples are bad, the AI learns bad patterns — this is called 'bias.'",
  ];
  const allRevealed=revealed.size===scenarios.length;
  return(
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · HOW AI IS DIFFERENT"/>
      <H1>Rules vs Learning 📋</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>Tap each scenario — is it a regular program following rules, or AI that learned from examples?</Body>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
        {scenarios.map((s,i)=>{
          const r=revealed.has(i);
          return(
            <div key={i} style={{borderRadius:14,overflow:"hidden",border:`1.5px solid ${r?(s.answer==="ai"?color:"rgba(255,255,255,.35)"):"rgba(255,255,255,.1)"}`,transition:"border-color .3s ease"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"rgba(255,255,255,.04)"}}>
                <span style={{fontSize:28}}>{s.emoji}</span>
                <div style={{flex:1,fontFamily:"'Fredoka',sans-serif",fontSize:15,color:"white"}}>{s.label}</div>
                {!r&&(
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setRevealed(p=>new Set([...p,i]))}
                      style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:`${color}20`,border:`1px solid ${color}50`,color}}>
                      Regular?
                    </button>
                    <button onClick={()=>setRevealed(p=>new Set([...p,i]))}
                      style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.2)",color:"white"}}>
                      AI?
                    </button>
                  </div>
                )}
                {r&&(
                  <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,fontWeight:700,color:s.answer==="ai"?color:"rgba(255,255,255,.7)",padding:"4px 12px",borderRadius:20,background:s.answer==="ai"?`${color}20`:"rgba(255,255,255,.08)"}}>
                    {s.answer==="ai"?"🤖 AI":"📋 Regular"}
                  </div>
                )}
              </div>
              {r&&(
                <div style={{padding:"10px 16px",background:`${color}08`,fontSize:13,color:"rgba(255,255,255,.6)",lineHeight:1.55,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                  {s.why}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allRevealed&&(
        <div className="wow-reveal" style={{padding:"14px 18px",background:`${color}12`,border:`1px solid ${color}35`,borderRadius:12,fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          💡 <strong style={{color}}>The big difference:</strong> A regular program needs someone to write every rule. AI learns the rules itself — just by looking at enough examples.
        </div>
      )}
    </div>
  );
}

// ── SECTION 3 ─────────────────────────────────────────────────────────────────
function SectionBrainVsAI({color,mode}){
  const [revealed,setRevealed]=useState(new Set());
  const rows=[
    {topic:"How it learns",brain:"From experience and practice",ai:"From millions of training examples",match:true},
    {topic:"Can make mistakes",brain:"Yes — humans get things wrong",ai:"Yes — AI gets things wrong too!",match:true},
    {topic:"Has emotions",brain:"Yes — fear, joy, love, boredom",ai:"No — it just processes text",match:false},
    {topic:"Gets tired",brain:"Yes — needs sleep and rest",ai:"No — it can run 24/7",match:false},
    {topic:"Remembers everything",brain:"No — we forget lots of things",ai:"Only what it was trained on",match:false},
    {topic:"Understands meaning",brain:"Deeply — we live in the world",ai:"Sort of — in a very different way",match:false},
    {topic:"Can be creative",brain:"Yes — art, music, stories",ai:"Sort of — by remixing patterns",match:true},
  ];
  const notes=[
    "Kids often ask 'does AI think like us?' — it's worth being honest: we don't fully know. What we do know is that it processes differently from a human brain.",
    "The 'can be creative' row often sparks good debate. AI combines and remixes patterns from training data. Is that 'real' creativity? Great open question for the class.",
    "Key point: AI was inspired by neurons and how brains connect, but an AI model is ultimately a giant math function — billions of multiplication operations happening in sequence.",
    "Avoid saying AI 'knows' or 'understands' things the way humans do. Safer phrasing: 'it processes' or 'it was trained on' to avoid overclaiming.",
    "Great discussion question: 'What would AI need to have before you'd say it was truly like a brain?'",
  ];
  const allDone=revealed.size===rows.length;
  return(
    <div className="fade-up">
      <Label color={color} text="INTRODUCTION · BRAIN VS AI"/>
      <H1>Brain vs AI 🧠</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>AI was inspired by the brain — but how similar are they really? Tap each row to find out.</Body>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {rows.map((r,i)=>{
          const rev=revealed.has(i);
          return(
            <div key={i} onClick={()=>!rev&&setRevealed(p=>new Set([...p,i]))}
              style={{borderRadius:12,border:`1.5px solid ${rev?(r.match?"rgba(255,255,255,.2)":color+"60"):"rgba(255,255,255,.1)"}`,cursor:rev?"default":"pointer",transition:"all .2s ease",overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"rgba(255,255,255,.04)"}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:15,color:"white"}}>{r.topic}</div>
                {!rev&&<span style={{fontSize:12,color:color,fontFamily:"'Fredoka',sans-serif"}}>tap to compare ↓</span>}
                {rev&&<div style={{fontSize:18}}>{r.match?"🤝":"🔀"}</div>}
              </div>
              {rev&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{padding:"10px 14px",background:"rgba(255,255,255,.03)"}}>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:"'Fredoka',sans-serif",marginBottom:4}}>🧠 BRAIN</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,.75)",lineHeight:1.5}}>{r.brain}</div>
                  </div>
                  <div style={{padding:"10px 14px",background:`${color}08`}}>
                    <div style={{fontSize:11,color:`${color}99`,fontFamily:"'Fredoka',sans-serif",marginBottom:4}}>🤖 AI</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,.75)",lineHeight:1.5}}>{r.ai}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allDone&&(
        <div className="wow-reveal" style={{padding:"14px 18px",background:`${color}12`,border:`1px solid ${color}35`,borderRadius:12,fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          💡 AI and brains have more in common than you'd expect — and more differences too. The truth is, AI is something genuinely <strong style={{color}}>new</strong>.
        </div>
      )}
    </div>
  );
}

// ── SECTION 4 ─────────────────────────────────────────────────────────────────
function SectionWhatIsLLM({color,mode}){
  const [step,setStep]=useState(0);
  const parts=[
    {letter:"L",word:"Large",emoji:"📚",reveal:"Trained on more text than you could read in 10,000 lifetimes. Books, websites, articles — all of it."},
    {letter:"L",word:"Language",emoji:"💬",reveal:"It works specifically with words and sentences. It reads text in, and writes text back out."},
    {letter:"M",word:"Model",emoji:"🔢",reveal:"A mathematical structure — billions of numbers arranged so that patterns in language get captured. Like a very complex recipe."},
  ];
  const notes=[
    "'Large' is worth dwelling on. GPT-4 was trained on roughly 1 trillion words. The entire English Wikipedia is about 4 billion words — so GPT read the equivalent of 250 Wikipedias.",
    "'Language' distinguishes LLMs from other types of AI (like image AI or audio AI). Some newer models are multimodal — they handle images too — but language is core.",
    "'Model' is the trickiest concept. A useful analogy: when you hear enough songs, your brain builds a model of what music sounds like. LLMs build a mathematical model of what language looks and sounds like.",
    "After revealing all three: 'So what's the most popular thing people use LLMs for?' → chatbots, writing help, coding help, answering questions.",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS · WHAT IS IT?"/>
      <H1>What's an LLM? 📚</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>LLM stands for <strong style={{color}}>Large Language Model</strong>. Three words — let's unpack them one at a time.</Body>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20,flexWrap:"wrap"}}>
        {parts.map((p,i)=>(
          <div key={i} style={{textAlign:"center",padding:"14px 18px",borderRadius:14,minWidth:88,
            background:step>i?`${color}18`:"rgba(255,255,255,.04)",
            border:`2px solid ${step>i?color:"rgba(255,255,255,.12)"}`,
            transition:"all .35s ease"}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:40,fontWeight:700,color:step>i?color:"rgba(255,255,255,.3)",lineHeight:1}}>{p.letter}</div>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,color:step>i?"white":"rgba(255,255,255,.3)",marginTop:4}}>{p.word}</div>
          </div>
        ))}
      </div>
      {step>0&&parts.slice(0,step).map((p,i)=>(
        <Card key={i} style={{marginBottom:10,animation:"fadeUp .35s ease",background:`${color}08`,border:`1px solid ${color}28`}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:32,fontWeight:700,color,minWidth:36}}>{p.letter}</div>
            <div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:17,color:"white",marginBottom:4}}>{p.emoji} {p.word}</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.65)",lineHeight:1.55}}>{p.reveal}</div>
            </div>
          </div>
        </Card>
      ))}
      {step<3&&(
        <div style={{textAlign:"center",marginTop:8}}>
          <button onClick={()=>setStep(s=>s+1)} className="cta-btn" style={{background:color,color:"#000"}}>
            {step===0?"Unpack the first letter →":"Next letter →"}
          </button>
        </div>
      )}
      {step===3&&(
        <div className="wow-reveal" style={{padding:"14px 18px",background:`${color}12`,border:`1px solid ${color}35`,borderRadius:12,marginTop:10,fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          💡 <strong style={{color}}>Large Language Model</strong> — a massive mathematical system that learned the patterns of human language by reading an enormous amount of text.
        </div>
      )}
    </div>
  );
}

// ── SECTION 5 ─────────────────────────────────────────────────────────────────
function SectionMeetModels({color,mode}){
  const [flipped,setFlipped]=useState(new Set());
  const models=[
    {name:"ChatGPT",org:"OpenAI",emoji:"🟢",tagline:"The one that started the chatbot craze",color:"#00f5d4",
      facts:["Launched in November 2022 — 1 million users in 5 days","Made by OpenAI, founded in San Francisco","GPT stands for Generative Pre-trained Transformer"]},
    {name:"Claude",org:"Anthropic",emoji:"🟠",tagline:"The one built with safety first",color:"#fb5607",
      facts:["Made by Anthropic — the company that made THIS lesson!","Founded by researchers focused on making AI safe and honest","Claude is the name of the AI — Anthropic is the company"]},
    {name:"Llama",org:"Meta",emoji:"🔵",tagline:"The one anyone can build with",color:"#00bbf9",
      facts:["Made by Meta — the company behind Facebook and Instagram","It's 'open source' — like sharing the recipe, so anyone can use or modify it","Named after the animal — yes, seriously 🦙"]},
    {name:"Gemini",org:"Google",emoji:"🔴",tagline:"The one built into Google",color:"#f15bb5",
      facts:["Made by Google DeepMind","Built into Google Search, Gmail, and Google Docs","Named after the twin stars — it was designed to be multi-talented"]},
  ];
  const notes=[
    "Ask the class: 'Has anyone heard of any of these?' before tapping the cards. Hands will go up — great engagement moment.",
    "ChatGPT: emphasize the speed of adoption. 1 million users in 5 days is faster than any product in history. Why do you think that is?",
    "Claude: this is a great moment to tell the class they're effectively interacting with Anthropic's work right now through this app.",
    "Llama: 'open source' is worth explaining. Imagine if the recipe for your favorite food was secret vs. if the chef shared it with everyone. What are the pros and cons?",
    "Great discussion: 'If these companies are all building AI, are they competing? Why would they all make their own version?'",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS · THE PLAYERS"/>
      <H1>Meet the Models 🤝</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>Several companies have built their own large language models. Tap each card to find out who made it and what makes it special.</Body>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {models.map((m,i)=>{
          const f=flipped.has(i);
          return(
            <div key={i} onClick={()=>setFlipped(p=>{const n=new Set(p);f?n.delete(i):n.add(i);return n;})}
              style={{borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"all .25s ease",
                background:f?`${m.color}15`:"rgba(255,255,255,.05)",
                border:`2px solid ${f?m.color:"rgba(255,255,255,.1)"}`,
                transform:f?"scale(1.02)":"scale(1)"}}>
              {!f?(
                <div style={{padding:"20px 16px",textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:8}}>{m.emoji}</div>
                  <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,color:"white",marginBottom:4}}>{m.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:10}}>{m.org}</div>
                  <div style={{fontSize:13,color:m.color,lineHeight:1.4}}>{m.tagline}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.25)",marginTop:12}}>tap to learn more ↓</div>
                </div>
              ):(
                <div style={{padding:"16px 14px"}}>
                  <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:m.color,marginBottom:10}}>{m.emoji} {m.name}</div>
                  {m.facts.map((fact,fi)=>(
                    <div key={fi} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,color:"rgba(255,255,255,.7)",lineHeight:1.5}}>
                      <span style={{color:m.color,flexShrink:0}}>→</span>{fact}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {flipped.size===4&&(
        <div className="wow-reveal" style={{padding:"14px 18px",background:`${color}12`,border:`1px solid ${color}35`,borderRadius:12,fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>
          💡 All of these models learned by reading <strong style={{color}}>enormous amounts of text</strong>. But HOW does reading teach a computer to write back? That's what the rest of this lesson is about!
        </div>
      )}
    </div>
  );
}

// ── SECTION 6 ─────────────────────────────────────────────────────────────────
function SectionTheBridge({color,mode}){
  const [phase,setPhase]=useState(0);
  const notes=[
    "This is the transition beat — use it as a dramatic pause before diving into the technical content.",
    "Good framing: 'We know what LLMs are and who makes them. Now we're going to open the hood and look at the engine. This is the part most adults don't know.'",
    "You can ask the class to predict: 'How do YOU think reading millions of books could teach a computer to write?' Take a few guesses. Don't reveal yet — let the curiosity build.",
    "The sections that follow (Numbers, Space, Attention, Thinking Layer, Predict) each answer a piece of this question. Remind kids they can hold questions and revisit.",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="MEET THE LLMS · THE BRIDGE"/>
      <H1>The Big Question ❓</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      {phase===0&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <Card style={{textAlign:"center",padding:"32px 24px",marginBottom:16}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:24,color:"white",lineHeight:1.5,marginBottom:20}}>
              These models read<br/><span style={{color,fontSize:32,fontWeight:700}}>billions of words...</span>
            </div>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,color:"rgba(255,255,255,.5)",marginBottom:20}}>
              ...but HOW did reading all that text teach them to <span style={{color:"white"}}>write and talk back?</span>
            </div>
            <button onClick={()=>setPhase(1)} className="cta-btn" style={{background:color,color:"#000",margin:"0 auto"}}>
              I want to know! →
            </button>
          </Card>
        </div>
      )}
      {phase===1&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <Body>Great question. Here's the short answer — then we're going to show you each piece live:</Body>
          {[
            {emoji:"🔢",step:"1",text:"Every word gets turned into a list of numbers the computer can work with."},
            {emoji:"🗺️",step:"2",text:"Those numbers place each word in a giant 'meaning space' where similar words cluster together."},
            {emoji:"🔦",step:"3",text:"The model learns to pay attention to the right words to understand what things mean in context."},
            {emoji:"🧠",step:"4",text:"It runs the information through many layers of 'thinking' to understand it more deeply."},
            {emoji:"🔮",step:"5",text:"Then it predicts the most likely next word — and repeats the whole thing, word by word."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:12,animation:`fadeUp .3s ${i*.08}s ease both`}}>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,fontWeight:700,color:"#000",background:color,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{s.step}</div>
              <div style={{fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.6}}><span style={{fontSize:18,marginRight:8}}>{s.emoji}</span>{s.text}</div>
            </div>
          ))}
          <div style={{textAlign:"center",marginTop:20}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:15,color:`${color}99`,marginBottom:10}}>Ready to see each step in action?</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SECTION 7 ─────────────────────────────────────────────────────────────────
function SectionHook({color,mode}){
  const [revealed,setRevealed]=useState(false);
  const nums=["0.23","-0.81","0.45","0.12","-0.67","0.89","-0.34","0.56","0.71","-0.22"];
  const notes=[
    "The goal here is jaw-dropping surprise. Pause after 'tap to reveal' and let the numbers appear without commentary first.",
    "After the numbers appear, ask the class: 'If these numbers somehow represent the word cat, what do you think they might be measuring?' Take guesses — 'cuteness', 'softness', 'smallness' are all valid intuitions.",
    "Key point: the AI doesn't process the letters C-A-T at all. It only ever sees the numbers. This is a genuinely counterintuitive fact that lands well with most people.",
    "Follow-up: 'How many numbers do you think represent one word?' Let them guess before revealing 12,288.",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 1"/>
      <H1>The Secret: Numbers 🔢</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>Before AI can think about words, it has to translate them into something computers understand: numbers. A <em>lot</em> of numbers.</Body>
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:34,color,background:`${color}18`,border:`2px solid ${color}50`,borderRadius:10,padding:"10px 18px"}}>"cat"</div>
          <div style={{fontSize:26,color:"rgba(255,255,255,.3)"}}>→</div>
          {!revealed?(
            <button onClick={()=>setRevealed(true)} style={{fontFamily:"'Fredoka',sans-serif",fontSize:15,color:`${color}99`,background:`${color}12`,border:`1px dashed ${color}50`,borderRadius:10,padding:"10px 18px",cursor:"pointer"}}>
              tap to reveal ✨
            </button>
          ):(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
              {nums.map((n,i)=>(
                <span key={i} style={{fontFamily:"monospace",fontSize:13,background:"rgba(255,255,255,.07)",borderRadius:6,padding:"3px 7px",color:"rgba(255,255,255,.8)",animation:`slideIn .25s ${i*.04}s ease both`}}>{n}</span>
              ))}
              <span style={{fontFamily:"monospace",fontSize:13,background:"rgba(255,255,255,.07)",borderRadius:6,padding:"3px 7px",color:`${color}99`,animation:`slideIn .25s ${nums.length*.04}s ease both`}}>...+12,278 more</span>
            </div>
          )}
        </div>
        {revealed&&(
          <p style={{marginTop:14,color:"rgba(255,255,255,.55)",fontSize:14}}>
            Every word becomes a list of numbers called a <span style={{color,fontWeight:700}}>vector</span>. The AI never reads the actual letters!
          </p>
        )}
      </Card>
      <TriviaBox visible={revealed} color={color} number="12,288" label="numbers per word"
        fact="Claude turns every single word-token into 12,288 numbers. That's more numbers than seconds in a 3.5-hour movie!"/>
    </div>
  );
}

// ── SECTION 8 ─────────────────────────────────────────────────────────────────
function DimensionExplorer({color,onComplete}){
  const [step,setStep]=useState(0);
  const s=P2_STEPS[step];
  const isLast=step===P2_STEPS.length-1;
  const advance=()=>{ if(isLast) onComplete(); else setStep(i=>i+1); };
  const inFocus=(w)=>{
    if(!s.focusGroup) return true;
    if(s.focusGroup==="cd") return w==="cat"||w==="dog";
    if(s.focusGroup==="bp") return w==="bird"||w==="plane";
    if(s.focusGroup==="veh") return P2_VEHICLES.includes(w);
    return true;
  };
  const scoreOf=(w)=>s.scores?(s.scores[w]??0):null;
  const chipStyle=(w)=>{
    const sc=scoreOf(w); const focused=inFocus(w); const dc=s.dimColor||color;
    if(sc===null) return{opacity:focused?1:.25,background:focused?"rgba(255,255,255,.1)":"rgba(255,255,255,.03)",border:`1.5px solid ${focused?"rgba(255,255,255,.35)":"rgba(255,255,255,.08)"}`,color:focused?"white":"rgba(255,255,255,.35)",transform:focused?"scale(1.05)":"scale(.97)",boxShadow:"none"};
    if(sc===2) return{opacity:1,background:`${dc}22`,border:`2px solid ${dc}`,color:"white",transform:"scale(1.08)",boxShadow:`0 0 14px ${dc}60`};
    if(sc===1) return{opacity:.65,background:`${dc}10`,border:`1.5px solid ${dc}55`,color:"rgba(255,255,255,.7)",transform:"scale(1.0)",boxShadow:"none"};
    return{opacity:.2,background:"rgba(255,255,255,.03)",border:"1.5px solid rgba(255,255,255,.08)",color:"rgba(255,255,255,.3)",transform:"scale(.95)",boxShadow:"none"};
  };
  return(
    <div style={{animation:"fadeUp .4s ease"}} key={step}>
      <div style={{display:"flex",gap:5,marginBottom:16,justifyContent:"center"}}>
        {P2_STEPS.map((_,i)=>(
          <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i<=step?(s.dimColor||color):"rgba(255,255,255,.15)",transition:"all .3s ease"}}/>
        ))}
      </div>
      {s.dimLabel&&(
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:15,fontWeight:600,padding:"6px 18px",borderRadius:20,background:`${s.dimColor||color}20`,border:`1.5px solid ${s.dimColor||color}60`,color:s.dimColor||color,animation:"fadeUp .35s ease"}}>{s.dimLabel}</div>
        </div>
      )}
      <Card style={{marginBottom:14,padding:"18px 16px"}}>
        <div style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",letterSpacing:2,color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>🐾 Animals</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:18,flexWrap:"wrap"}}>
          {P2_ANIMALS.map(w=>(
            <div key={w} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .35s ease",...chipStyle(w)}}>
              <div style={{fontSize:26}}>{P2_EMOJIS[w]}</div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14}}>{w}</div>
              {s.scores!==null&&<div style={{width:28,height:4,borderRadius:2,background:scoreOf(w)===2?(s.dimColor||color):scoreOf(w)===1?`${s.dimColor||color}60`:"rgba(255,255,255,.1)",transition:"background .4s ease"}}/>}
            </div>
          ))}
        </div>
        <div style={{height:1,background:"rgba(255,255,255,.07)",marginBottom:16}}/>
        <div style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",letterSpacing:2,color:"rgba(255,255,255,.3)",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>🚗 Vehicles</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {P2_VEHICLES.map(w=>(
            <div key={w} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .35s ease",...chipStyle(w)}}>
              <div style={{fontSize:26}}>{P2_EMOJIS[w]}</div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14}}>{w}</div>
              {s.scores!==null&&<div style={{width:28,height:4,borderRadius:2,background:scoreOf(w)===2?(s.dimColor||color):scoreOf(w)===1?`${s.dimColor||color}60`:"rgba(255,255,255,.1)",transition:"background .4s ease"}}/>}
            </div>
          ))}
        </div>
      </Card>
      <Card style={{marginBottom:16}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,color:"white",marginBottom:8,lineHeight:1.3}}>{s.title}</div>
        <div style={{fontSize:15,color:"rgba(255,255,255,.62)",lineHeight:1.6}}>{s.body}</div>
      </Card>
      <div style={{textAlign:"center"}}>
        <button onClick={advance} className="cta-btn" style={{background:s.dimColor||color,color:"#000"}}>{isLast?"Got it! 🎉":"Next →"}</button>
      </div>
    </div>
  );
}

function SectionEmbeddings({color,mode}){
  const [sel,setSel]=useState(null);
  const [hasClicked,setHasClicked]=useState(false);
  const [showPart2,setShowPart2]=useState(false);
  const [part2Done,setPart2Done]=useState(false);
  const selGroup=sel?WORD_MAP.find(w=>w.w===sel)?.g:null;
  const handleClick=(word)=>{setSel(s=>s===word?null:word);setHasClicked(true);};
  const notes=[
    "Part 1: Let kids tap words freely. Ask: 'Why do you think king and queen are close together but far from pizza?' The answer is that similarity in meaning = closeness in space.",
    "When a kid finds a cluster: 'What do all the words in that group have in common?' Then: 'What would you call the dimension that connects them?'",
    "Part 2 (Dimensions): Go slowly through each dimension. Let the class name the dimension BEFORE revealing it. 'What do cat and dog have in common that bird doesn't?' is a genuinely fun puzzle.",
    "The bird/plane 'Has Wings' moment usually gets a reaction — point out that AI discovered this cross-group similarity on its own from training data, nobody programmed it.",
    "The finale (12,288 dimensions) is the payoff. Ask: 'If you could measure a word along 12,288 different axes, do you think you could capture everything about what it means?'",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 2"/>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      {!showPart2?(
        <>
          <H1>Words in Space 🗺️</H1>
          <Body>Those 12,288 numbers act like <strong style={{color}}>coordinates</strong>, placing each word in a giant space. Similar words end up <em>close together</em>. Tap any word to see its neighbours!</Body>
          <Card style={{marginBottom:10,padding:"14px 14px"}}>
            <div style={{position:"relative",width:"100%",paddingTop:"52%",background:"rgba(255,255,255,.03)",borderRadius:10,overflow:"hidden"}}>
              {[{g:"animals",x:4,y:5,l:"🐾 Animals"},{g:"royalty",x:58,y:4,l:"👑 Royalty"},{g:"food",x:30,y:57,l:"🍕 Food"},{g:"tech",x:73,y:53,l:"💻 Tech"},{g:"action",x:26,y:16,l:"⚡ Actions"}].map(cl=>(
                <div key={cl.g} style={{position:"absolute",left:`${cl.x}%`,top:`${cl.y}%`,fontSize:11,fontFamily:"'Fredoka',sans-serif",fontWeight:600,letterSpacing:.8,pointerEvents:"none",transition:"color .3s",color:selGroup===cl.g?GC[cl.g]:"rgba(255,255,255,.25)"}}>{cl.l}</div>
              ))}
              <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
                {selGroup&&WORD_MAP.filter(w=>w.g===selGroup&&w.w!==sel).map(w=>{
                  const from=WORD_MAP.find(x=>x.w===sel);
                  return <line key={w.w} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${w.x}%`} y2={`${w.y}%`} stroke={GC[selGroup]} strokeWidth={1.5} strokeOpacity={.45} strokeDasharray="4 3"/>;
                })}
              </svg>
              {WORD_MAP.map(w=>{
                const gc=GC[w.g];const isMe=w.w===sel;const sg=selGroup&&w.g===selGroup;
                return(<div key={w.w} onClick={()=>handleClick(w.w)} style={{position:"absolute",left:`${w.x}%`,top:`${w.y}%`,transform:"translate(-50%,-50%)",fontFamily:"'Fredoka',sans-serif",fontSize:13,fontWeight:isMe?700:500,color:(isMe||sg)?gc:"rgba(255,255,255,.45)",padding:"2px 7px",borderRadius:20,background:isMe?`${gc}28`:sg?`${gc}12`:"transparent",border:isMe?`1px solid ${gc}70`:"1px solid transparent",cursor:"pointer",transition:"all .2s ease",whiteSpace:"nowrap",zIndex:isMe?10:1}}>{w.w}</div>);
              })}
            </div>
          </Card>
          {sel&&(<div style={{padding:"10px 14px",background:`${GC[selGroup]}12`,border:`1px solid ${GC[selGroup]}35`,borderRadius:10,fontSize:14,color:"rgba(255,255,255,.75)",marginBottom:10}}><span style={{color:GC[selGroup],fontWeight:700}}>"{sel}"</span> is close to other <span style={{color:GC[selGroup]}}>{selGroup}</span> words — similar ideas cluster together in vector space!</div>)}
          {hasClicked&&(<div style={{textAlign:"center",marginTop:16,animation:"fadeUp .4s ease"}}><div style={{fontSize:14,color:"rgba(255,255,255,.4)",marginBottom:10}}>But <em>why</em> are similar words close? Ready to find out?</div><button onClick={()=>setShowPart2(true)} className="cta-btn" style={{background:color,color:"#000"}}>Part 2: Inside the Dimensions →</button></div>)}
        </>
      ):(
        <>
          <H1>Inside the Dimensions 🔭</H1>
          <Body>Each word is measured on <strong style={{color}}>thousands of dimensions</strong> at once — like "animal", "has wings", "you can ride it". Let's discover them one at a time.</Body>
          <DimensionExplorer color={color} onComplete={()=>setPart2Done(true)}/>
        </>
      )}
      <TriviaBox visible={part2Done} color={color} number="50,257" label="tokens in vocabulary"
        fact="Claude knows over 50,000 word-pieces (tokens). Every one has its own unique set of 12,288 coordinates — one per dimension — in meaning space."/>
    </div>
  );
}

// ── SECTION 9 ─────────────────────────────────────────────────────────────────
function AttentionSentence({words,attnMap,color,label,meaning,meaningEmoji}){
  const [active,setActive]=useState(null);
  const [explored,setExplored]=useState(new Set());
  const weights=active!==null?(attnMap[active]??null):null;
  const handleClick=(i)=>{if(!(i in attnMap))return;setActive(a=>a===i?null:i);setExplored(s=>new Set([...s,i]));};
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",letterSpacing:2,color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:10}}>{label}</div>
      <Card style={{padding:"16px 16px"}}>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:active!==null?14:0}}>
          {words.map((w,i)=>{
            const clickable=i in attnMap;const isActive=i===active;
            const wt=weights?(weights[i]??0):0;const isLit=active!==null&&i!==active&&wt>.3;
            const isPunct=w==="!"||w===".";
            return(
              <div key={i} style={{textAlign:"center"}}>
                <div className={`word-chip${isActive?" active":""}${isLit?" lit":""}`} onClick={()=>handleClick(i)}
                  style={{padding:isPunct?"8px 8px":undefined,background:isActive?color:isLit?`${color}22`:undefined,borderColor:isActive?color:isLit?`${color}${Math.round(wt*200).toString(16).padStart(2,"0")}`:clickable?`${color}45`:"rgba(255,255,255,.1)",boxShadow:isActive?`0 0 16px ${color}70`:isLit?`0 0 ${Math.round(wt*10)}px ${color}55`:undefined,cursor:clickable?"pointer":"default",opacity:!clickable&&active!==null?.3:1,fontSize:clickable?17:15,color:isActive?"#000":undefined}}>{w}</div>
                {weights&&wt>.3&&i!==active&&(<div style={{height:3,background:color,opacity:Math.min(wt,1),width:`${Math.min(wt,1)*100}%`,margin:"5px auto 0",borderRadius:2,animation:"probIn .4s ease"}}/>)}
              </div>
            );
          })}
        </div>
        {active!==null&&(<div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:10,fontSize:14,color:"rgba(255,255,255,.6)",animation:"fadeUp .25s ease"}}><span style={{color,fontWeight:700}}>"{words[active]}"</span> is pulling hard on the glowing words — those clues are how it knows this bat means <span style={{color,fontWeight:700}}>{meaningEmoji} {meaning}</span>!</div>)}
      </Card>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}>
        {Object.keys(attnMap).map(i=>(<div key={i} style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",padding:"2px 8px",borderRadius:10,background:explored.has(parseInt(i))?`${color}20`:"rgba(255,255,255,.05)",border:`1px solid ${explored.has(parseInt(i))?color+"50":"rgba(255,255,255,.1)"}`,color:explored.has(parseInt(i))?color:"rgba(255,255,255,.3)",transition:"all .2s ease"}}>tap "{words[i]}"</div>))}
      </div>
    </div>
  );
}

function SectionAttention({color,mode}){
  const [phase,setPhase]=useState(0);
  const [guess,setGuess]=useState(null);
  const [s1words,setS1words]=useState(0);
  const [s2words,setS2words]=useState(0);
  const notes=[
    "Phase 0 (The Guess): Don't tell the class the answer — genuinely ask for a show of hands. Both 'baseball bat' and 'flying bat' should get votes. Perfect.",
    "Phase 1 (Both right): The key insight is 'the AI has to figure it out without the picture in their head'. Ask: how would YOU tell someone which kind of bat you meant, using only words?",
    "Phase 2 (Sentence 1): Read the sentence aloud as the words appear. When the answer reveals, ask: which words were the clues? 'Swung', 'hit', and 'ball' are all baseball vocabulary.",
    "Phase 3 (Sentence 2): Same exercise. Ask the class to predict the clue words BEFORE tapping them. 'Flew', 'cave', and 'dusk' — all animal/nature vocabulary.",
    "Phase 4 (Explore): Let kids tap individual words and see the attention patterns. Ask: 'Does bat pay attention to the same words in sentence 1 vs sentence 2?' (It doesn't — this is the whole point.)",
  ];
  const revealSentence=(setter,total)=>{
    let i=1; const tick=()=>{setter(i);i++;if(i<=total)setTimeout(tick,160);};
    setTimeout(tick,300);
  };
  const goPhase=(n)=>{setPhase(n);if(n===2)revealSentence(setS1words,BAT_S1.length);if(n===3)revealSentence(setS2words,BAT_S2.length);};
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 3"/>
      <H1>Attention! 🔦</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      {phase===0&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <Body>The AI just got handed one single word. What do <em>you</em> think it means?</Body>
          <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:72,lineHeight:1,textAlign:"center",padding:"18px 32px",background:`${color}15`,border:`2px solid ${color}40`,borderRadius:20}}>bat</div>
          </div>
          <div style={{fontSize:16,color:"rgba(255,255,255,.5)",textAlign:"center",marginBottom:18}}>Tap what you think it is 👇</div>
          <div style={{display:"flex",gap:16,justifyContent:"center"}}>
            {[{id:"bat",emoji:"🏏",label:"Baseball bat"},{id:"animal",emoji:"🦇",label:"Flying animal"}].map(opt=>(
              <button key={opt.id} onClick={()=>{setGuess(opt.id);goPhase(1);}}
                style={{fontFamily:"'Fredoka',sans-serif",fontSize:17,fontWeight:600,padding:"18px 24px",borderRadius:16,border:`2px solid ${color}50`,background:`${color}10`,color:"white",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,transition:"all .15s ease",minWidth:130}}>
                <span style={{fontSize:44}}>{opt.emoji}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {phase===1&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:22}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:52}}>{guess==="bat"?"🏏":"🦇"}</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,color,marginTop:4}}>Your guess</div></div>
            <div style={{fontSize:32,color:"rgba(255,255,255,.2)",alignSelf:"center"}}>+</div>
            <div style={{textAlign:"center"}}><div style={{fontSize:52}}>{guess==="bat"?"🦇":"🏏"}</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,color:"rgba(255,255,255,.4)",marginTop:4}}>Also right!</div></div>
          </div>
          <Card style={{marginBottom:20}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,color:"white",marginBottom:10}}>You're right... AND wrong 😄</div>
            <p style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.65}}><strong style={{color}}>"bat"</strong> can mean both things! But here's the AI's problem — it only sees text. No picture, no voice. It has to figure out the right meaning from the <strong style={{color}}>other words around it</strong>.</p>
          </Card>
          <div style={{textAlign:"center"}}><button onClick={()=>goPhase(2)} className="cta-btn" style={{background:color,color:"#000"}}>Show me how →</button></div>
        </div>
      )}
      {phase===2&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:16,color:"rgba(255,255,255,.45)",marginBottom:14}}>Now watch what happens when we add more words...</div>
          <Card style={{marginBottom:20,padding:"20px 18px"}}>
            <div style={{display:"flex",gap:9,flexWrap:"wrap",minHeight:48,alignItems:"center"}}>
              {BAT_S1.map((w,i)=>(<span key={i} style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,color:w==="bat"?color:i<s1words?"white":"transparent",fontWeight:w==="bat"?700:400,background:w==="bat"?`${color}18`:"transparent",padding:w==="bat"?"2px 8px":"2px 0",borderRadius:w==="bat"?8:0,transition:"color .2s ease"}}>{w}</span>))}
            </div>
          </Card>
          {s1words>=BAT_S1.length&&(
            <div style={{animation:"fadeUp .5s ease"}}>
              <Card style={{marginBottom:18,background:"#fee44010",border:"1px solid #fee44035"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:40}}>🏏</span><div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:"#fee440",marginBottom:4}}>Baseball bat!</div><p style={{fontSize:14,color:"rgba(255,255,255,.6)",lineHeight:1.55}}>"Swung", "hit", and "ball" are all screaming baseball. The AI's attention locked onto those words!</p></div></div>
              </Card>
              <div style={{textAlign:"center"}}><button onClick={()=>goPhase(3)} className="cta-btn" style={{background:color,color:"#000"}}>Now try a different sentence →</button></div>
            </div>
          )}
        </div>
      )}
      {phase===3&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:16,color:"rgba(255,255,255,.45)",marginBottom:14}}>Same word. Totally different sentence...</div>
          <Card style={{marginBottom:20,padding:"20px 18px"}}>
            <div style={{display:"flex",gap:9,flexWrap:"wrap",minHeight:48,alignItems:"center"}}>
              {BAT_S2.map((w,i)=>(<span key={i} style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,color:w==="bat"?color:i<s2words?"white":"transparent",fontWeight:w==="bat"?700:400,background:w==="bat"?`${color}18`:"transparent",padding:w==="bat"?"2px 8px":"2px 0",borderRadius:w==="bat"?8:0,transition:"color .2s ease"}}>{w}</span>))}
            </div>
          </Card>
          {s2words>=BAT_S2.length&&(
            <div style={{animation:"fadeUp .5s ease"}}>
              <Card style={{marginBottom:18,background:"#9b5de510",border:"1px solid #9b5de535"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:40}}>🦇</span><div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:18,color:"#9b5de5",marginBottom:4}}>Flying animal!</div><p style={{fontSize:14,color:"rgba(255,255,255,.6)",lineHeight:1.55}}>"Flew", "cave", and "dusk" light up now. Same word — completely different meaning because of the context!</p></div></div>
              </Card>
              <div style={{textAlign:"center"}}><button onClick={()=>goPhase(4)} className="cta-btn" style={{background:color,color:"#000"}}>Now I want to explore! →</button></div>
            </div>
          )}
        </div>
      )}
      {phase===4&&(
        <div style={{animation:"fadeUp .4s ease"}}>
          <Body>Tap the <span style={{color,fontWeight:700}}>highlighted words</span> in each sentence to see what the AI's spotlight pays attention to.</Body>
          <AttentionSentence words={BAT_S1} attnMap={BAT_A1} color="#fee440" label='🏏 Sentence 1 — "baseball bat"' meaning="baseball bat" meaningEmoji="🏏"/>
          <AttentionSentence words={BAT_S2} attnMap={BAT_A2} color="#9b5de5" label='🦇 Sentence 2 — "flying bat"' meaning="flying animal" meaningEmoji="🦇"/>
          <div style={{padding:"14px 16px",background:`${color}10`,border:`1px solid ${color}30`,borderRadius:12,marginBottom:6,fontSize:14,color:"rgba(255,255,255,.65)",lineHeight:1.6}}>
            💡 <strong style={{color}}>That's attention!</strong> Same word, completely different meaning depending on which other words are shining their spotlight on it.
          </div>
        </div>
      )}
      <TriviaBox visible={phase===4} color={color} number="96" label="attention heads at once"
        fact="Claude runs 96 different spotlights at the same time — each one looking for different types of relationships. It's like 96 readers, each hunting for something different in the same sentence."/>
    </div>
  );
}

// ── SECTION 10 ────────────────────────────────────────────────────────────────
function SectionMLP({color,mode}){
  const [phase,setPhase]=useState(0);const [hasRun,setHasRun]=useState(false);
  const running=phase>0&&phase<4;
  const run=()=>{setPhase(1);setHasRun(true);setTimeout(()=>setPhase(2),700);setTimeout(()=>setPhase(3),1400);setTimeout(()=>setPhase(4),2200);};
  const notes=[
    "Analogy that works well: attention is reading the room and figuring out who's related to whom. MLP is flipping through your entire memory to decide what it all means.",
    "The 4× expansion in the hidden layer is worth pausing on. Ask: 'Why would you make it bigger in the middle?' Answer: more room to consider possibilities before narrowing back down.",
    "A good physical analogy: breathing in deeply before answering a hard question. The 'expand then compress' pattern gives the model room to think.",
    "After the animation: 'Every single layer of the model does Attention + MLP, then passes the result to the next layer. How many layers do you think there are?' (96)",
  ];
  const Nodes=({count,lit})=>(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>{Array.from({length:count},(_,i)=>(<div key={i} style={{width:16,height:16,borderRadius:"50%",background:lit?color:"rgba(255,255,255,.14)",border:`1.5px solid ${lit?color:"rgba(255,255,255,.2)"}`,boxShadow:lit?`0 0 8px ${color}`:"none",transition:"all .35s ease"}}/>))}</div>);
  const Arrow=({lit})=>(<div style={{display:"flex",alignItems:"center"}}><div style={{width:28,height:2,background:lit?color:"rgba(255,255,255,.15)",transition:"background .35s ease",boxShadow:lit?`0 0 6px ${color}`:"none"}}/><div style={{width:0,height:0,borderTop:"5px solid transparent",borderBottom:"5px solid transparent",borderLeft:`7px solid ${lit?color:"rgba(255,255,255,.15)"}`,transition:"border-color .35s ease"}}/></div>);
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 4"/>
      <H1>The Thinking Layer 🧠</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>Attention figured out <em>which words relate</em>. Now the MLP layer does the heavy thinking — connecting what it's reading to <strong style={{color}}>everything it ever learned</strong>.</Body>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",marginBottom:20,flexWrap:"wrap",gap:12}}>
          {[{label:"Input",nodes:5,lit:phase>=1,desc:"Context from Attention"},{label:"Hidden",nodes:8,lit:phase>=2,desc:"4× bigger! Room to think"},{label:"Output",nodes:5,lit:phase>=3,desc:"Richer, smarter signal"}].map((l,i,arr)=>(
            <div key={l.label} style={{display:"contents"}}>
              <div style={{textAlign:"center",minWidth:70}}>
                <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,color:l.lit?color:"rgba(255,255,255,.35)",marginBottom:8,transition:"color .3s"}}>{l.label}</div>
                <Nodes count={l.nodes} lit={l.lit}/>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:8,maxWidth:80,lineHeight:1.35}}>{l.desc}</div>
              </div>
              {i<arr.length-1&&<Arrow lit={phase>=i+2}/>}
            </div>
          ))}
        </div>
        <div style={{textAlign:"center"}}><button onClick={phase===0||phase===4?run:undefined} disabled={running} className="cta-btn" style={{background:color,color:"#000",margin:"0 auto"}}>{running?"⚡ Processing...":phase===4?"▶ Run Again":"▶ Fire it up!"}</button></div>
      </Card>
      <Card style={{marginBottom:14}}><div style={{fontFamily:"'Fredoka',sans-serif",color:"white",fontSize:16,marginBottom:8}}>🔑 Analogy</div><p style={{color:"rgba(255,255,255,.62)",fontSize:14,lineHeight:1.6}}><strong style={{color}}>Attention</strong> is reading the room — figuring out who's talking to whom.<br/><strong style={{color}}>MLP</strong> is flipping through your entire memory to decide what it all means.</p></Card>
      <TriviaBox visible={hasRun} color={color} number="49,152" label="neurons in the hidden layer"
        fact="The MLP hidden layer is 4× the size of the input — giving the model enormous room to think before passing signals on to the next layer."/>
    </div>
  );
}

// ── SECTION 11 ────────────────────────────────────────────────────────────────
function SectionLayers({color,mode}){
  const [open,setOpen]=useState(null);const [opened,setOpened]=useState(new Set());
  const handleOpen=(i)=>{setOpen(open===i?null:i);setOpened(s=>new Set([...s,i]));};
  const LAYER_CARDS=[
    {range:"1–16",label:"Letters & Spelling",desc:"Recognizes individual letters, punctuation, and simple character patterns.",emoji:"🔤"},
    {range:"17–32",label:"Words & Grammar",desc:"Parts of speech, verb tenses, plural rules — the skeleton of language.",emoji:"📝"},
    {range:"33–48",label:"Facts & Knowledge",desc:"Countries, history, science, names — all the stuff from its training books.",emoji:"📚"},
    {range:"49–64",label:"Context & Tone",desc:"Is this sarcastic? Formal? A joke? Emotional? Context shapes everything here.",emoji:"🎭"},
    {range:"65–80",label:"Logic & Reasoning",desc:"Cause and effect, plans, comparisons, basic math, arguments.",emoji:"🧩"},
    {range:"81–96",label:"Deep Understanding",desc:"Nuance, metaphor, wisdom — the things that are hardest to explain but feel right.",emoji:"✨"},
  ];
  const notes=[
    "Ask the class to guess what early vs late layers might do BEFORE revealing. 'What would you learn first if you were trying to understand language from scratch?'",
    "The progression from mechanical (letters) to abstract (wisdom) is a nice structural insight. Early layers = fast and reliable, late layers = slow and uncertain.",
    "A good discussion question: 'If you cut the model off at layer 32, what could it do? What couldn't it do?' (It could spell and do grammar, but couldn't reason or understand context.)",
    "The 96-layer count is the wow moment here. Ask: 'What do you think happens between the first and ninety-sixth layer that makes the answer so much better?'",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 5"/>
      <H1>Rinse & Repeat 🔁</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>One round of Attention + MLP isn't enough. So the model does it <strong style={{color}}>96 times in a row</strong>. Each pass makes the understanding richer. Tap to explore what each group of layers learns.</Body>
      <div style={{marginBottom:16}}>
        {LAYER_CARDS.map((l,i)=>(
          <div key={i} className={`layer-row${open===i?" open":""}`} onClick={()=>handleOpen(i)} style={{borderColor:open===i?`${color}50`:undefined}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:22}}>{l.emoji}</span>
                <div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:16,color:open===i?color:"white",transition:"color .2s"}}>{l.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>Layers {l.range}</div></div>
              </div>
              <span style={{color:open===i?color:"rgba(255,255,255,.3)",fontSize:18,transition:"color .2s"}}>{open===i?"▲":"▼"}</span>
            </div>
            {open===i&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.08)",fontSize:14,color:"rgba(255,255,255,.68)",lineHeight:1.5,animation:"fadeUp .2s ease"}}>{l.desc}</div>}
          </div>
        ))}
      </div>
      <TriviaBox visible={opened.size>=3} color={color} number="96" label="transformer layers"
        fact="Each layer is its own full Attention + MLP block. Run 96 of them in sequence and you go from raw letters to nuanced, reasoned understanding."/>
    </div>
  );
}

// ── SECTION 12 ────────────────────────────────────────────────────────────────
function SectionPredict({color,mode}){
  const [temp,setTemp]=useState(.8);const [words,setWords]=useState([]);const [layerCount,setLayerCount]=useState(0);
  const currentPos=words.length;const done=currentPos>=P_POSITIONS.length;
  const dist=done?[]:applyTemp(P_POSITIONS[currentPos].candidates,temp);
  const tm=tempMeta(temp);
  const pick=()=>{if(done)return;setWords(w=>[...w,sampleWord(dist)]);setLayerCount(c=>c+96);};
  const reset=()=>{setWords([]);setLayerCount(0);};
  const notes=[
    "The temperature slider is the big payoff of this section. Generate a sentence at temp 0.1 (frozen), then reset and generate again at temp 1.5 (wild). Show the class how the same prompt gives different results.",
    "Ask: 'At temperature zero, if you asked the same question 100 times, would you always get the same answer?' Yes — and explain that some AI tools set low temperature for consistent, reliable answers (like search or coding help).",
    "Ask: 'Why would you WANT high temperature?' Brainstorming, creative writing, generating lots of different ideas. Low temperature: factual Q&A, customer support, legal docs.",
    "The 'layer passes' counter is a great physical intuition-builder. By the end of a 9-word sentence you've run 864 layer passes. A real paragraph is thousands.",
    "Final discussion: 'Now that you know how AI works under the hood — does it change how you think about using it? What does it do well? What might it struggle with?'",
  ];
  return(
    <div className="fade-up">
      <Label color={color} text="HOW AI THINKS · STEP 6"/>
      <H1>Predict! 🔮</H1>
      <TeacherNote notes={notes} color={color} mode={mode}/>
      <Body>All those layers — just to pick <strong style={{color}}>one word</strong>. But here's the twist: AI has a <strong style={{color}}>temperature dial</strong> that controls how adventurous or safe it is. Move it and watch the probabilities change!</Body>
      <Card style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:19,color:"white"}}>{tm.emoji} Temperature: <span style={{color}}>{temp.toFixed(2)}</span></div>
          <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:14,padding:"4px 14px",borderRadius:20,background:`${tm.bar}20`,border:`1px solid ${tm.bar}60`,color:tm.bar}}>{tm.name}</div>
        </div>
        <div style={{position:"relative",marginBottom:10}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:8,borderRadius:4,transform:"translateY(-50%)",pointerEvents:"none",background:"linear-gradient(to right,#a0d8ef 0%,#00f5d4 20%,#fee440 50%,#fb5607 75%,#f15bb5 100%)"}}/>
          <input type="range" min=".05" max="2.0" step=".05" value={temp} onChange={e=>{setTemp(parseFloat(e.target.value));reset();}} className="temp-slider"/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"'Fredoka',sans-serif",marginBottom:10}}><span>🧊 Frozen</span><span>😊 Balanced</span><span>🌋 Wild</span></div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.5,padding:"8px 12px",background:"rgba(255,255,255,.04)",borderRadius:8}}>{tm.desc}</div>
      </Card>
      {!done&&(
        <Card style={{marginBottom:14}}>
          <div style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",letterSpacing:2,color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:12}}>Next word at temp {temp.toFixed(2)}:</div>
          {dist.map(({word,pct:p},i)=>(
            <div key={word} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <div style={{width:90,fontFamily:"'Fredoka',sans-serif",fontSize:15,color:i===0?color:"rgba(255,255,255,.5)",flexShrink:0}}>{i===0?"⭐ ":"    "}{word}</div>
              <div style={{flex:1,height:10,background:"rgba(255,255,255,.07)",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,borderRadius:5,background:i===0?color:"rgba(255,255,255,.2)",transition:"width .35s ease"}}/></div>
              <div style={{width:38,textAlign:"right",fontSize:12,color:"rgba(255,255,255,.45)",flexShrink:0}}>{p}%</div>
            </div>
          ))}
          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",fontStyle:"italic",marginTop:4}}>← Slide temperature to see bars shift live</div>
        </Card>
      )}
      <Card style={{marginBottom:14}}>
        <div style={{fontSize:11,fontFamily:"'Fredoka',sans-serif",letterSpacing:2,color:"rgba(255,255,255,.35)",textTransform:"uppercase",marginBottom:12}}>Generated so far:</div>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:26,minHeight:48,marginBottom:16,lineHeight:1.4}}>
          {words.length===0?<span style={{color:"rgba(255,255,255,.18)"}}>_ _ _ _ _ _ _ _ _</span>:words.map((w,i)=>(<span key={i} style={{color:i===words.length-1?color:"rgba(255,255,255,.85)",marginRight:w==="."?0:6,display:"inline-block",animation:i===words.length-1?"fadeUp .3s ease":"none"}}>{w}</span>))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          {!done?<button onClick={pick} className="cta-btn" style={{background:color,color:"#000"}}>{words.length===0?"▶ Generate first word":"Pick next word →"}</button>:<button onClick={reset} className="cta-btn" style={{background:color,color:"#000"}}>🔄 Try Again</button>}
          {layerCount>0&&<div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}><span style={{color,fontWeight:700}}>{layerCount.toLocaleString()}</span> layer passes used</div>}
        </div>
      </Card>
      {done&&(<div style={{textAlign:"center",padding:"22px",background:`${color}10`,border:`1px solid ${color}35`,borderRadius:14,marginBottom:14}}><div style={{fontSize:40,marginBottom:8}}>🎉</div><div style={{fontFamily:"'Fredoka',sans-serif",fontSize:20,color,marginBottom:8}}>Sentence complete!</div><div style={{fontSize:14,color:"rgba(255,255,255,.6)",lineHeight:1.65}}>Change the temperature and try again — you'll get different words!<br/><span style={{color:"rgba(255,255,255,.35)",fontSize:13}}>That's exactly why AI gives a different answer every time you ask the same question.</span></div></div>)}
      <TriviaBox visible={words.length>0} color={color} number={layerCount>0?layerCount.toLocaleString():"5,760+"} label="layer passes so far"
        fact="A typical 60-word paragraph means running all 96 layers 60 times — over 5,760 layer passes just to say 'good morning'!"/>
    </div>
  );
}

// ── MODE SELECT ───────────────────────────────────────────────────────────────
function ModeSelect({onSelect}){
  const stars=Array.from({length:60},(_,i)=>({x:((i*137.508)%100).toFixed(1),y:((i*73.214)%100).toFixed(1),s:(0.5+(i%5)*.35).toFixed(1),d:(1.2+(i%5)*.6).toFixed(1),dl:((i%30)*.1).toFixed(1)}));
  return(
    <div style={{minHeight:"100vh",background:"#050512",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,position:"relative",overflow:"hidden"}}>
      <style>{ALL_CSS}</style>
      {stars.map((s,i)=>(<div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:`${s.s}px`,height:`${s.s}px`,borderRadius:"50%",background:"white",animation:`twinkle ${s.d}s ${s.dl}s infinite alternate`,pointerEvents:"none"}}/>))}
      <div style={{position:"relative",zIndex:10,textAlign:"center",maxWidth:540}}>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:64,marginBottom:8}}>🤖</div>
        <h1 style={{fontFamily:"'Fredoka',sans-serif",fontSize:42,fontWeight:700,color:"white",marginBottom:10,lineHeight:1.1}}>How AI Thinks</h1>
        <p style={{color:"rgba(255,255,255,.5)",fontSize:16,marginBottom:40,lineHeight:1.6}}>An interactive lesson for 3rd & 4th graders.<br/>Choose how you're running this session today.</p>
        <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
          {[
            {id:"classroom",emoji:"👩‍🏫",title:"Classroom Mode",desc:"You control the pace. Discussion prompts and full teacher talking points included.",color:"#00bbf9",detail:"Best for: presenting to a class"},
            {id:"solo",emoji:"🎮",title:"Solo Mode",desc:"Students explore at their own pace with interactive quizzes guiding the way.",color:"#fee440",detail:"Best for: individual learning"},
          ].map(m=>(
            <div key={m.id} className="mode-card" onClick={()=>onSelect(m.id)}
              style={{width:220,padding:"28px 20px",borderRadius:20,background:`${m.color}10`,border:`2px solid ${m.color}50`,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12}}>{m.emoji}</div>
              <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:22,color:"white",marginBottom:10}}>{m.title}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.55,marginBottom:12}}>{m.desc}</div>
              <div style={{fontSize:12,color:m.color,fontFamily:"'Fredoka',sans-serif"}}>{m.detail}</div>
            </div>
          ))}
        </div>
        <p style={{color:"rgba(255,255,255,.2)",fontSize:12,marginTop:28}}>13 sections · ~45 minutes · Ages 8–11</p>
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [mode,setMode]=useState(null);
  const [sec,setSec]=useState(0);
  const [done,setDone]=useState(new Set());
  if(!mode) return <ModeSelect onSelect={setMode}/>;

  const color=COLORS[sec%COLORS.length];
  const next=()=>{setDone(p=>new Set([...p,sec]));setSec(s=>Math.min(s+1,TOTAL-1));};
  const prev=()=>setSec(s=>Math.max(s-1,0));
  const currentGroup=GROUPS.find(g=>sec>=g.start&&sec<=g.end);
  const progressPct=Math.round(((sec+1)/TOTAL)*100);
  const stars=Array.from({length:80},(_,i)=>({x:((i*137.508)%100).toFixed(2),y:((i*73.214)%100).toFixed(2),s:(0.5+(i%5)*.35).toFixed(1),d:(1.2+(i%5)*.6).toFixed(1),dl:((i%30)*.1).toFixed(1)}));

  return(
    <div style={{minHeight:"100vh",background:"#050512",color:"white",fontFamily:"'Nunito',sans-serif",position:"relative"}}>
      <style>{ALL_CSS}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {stars.map((s,i)=>(<div key={i} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,width:`${s.s}px`,height:`${s.s}px`,borderRadius:"50%",background:"white",animation:`twinkle ${s.d}s ${s.dl}s infinite alternate`}}/>))}
      </div>
      <div style={{position:"fixed",top:"25%",right:"-15%",width:"55vw",height:"55vw",borderRadius:"50%",background:`radial-gradient(circle,${color}14 0%,transparent 65%)`,pointerEvents:"none",transition:"background .7s ease",animation:"blobPulse 5s ease-in-out infinite",zIndex:1}}/>

      {/* Header */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(5,5,18,.88)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{height:3,background:"rgba(255,255,255,.08)"}}>
          <div style={{height:"100%",width:`${progressPct}%`,background:color,transition:"width .5s ease",borderRadius:"0 2px 2px 0"}}/>
        </div>
        <div style={{padding:"10px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:17,fontWeight:600}}>🤖 <span style={{color}}>How AI Thinks</span></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"'Fredoka',sans-serif",marginTop:1}}>{mode==="classroom"?"👩‍🏫 Classroom":"🎮 Solo"} · {currentGroup?.emoji} {currentGroup?.name}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,color:"rgba(255,255,255,.35)"}}>{sec+1} / {TOTAL}</div>
            <div style={{fontSize:11,color:`${color}88`,fontFamily:"'Fredoka',sans-serif",marginTop:1}}>{progressPct}% complete</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:620,margin:"0 auto",padding:"88px 22px 96px",position:"relative",zIndex:10}} key={sec}>
        {sec===0  && <SectionWhoIsHere    color={color} mode={mode}/>}
        {sec===1  && <SectionWhatIsAI     color={color} mode={mode}/>}
        {sec===2  && <SectionProgramsVsAI color={color} mode={mode}/>}
        {sec===3  && <SectionBrainVsAI    color={color} mode={mode}/>}
        {sec===4  && <SectionWhatIsLLM    color={color} mode={mode}/>}
        {sec===5  && <SectionMeetModels   color={color} mode={mode}/>}
        {sec===6  && <SectionTheBridge    color={color} mode={mode}/>}
        {sec===7  && <SectionHook         color={color} mode={mode}/>}
        {sec===8  && <SectionEmbeddings   color={color} mode={mode}/>}
        {sec===9  && <SectionAttention    color={color} mode={mode}/>}
        {sec===10 && <SectionMLP          color={color} mode={mode}/>}
        {sec===11 && <SectionLayers       color={color} mode={mode}/>}
        {sec===12 && <SectionPredict      color={color} mode={mode}/>}
      </div>

      {/* Footer nav */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"13px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(5,5,18,.9)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,.06)",zIndex:100}}>
        <button onClick={prev} disabled={sec===0} className="ghost-btn">← Back</button>
        <div style={{fontFamily:"'Fredoka',sans-serif",fontSize:13,color:"rgba(255,255,255,.38)",textAlign:"center",maxWidth:200,lineHeight:1.3}}>{TITLES[sec]}</div>
        {sec<TOTAL-1
          ?<button onClick={next} className="cta-btn" style={{background:color,color:"#000"}}>Next →</button>
          :<button onClick={()=>{setSec(0);setDone(new Set());}} className="cta-btn" style={{background:color,color:"#000"}}>🔄 Restart</button>
        }
      </div>
    </div>
  );
}
