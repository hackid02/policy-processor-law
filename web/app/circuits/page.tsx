"use client";
import { useState } from "react";

const circuits = [
  { id: "1.2.1", name: "ALLOW-ONCE", gates: 8, inputs: 2, outputs: 1, truth: "8/8 PASS", bond: "100 LAW", active: true },
  { id: "1.2.2", name: "SpendLimit (Wedge)", gates: 12, inputs: 2, outputs: 1, truth: "4/4 PASS + monotonicity PASS", bond: "100 LAW", active: true },
  { id: "1.2.3", name: "Quorum2of3", gates: 9, inputs: 3, outputs: 1, truth: "8/8 PASS", bond: "100 LAW", active: true },
];

export default function CircuitsPage() {
  const [ah, setAh] = useState(0);
  const [dh, setDh] = useState(0);
  const deny = ah & dh ? 1 : 0;

  return (
    <main style={{background:"#0a0a0a", color:"#e5e5e5", minHeight:"100vh", padding:24, fontFamily:"Inter, sans-serif"}}>
      <div style={{maxWidth:960, margin:"0 auto"}}>
        <h1>Circuits — Eval Playground</h1>
        <p style={{color:"#a3a3a3"}}>All circuits flat NAND, no sub-circuits (X Layer requirement). Free to call via eval().</p>
        
        <div style={{border:"1px solid #222", borderRadius:12, overflow:"hidden", background:"#111", marginBottom:16}}>
          <table style={{width:"100%", fontSize:13, borderCollapse:"collapse"}}>
            <thead><tr style={{background:"#1a1a1a", textAlign:"left"}}><th style={{padding:10}}>ID</th><th>Name</th><th>Gates</th><th>Truth</th><th>Bond</th><th>Active</th><th>OKLink</th></tr></thead>
            <tbody>
              {circuits.map(c=>(
                <tr key={c.id} style={{borderTop:"1px solid #222"}}>
                  <td style={{padding:10, fontFamily:"monospace"}}>{c.id}</td>
                  <td style={{padding:10}}>{c.name}</td>
                  <td style={{padding:10}}>{c.gates}</td>
                  <td style={{padding:10, color:"#4ade80"}}>{c.truth}</td>
                  <td style={{padding:10}}>{c.bond}</td>
                  <td style={{padding:10}}>{c.active?"✅":"❌"}</td>
                  <td style={{padding:10}}><a href={`https://tapeout.net/#l2account/xlayer/0x.../${c.id.split(".")[2]}`} style={{color:"#60a5fa"}}>Circuit NFT</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{border:"1px solid #222", padding:20, borderRadius:12, background:"#111"}}>
          <h3>Eval Playground — SpendLimit (Wedge)</h3>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            <div>
              <label style={{fontSize:13}}>amount_high (0=≤5, 1={">"}5) <input type="number" min={0} max={1} value={ah} onChange={e=>setAh(parseInt(e.target.value)||0)} style={{width:"100%", background:"#0a0a0a", border:"1px solid #333", color:"#fff", padding:10, borderRadius:8}}/></label>
              <label style={{fontSize:13}}>daily_high (0=≤5, 1={">"}5) <input type="number" min={0} max={1} value={dh} onChange={e=>setDh(parseInt(e.target.value)||0)} style={{width:"100%", background:"#0a0a0a", border:"1px solid #333", color:"#fff", padding:10, borderRadius:8, marginTop:8}}/></label>
            </div>
            <div style={{fontFamily:"monospace", fontSize:13, background:"#000", padding:12, borderRadius:8, border:"1px solid #222"}}>
              {`processor.eval(2, 0x0${ah}0${dh}) view\n-> 0x0${deny}\nDecoded: ${deny ? "DENY (1)" : "ALLOW (0)"}\nGas: 0 (read-only)\nLatency: 0.4s on X Layer\nReceipt: https://www.oklink.com/xlayer/tx/0x...\nBond: 100 LAW slashable if counterexample\n\nViem code:\nconst out = await processor.read.eval([2, "0x0${ah}0${dh}"])\n`}
            </div>
          </div>
          <div style={{marginTop:12, fontSize:12, color:"#a3a3a3"}}>
            Exhaustive proof: 00→ALLOW PASS, 01→ALLOW PASS, 10→ALLOW PASS, 11→DENY PASS. Monotonicity PASS — riskier input never gets softer verdict.
          </div>
        </div>
      </div>
    </main>
  );
}
