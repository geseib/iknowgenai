export const ALL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes twinkle { 0%{opacity:.1;transform:scale(.7)} 100%{opacity:.8;transform:scale(1.3)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes blobPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes probIn { from{width:0!important} }
  @keyframes dialSpin { 0%{transform:scaleY(1)} 30%{transform:scaleY(0.3)} 60%{transform:scaleY(1.4)} 100%{transform:scaleY(1)} }
  @keyframes needleSpin { from{transform:translate(-50%,-100%) rotate(0deg)} to{transform:translate(-50%,-100%) rotate(360deg)} }
  @keyframes dialPulse { 0%{transform:scale(.92);opacity:0} 26%{opacity:1} 100%{transform:scale(1.3);opacity:0} }
  @keyframes gearSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin { animation: gearSpin .8s linear infinite; }
  @keyframes navPulse {
    0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.12)}
    50%{box-shadow:0 0 0 5px rgba(255,255,255,0)}
  }
  @keyframes navDot {
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:.4;transform:scale(.65)}
  }
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
  @keyframes creditFadeIn {
    0%{opacity:0;transform:translateY(18px) scale(.95)}
    100%{opacity:1;transform:translateY(0) scale(1)}
  }
  @keyframes creditFadeOut {
    0%{opacity:1;transform:translateY(0) scale(1)}
    100%{opacity:0;transform:translateY(-18px) scale(.95)}
  }
  @keyframes cursorBlink {
    0%,100%{opacity:1} 50%{opacity:0}
  }
  .fade-up { animation: fadeUp .45s ease forwards; }
  .wow-reveal { animation: wowReveal .6s cubic-bezier(.34,1.56,.64,1) forwards; }
  @keyframes snapSplit { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
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
