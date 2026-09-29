"use client";
import { useState } from "react";

const mockPolicies = [
  { id: 0, circuitId: "1.2.1", name: "ALLOW-ONCE V1", author: "0x1234...5678", bond: 100, active: true, hash: "0xabc...def", created: "2026-09-25" },
  { id: 1, circuitId: "1.2.2", name: "SpendLimit V1", author: "0x1234...5678", bond: 100, active: true, hash: "0x456...789", created: "2026-09-25" },
  { id: 2, circuitId: "1.2.3", name: "Quorum2of3 V1", author: "0x1234...5678", bond: 100, active: false, hash: "0x789...012", created: "2026-09-25", slashed: true },
];

export default function PoliciesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [counterexample, setCounterexample] = useState("0x0101");
  const [log, setLog] = useState<string[]>([]);

  const handleSlash = (id: number) => {
    const msg = `🔪 Slashed Policy #${id} — Counterexample ${counterexample} — Bond 100 LAW → challenger 0xabcd... — Tx: https://www.oklink.com/xlayer/tx/0x999... — Policy deactivated`;
    setLog([msg, ...log]);
  };

  return (
    <main style={{background:"#0a0a0a", color:"#e5e5e5", minHeight:"100vh", padding:24, fontFamily:"Inter, sans-serif"}}>
      <div style={{maxWidth:960, margin:"0 auto"}}>
        <h1>Policy Registry — Bond / Slash + 25% Revenue</h1>
        <p style={{color:"#a3a3a3"}}>Every circuit is a vault policy. Author bonds LAW, slashable if counterexample found. 25% mint proceeds to authors.</p>

        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16}}>
          <div style={{border:"1px solid #222", borderRadius:12, overflow:"hidden", background:"#111"}}>
            <table style={{width:"100%", fontSize:13, borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#1a1a1a", textAlign:"left"}}><th style={{padding:10}}>ID</th><th>Circuit</th><th>Name</th><th>Author</th><th>Bond</th><th>Active</th><th>Action</th></tr></thead>
              <tbody>
                {mockPolicies.map(p=>(
                  <tr key={p.id} style={{borderTop:"1px solid #222", background: p.slashed ? "#1a0000" : "transparent"}}>
                    <td style={{padding:10}}>{p.id}</td>
                    <td style={{padding:10, fontFamily:"monospace"}}>{p.circuitId}</td>
                    <td style={{padding:10}}>{p.name}</td>
                    <td style={{padding:10, fontFamily:"monospace"}}>{p.author}</td>
                    <td style={{padding:10}}>{p.bond} LAW</td>
                    <td style={{padding:10}}>{p.active ? "✅" : "❌ Slashed"}</td>
                    <td style={{padding:10}}><button onClick={()=>setSelected(p.id)} style={{background:"#1a1a1a", border:"1px solid #333", color:"#fff", padding:"4px 8px", borderRadius:6, fontSize:12}}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mockPolicies.length===0 && <div style={{padding:40, textAlign:"center", color:"#a3a3a3"}}><div style={{fontSize:24}}>📜</div><div>No policies registered yet</div><div style={{fontSize:12}}>Be first to tape out and bond — earn 25% mint fees</div></div>}
          </div>

          <div style={{border:"1px solid #222", padding:20, borderRadius:12, background:"#111"}}>
            <h3 style={{marginTop:0}}>Challenge Policy (Security)</h3>
            <p style={{fontSize:12, color:"#a3a3a3"}}>Safety envelope: "Riskier input never gets softer verdict" — monotonicity. Anyone can submit counterexample that proves violation.</p>
            <label style={{fontSize:13}}>Policy ID <input type="number" value={selected ?? ""} onChange={e=>setSelected(parseInt(e.target.value))} placeholder="0" style={{width:"100%", background:"#0a0a0a", border:"1px solid #333", color:"#fff", padding:10, borderRadius:8, margin:"8px 0"}}/></label>
            <label style={{fontSize:13}}>Counterexample (hex) <input value={counterexample} onChange={e=>setCounterexample(e.target.value)} style={{width:"100%", background:"#0a0a0a", border:"1px solid #333", color:"#fff", padding:10, borderRadius:8, fontFamily:"monospace"}}/></label>
            <button onClick={()=> selected!==null && handleSlash(selected)} style={{background:"#f87171", color:"#000", border:"none", padding:"10px 16px", borderRadius:8, fontWeight:600, width:"100%", marginTop:12}}>Slash Policy — Earn Bond</button>
            <div style={{marginTop:12, fontSize:11, color:"#a3a3a3"}}>
              In full version, verifies via processor.eval(circuitId, counterexample) — if output violates envelope, deactivates policy, transfers bond to challenger.<br/>Tx: https://www.oklink.com/xlayer/tx/0x...
            </div>

            <div style={{marginTop:16}}>
              <h4>Event Log</h4>
              <div style={{fontFamily:"monospace", fontSize:11, background:"#000", padding:12, borderRadius:8, border:"1px solid #222", maxHeight:200, overflow:"auto"}}>
                {log.length===0 ? "No slashes yet — all policies PASS exhaustive proof" : log.map((l,i)=><div key={i} style={{marginBottom:8}}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          <div style={{border:"1px solid #222", padding:20, borderRadius:12, background:"#111"}}>
            <h3>Revenue — 25% to Authors</h3>
            <div style={{fontSize:13}}>Mint proceeds: 0.099 OKB from 100 vaults × 15 NANDs<br/>25% = 0.02475 OKB → streamed to active policy authors via PolicyRegistry.notifyReward(author)<br/>Author withdraws via withdrawReward()</div>
            <div style={{fontFamily:"monospace", fontSize:12, background:"#000", padding:8, borderRadius:8, border:"1px solid #222", marginTop:8}}>authorRewards[0x1234...] = 0.02475 OKB<br/>Tx: https://www.oklink.com/xlayer/tx/0x...</div>
          </div>
          <div style={{border:"1px solid #222", padding:20, borderRadius:12, background:"#111"}}>
            <h3>Tamper Protection</h3>
            <div style={{fontSize:13}}>TapeOut processors currently upgradeable via beacon proxy (team holds key). Mitigation: reportTamper(circuitId, expectedHash) checks netlist hash, deactivates if mismatch.</div>
            <div style={{fontFamily:"monospace", fontSize:12, background:"#000", padding:8, borderRadius:8, border:"1px solid #222", marginTop:8}}>expectedHash = 0xabc...<br/>actualHash = keccak256(processor.netlist(circuitId))<br/>if actual != expected → deactivate all policies using circuit → emit TamperReported</div>
          </div>
        </div>
      </div>
    </main>
  );
}
