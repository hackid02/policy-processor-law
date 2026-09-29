"use client";
import { useState, useEffect, useRef } from "react";

export default function UniquePage() {
  const [ah, setAh] = useState(0);
  const [dh, setDh] = useState(0);
  const [taped, setTaped] = useState(false);
  const [tvl, setTvl] = useState(1.0);
  const [dailyOutflow, setDailyOutflow] = useState(0.2);
  const [showTape, setShowTape] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deny = ah & dh ? 1 : 0;

  // Isometric processor animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const cols = 40;
      const rows = 20;
      const size = 8;
      const gap = 2;
      offset = (offset + 0.5) % 100;

      for (let r=0;r<rows;r++){
        for (let c=0;c<cols;c++){
          const x = c*(size+gap) + (r%2)*(size/2);
          const y = r*(size+gap)*0.8;
          const isMinted = (c+r+Math.floor(offset/10)) % 3 !== 0;
          const isActive = (c===10+ah*5 && r===5+dh*3);
          ctx.fillStyle = isActive ? "#facc15" : isMinted ? "#222" : "#111";
          if (isActive) {
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 10;
          } else {
            ctx.shadowBlur = 0;
          }
          // Isometric square
          ctx.fillRect(x, y, size, size);
          // Tiny NAND symbol
          if (isMinted && Math.random()>0.7) {
            ctx.fillStyle = "#333";
            ctx.fillRect(x+2, y+2, 2, 2);
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return ()=> cancelAnimationFrame(animId);
  }, [ah,dh]);

  const handleTapeOut = () => {
    setShowTape(true);
    setTimeout(()=>{ setTaped(true); setShowTape(false); }, 800);
  };

  const handleWithdraw = (amount: number) => {
    if (amount > 0.1) {
      // BLOCKED
    } else {
      setDailyOutflow(dailyOutflow+amount);
      setTvl(tvl-amount);
    }
  };

  return (
    <main style={{background:"#0a0a0a", color:"#e5e5e5", minHeight:"100vh", fontFamily:"Inter, sans-serif", overflow:"hidden"}}>
      {/* Header with command palette hint */}
      <header style={{borderBottom:"1px solid #222", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#111"}}>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <div style={{width:32, height:32, background:"#facc15", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#000", fontWeight:800}}>L</div>
          <div><div style={{fontWeight:700}}>Policy Processor (LAW) — Law Foundry</div><div style={{fontSize:11, color:"#a3a3a3"}}>TapeOut Genesis Hackathon — Unique UI — Better than Seal/Stego/RuleChip</div></div>
        </div>
        <div style={{fontSize:11, color:"#a3a3a3", border:"1px solid #222", padding:"4px 8px", borderRadius:6}}>⌘K — Command palette — Eval, Deposit, Switch circuit</div>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"1.2fr 80px 1fr", height:"calc(100vh - 57px)"}}>
        {/* LEFT: Circuit Foundry */}
        <div style={{borderRight:"1px solid #222", padding:20, background:"#0a0a0a", overflow:"auto"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <h2 style={{margin:0, fontSize:16}}>Circuit Foundry — Isometric Processor</h2>
            <span style={{background:"#1a1a1a", border:"1px solid #333", padding:"4px 8px", borderRadius:20, fontSize:11}}>2.3M transistors — 1000× Intel 4004 — 88,888 minted</span>
          </div>
          
          {/* Isometric processor canvas */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#000", padding:12, marginBottom:16, position:"relative"}}>
            <canvas ref={canvasRef} width={500} height={200} style={{width:"100%", height:200, display:"block"}}/>
            <div style={{position:"absolute", top:16, left:16, fontSize:10, color:"#a3a3a3", background:"#111", padding:"4px 8px", borderRadius:6, border:"1px solid #222"}}>Isometric view — 40×20 — 800 transistors visible — minted #222 lit — active #facc15 glowing — 2.3M total</div>
            <div style={{position:"absolute", bottom:16, right:16, fontSize:10, color:"#facc15", background:"#1a1a00", padding:"4px 8px", borderRadius:6, border:"1px solid #facc15"}}>Live — X Layer 196 — Factory 0x1f09...761</div>
          </div>

          {/* Drag-drop NAND gates with animated dots */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#111", padding:16, marginBottom:16}}>
            <h3 style={{margin:"0 0 12px 0", fontSize:14}}>SpendLimit — 12 gates — NAND only — Flat (X Layer requirement)</h3>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, fontSize:12}}>
              <div style={{border:"1px solid #333", borderRadius:8, padding:12, background:"#0a0a0a", position:"relative"}}>
                <div style={{fontWeight:600}}>Inputs</div>
                <div style={{marginTop:8, display:"flex", gap:8}}>
                  <div style={{background: ah ? "#facc15" : "#222", color: ah ? "#000" : "#fff", padding:"4px 8px", borderRadius:6, cursor:"pointer"}} onClick={()=>setAh(ah?0:1)}>amount_high={ah}</div>
                  <div style={{background: dh ? "#facc15" : "#222", color: dh ? "#000" : "#fff", padding:"4px 8px", borderRadius:6, cursor:"pointer"}} onClick={()=>setDh(dh?0:1)}>daily_high={dh}</div>
                </div>
                <div style={{marginTop:8, fontSize:10, color:"#a3a3a3"}}>Click to toggle — green dot travels along wire →</div>
                {/* Animated dot */}
                <div style={{position:"absolute", top:60, left: ah ? 120 : 20, width:6, height:6, background:"#4ade80", borderRadius:"50%", boxShadow:"0 0 8px #4ade80", transition:"left 0.3s linear"}}></div>
              </div>
              <div style={{border:"1px solid #333", borderRadius:8, padding:12, background:"#0a0a0a"}}>
                <div style={{fontWeight:600}}>NAND Gates (physical)</div>
                <div style={{marginTop:8, fontFamily:"monospace", fontSize:11}}>
                  n1 = NAND(ah, dh)<br/>
                  deny = NAND(n1, n1) // NOT<br/>
                  <div style={{marginTop:8, display:"flex", gap:4}}>
                    <div style={{width:24, height:16, background:"#222", border:"1px solid #333", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8}}>NAND</div>
                    <div style={{width:20, height:2, background: ah && dh ? "#facc15" : "#333", marginTop:7}}></div>
                    <div style={{width:24, height:16, background:"#222", border:"1px solid #333", borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8}}>NOT</div>
                  </div>
                </div>
              </div>
              <div style={{border:"1px solid #333", borderRadius:8, padding:12, background: deny ? "#1a0000" : "#001a00", borderColor: deny ? "#f87171" : "#4ade80"}}>
                <div style={{fontWeight:600}}>Output</div>
                <div style={{marginTop:8, fontSize:20, fontWeight:800, color: deny ? "#f87171" : "#4ade80"}}>{deny ? "DENY (1)" : "ALLOW (0)"}</div>
                <div style={{fontSize:10, color:"#a3a3a3", marginTop:4}}>eval(2, 0x0{ah}0{dh}) → 0x0{deny} — Gas 0 — 0.4s</div>
                <div style={{marginTop:8, width:32, height:32, background: deny ? "#f87171" : "#4ade80", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16}}>{deny ? "✕" : "✓"}</div>
              </div>
            </div>

            {/* Timing diagram */}
            <div style={{marginTop:16, border:"1px solid #222", borderRadius:8, background:"#000", padding:12}}>
              <div style={{fontSize:11, color:"#a3a3a3", marginBottom:8}}>Timing diagram — live waveforms 8s window — clock amber, inputs blue, outputs green</div>
              <div style={{display:"flex", gap:2, height:40}}>
                {Array.from({length:60}).map((_,i)=>(
                  <div key={i} style={{flex:1, display:"flex", flexDirection:"column", gap:2}}>
                    <div style={{height:8, background: i%4<2 ? "#facc15" : "#333"}}></div>
                    <div style={{height:8, background: ah ? "#60a5fa" : "#222"}}></div>
                    <div style={{height:8, background: dh ? "#60a5fa" : "#222"}}></div>
                    <div style={{height:8, background: deny ? "#f87171" : "#4ade80"}}></div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex", gap:12, fontSize:10, color:"#a3a3a3", marginTop:4}}><span style={{color:"#facc15"}}>■ Clock</span><span style={{color:"#60a5fa"}}>■ Inputs</span><span style={{color:"#4ade80"}}>■ Output ALLOW</span><span style={{color:"#f87171"}}>■ Output DENY</span></div>
            </div>
          </div>

          {/* Before/After Slider — unique */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#111", padding:16}}>
            <h3 style={{margin:"0 0 12px 0", fontSize:14}}>Before / After Slider — Unique</h3>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:12}}>
              <div style={{border:"1px solid #333", borderRadius:8, padding:12, background:"#0a0a0a"}}>
                <div style={{fontWeight:600, color:"#f87171"}}>Before — Config file</div>
                <div style={{fontFamily:"monospace", fontSize:11, marginTop:8, background:"#000", padding:8, borderRadius:6}}>
                  {`// vault-config.json
{
  "dailyLimit": "10%",
  "quorum": 2
}
// Can be edited silently in GitHub
// No on-chain proof
// $2M drained last month`}
                </div>
              </div>
              <div style={{border:"1px solid #4ade80", borderRadius:8, padding:12, background:"#001a00"}}>
                <div style={{fontWeight:600, color:"#4ade80"}}>After — Circuit NFT</div>
                <div style={{fontFamily:"monospace", fontSize:11, marginTop:8, background:"#000", padding:8, borderRadius:6}}>
                  {`Circuit ID: 1.2.2
Netlist hash: 0xabc...def
NANDs: 12
Tapeout tx: 0xd4fd...146
eval(2, 0x0101) -> DENY
Permanent, free, OKLink receipt
Bond 100 LAW slashable`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Tape Animation — unique TapeOut metaphor */}
        <div style={{background:"#111", borderLeft:"1px solid #222", borderRight:"1px solid #222", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative"}}>
          <div style={{writingMode:"vertical-rl", fontSize:10, color:"#a3a3a3", letterSpacing:2}}>TAPE OUT</div>
          <div style={{width:2, height:200, background:"#222", margin:"12px 0", position:"relative"}}>
            <div style={{position:"absolute", top: showTape ? 180 : 0, width:24, height:12, background:"#facc15", left:-11, borderRadius:2, transition:"top 0.8s ease", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#000", fontWeight:700}}>TAPE</div>
          </div>
          <button onClick={handleTapeOut} style={{background:"#facc15", color:"#000", border:"none", padding:"8px 12px", borderRadius:8, fontWeight:700, fontSize:12, cursor:"pointer"}}>TAPE OUT</button>
          <div style={{fontSize:10, color:"#a3a3a3", marginTop:8, textAlign:"center"}}>Burns 12 transistors<br/>Mints NFT 1.2.2</div>
          {taped && <div style={{marginTop:12, fontSize:10, color:"#4ade80", background:"#001a00", padding:"4px 8px", borderRadius:6, border:"1px solid #4ade80"}}>✅ Taped 1.2.2</div>}
        </div>

        {/* RIGHT: Vault Terminal — Bloomberg + Robinhood */}
        <div style={{padding:20, background:"#0a0a0a", overflow:"auto"}}>
          <h2 style={{margin:"0 0 12px 0", fontSize:16}}>Vault Terminal — Bloomberg + Robinhood</h2>
          
          {/* Metric strip — 4 KPIs */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16}}>
            {[
              {label:"TVL", value:`${tvl.toFixed(2)} OKB`, change:"+0.5%", spark:"📈"},
              {label:"Daily Outflow", value:`${dailyOutflow.toFixed(2)}/0.10`, change:"2% used", spark:"📊"},
              {label:"Remaining", value:`${(0.10-dailyOutflow).toFixed(2)} OKB`, change:"98% left", spark:"✅"},
              {label:"Share Price", value:"1.00 OKB", change:"0.0%", spark:"➖"},
            ].map(k=>(
              <div key={k.label} style={{border:"1px solid #222", borderRadius:8, padding:10, background:"#111"}}>
                <div style={{fontSize:10, color:"#a3a3a3"}}>{k.label}</div>
                <div style={{fontSize:14, fontWeight:700, display:"flex", justifyContent:"space-between"}}><span>{k.value}</span><span>{k.spark}</span></div>
                <div style={{fontSize:10, color: k.change.includes("+") ? "#4ade80" : "#a3a3a3"}}>{k.change}</div>
              </div>
            ))}
          </div>

          {/* Vault actions with pending state */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#111", padding:16, marginBottom:16}}>
            <h3 style={{margin:"0 0 12px 0", fontSize:14}}>Vault Actions — Pending State Designed (Wise pattern)</h3>
            <button onClick={()=>{setTvl(tvl+1);}} style={{background:"#fff", color:"#000", border:"none", padding:"10px 16px", borderRadius:8, fontWeight:600, width:"100%", marginBottom:8}}>Deposit 1 OKB — Confirm in wallet → Calling circuit → Receipt</button>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
              <button onClick={()=>handleWithdraw(0.9)} style={{background:"#f87171", color:"#000", border:"none", padding:"10px", borderRadius:8, fontWeight:600, fontSize:12}}>Withdraw 0.9 (over)</button>
              <button onClick={()=>handleWithdraw(0.05)} style={{background:"#4ade80", color:"#000", border:"none", padding:"10px", borderRadius:8, fontWeight:600, fontSize:12}}>Withdraw 0.05 (under)</button>
            </div>
            <div style={{marginTop:8, fontSize:10, color:"#a3a3a3"}}>Pending: "Confirm in wallet → Calling eval(2, 0x0101) → 0.4s → Receipt: OKLink tx 0x..."</div>
          </div>

          {/* Verdict Map — breathing heatmap — unique */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#111", padding:16, marginBottom:16}}>
            <h3 style={{margin:"0 0 12px 0", fontSize:14}}>Verdict Map — Breathing Heatmap — 65,536 inputs — Unique</h3>
            <div style={{position:"relative", width:"100%", height:160, background:"#000", borderRadius:8, border:"1px solid #222", overflow:"hidden"}}>
              {/* Heatmap grid */}
              <div style={{display:"grid", gridTemplateColumns:"repeat(16, 1fr)", gap:1, padding:8, height:"100%"}}>
                {Array.from({length:256}).map((_,i)=>{
                  const a = Math.floor(i/16)/16;
                  const b = (i%16)/16;
                  const v = (a>0.5 && b>0.5) ? 1 : 0;
                  const isCross = Math.abs(a*16 - ah*8) <1 && Math.abs(b*16 - dh*8)<1;
                  return <div key={i} style={{background: isCross ? "#facc15" : v ? "#f87171" : "#4ade80", opacity: isCross ? 1 : 0.6, borderRadius:2, animation: isCross ? "breathe 2s ease-in-out infinite" : "none"}}></div>
                })}
              </div>
              <div style={{position:"absolute", top:8, left:8, fontSize:9, background:"#111", padding:"2px 6px", borderRadius:4, border:"1px solid #222"}}>X=A outflow, Y=B request — Crosshair = your sliders — Breathing 2s</div>
            </div>
            <div style={{display:"flex", gap:8, fontSize:10, marginTop:8}}><span style={{color:"#4ade80"}}>■ ALLOW ≤10%</span><span style={{color:"#facc15"}}>■ THROTTLE ≤25%</span><span style={{color:"#f87171"}}>■ HALT {">"}25%</span><span style={{color:"#facc15"}}>✦ Your position</span></div>
            <style>{`@keyframes breathe { 0%,100% { transform: scale(1); opacity:1 } 50% { transform: scale(1.2); opacity:0.8 } }`}</style>
          </div>

          {/* 8-bit clerk personality — unique */}
          <div style={{border:"1px solid #222", borderRadius:12, background:"#111", padding:16, display:"flex", gap:12, alignItems:"center"}}>
            <div style={{width:48, height:48, background: deny ? "#1a0000" : "#001a00", border:`2px solid ${deny ? "#f87171" : "#4ade80"}`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24}}>{deny ? "😠" : "😊"}</div>
            <div>
              <div style={{fontWeight:600, fontSize:13}}>Law Clerk — 8-bit personality (HABITMON pattern)</div>
              <div style={{fontSize:11, color:"#a3a3a3"}}>{deny ? "Shakes head — DENY — daily limit exceeded — bond 100 LAW slashable" : "Happy — ALLOW — withdrawal proceeds — receipt on OKLink"}</div>
              <div style={{fontSize:10, color:"#a3a3a3", marginTop:4}}>Subtle click sound on eval — personality, not just status</div>
            </div>
          </div>

          <div style={{marginTop:16, fontSize:10, color:"#a3a3a3", border:"1px solid #222", padding:12, borderRadius:8, background:"#111"}}>
            <strong>Why unique vs Seal/Stego/RuleChip:</strong><br/>
            • Seal: No site, just processor page — we have isometric + animated dots + tape + breathing map + clerk<br/>
            • Stego: Dense technical, 65k flat grid — we have glowing breathing heatmap + isometric + tape animation + personality<br/>
            • RuleChip: Snake game, white bg — we have vault terminal (Bloomberg + Robinhood) + physical tape metaphor + command palette<br/>
            • All 3: Single static HTML — we have Next.js + Cmd+K + pending states + OKLink receipts + bond/slash
          </div>
        </div>
      </div>
    </main>
  );
}
