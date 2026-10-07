"use client";
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { CIRCUITS, INITIAL_INPUTS, DAILY_LIMIT, WEI, circuitInput, evaluateCircuit, packBits, parseOutput, verdictLabel, initialVault, currentVault, depositDemo, withdrawDemo, formatOKB, type Inputs, type Bit, type Mood, type CircuitKey } from '../lib/policy';
import { PROCESSOR, PROCESSOR_URL, FACTORY, TRANSISTORS, DEPLOYER, REPO, EVAL_ABI } from '../lib/deployment';
import './globals.css';
import verification from '../lib/verification.json';

const client = createPublicClient({ transport: http('https://rpc.xlayer.tech', { timeout: 6000, retryCount: 0 }) });
type Check = { status: 'checking' | 'match' | 'mismatch' | 'error'; input: string; actual?: Bit; message?: string };
type Entry = { id: number; type: 'DEPOSIT' | 'ALLOW' | 'DENY'; amount: bigint; reason: string; packed: string | null };

function RuleCard({ rule, inputs, children }: { rule: typeof CIRCUITS[number]; inputs: Inputs; children?: ReactNode }) {
  const bits = circuitInput(rule.key, inputs);
  const packed = packBits(bits);
  const predicted = evaluateCircuit(rule.key, inputs);
  const [check, setCheck] = useState<Check | null>(null);
  const sequence = useRef(0);
  useEffect(() => { sequence.current++; setCheck(null); return () => { sequence.current++; }; }, [packed]);
  const visible = check?.input === packed ? check : null;
  async function verify() {
    const request = ++sequence.current;
    setCheck({ status: 'checking', input: packed });
    try {
      if (await client.getChainId() !== 196) throw new Error('RPC is not X Layer (chain 196).');
      const raw = await client.readContract({ address: PROCESSOR, abi: EVAL_ABI, functionName: 'eval', args: [BigInt(rule.id), packed] });
      const actual = parseOutput(raw);
      if (sequence.current !== request) return;
      setCheck({ status: actual === predicted ? 'match' : 'mismatch', input: packed, actual });
    } catch (error) {
      if (sequence.current !== request) return;
      setCheck({ status: 'error', input: packed, message: error instanceof Error ? error.message.split('\n')[0].slice(0, 170) : 'RPC request failed.' });
    }
  }
  const good = rule.key === 'quorum' ? predicted === 1 : predicted === 0;
  return <article className={`rule-card ${rule.key === 'spend' ? 'featured' : ''}`} data-testid={`card-${rule.key}`}>
    <div className="card-top"><span className="eyebrow">{rule.key === 'spend' ? 'v1.2.2 WEDGE' : `CIRCUIT ${String(rule.id).padStart(2, '0')}`}</span><span className="pill">{rule.gates} gates · {rule.bytes} B</span></div>
    <h3>{rule.key === 'heartbeat' ? 'Dead Man’s Switch' : rule.name}</h3><p className="card-description">{rule.description}</p>
    <code className="formula">{rule.formula}</code>
    <div className="card-controls">{children}</div><div className="bits"><span>Input bits <b>{bits.join(' ')}</b></span><code>{packed}</code></div>
    <div className={`verdict ${good ? 'positive' : 'negative'}`}><span>{verdictLabel(rule.key, predicted)}</span><span className="mini-label">LOCAL MODEL · {predicted}</span></div>
    <div className="rpc-result" aria-live="polite">
      {!visible && <span>Current input has not been checked against RPC.</span>}
      {visible?.status === 'checking' && <span>Checking this input on X Layer…</span>}
      {visible?.status === 'match' && <span className="green">RPC returned {verdictLabel(rule.key, visible.actual!)} ({visible.actual}). Matches local model.</span>}
      {visible?.status === 'mismatch' && <span className="red">Mismatch: RPC returned {visible.actual}. Do not rely on this comparison.</span>}
      {visible?.status === 'error' && <span className="amber">Not verified. {visible.message} No successful RPC result is assumed.</span>}
    </div>
    <button className="secondary verify" disabled={visible?.status === 'checking'} onClick={verify}>Verify this input on X Layer <span>↗</span></button>
    <div className="card-foot">{rule.cases} possible input combinations · read only</div>
  </article>;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => { try { setDark(localStorage.getItem('law-theme') !== 'light'); } catch {} setThemeReady(true); }, []);
  useEffect(() => { if (themeReady) { try { localStorage.setItem('law-theme', dark ? 'dark' : 'light'); } catch {} } }, [dark, themeReady]);
  const [inputs, setInputs] = useState<Inputs>(INITIAL_INPUTS);
  const [vault, setVault] = useState(() => initialVault(0));
  const [events, setEvents] = useState<Entry[]>([]);
  const [mounted, setMounted] = useState(false);
  const eventId = useRef(0);
  useEffect(() => {
    setVault(initialVault(Date.now())); setMounted(true);
    const timer = setInterval(() => setVault(s => currentVault(s, Date.now())), 1000);
    return () => clearInterval(timer);
  }, []);
  function toggle(key: 'ah' | 'dh' | 'alive') { setInputs(s => ({ ...s, [key]: s[key] ? 0 : 1 })); }
  function signer(i: number) { setInputs(s => ({ ...s, signers: s.signers.map((v, k) => k === i ? (v ? 0 : 1) : v) as [Bit, Bit, Bit] })); }
  function addEntry(entry: Omit<Entry, 'id'>) { setEvents(e => [{ ...entry, id: ++eventId.current }, ...e].slice(0, 20)); }
  function deposit() { setVault(depositDemo(vault, WEI, Date.now())); addEntry({ type: 'DEPOSIT', amount: WEI, reason: 'Browser balance increased. No transaction sent.', packed: null }); }
  function withdraw(amount: bigint) {
    const outcome = withdrawDemo(vault, amount, Date.now());
    setVault(outcome.state);
    addEntry({ type: outcome.allowed ? 'ALLOW' : 'DENY', amount, reason: outcome.reason, packed: outcome.packed });
  }
  function reset() { setVault(initialVault(Date.now())); setEvents([]); }
  return <main className={dark ? 'law-app' : 'law-app light'}>
    <header className="site-header"><div className="header-inner"><a href="#book" className="brand"><span className="brand-icon">L</span><span>Policy Processor <i className="status-dot"/><small><b>LAW · Genesis</b> <span>X Layer 196</span></small></span></a><div className="header-actions"><div className="header-stats"><span className="status-dot"/><code>0x6F74…90E8</code><span>50 gates</span><span>5 circuits</span></div><button className="theme-toggle" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setDark(!dark)}>{dark ? '☼' : '☾'}</button><a className="live-link" href={PROCESSOR_URL} target="_blank" rel="noreferrer"><span className="status-dot"/>5 circuits ↗</a></div></div><div className="subheader"><div className="subheader-inner"><nav aria-label="Main navigation"><a href="#book">Book</a><a href="#cards">Cards</a><a href="#courtroom">Courtroom</a><a href="#evidence">Evidence</a></nav><span>Processor 0x6F74…90E8 · Read-only eval() · 68 recorded checks</span></div></div></header>
    <div className="shell">
      <section className="hero" id="book">
        <div><div className="hero-kicker"><span className="status-dot"/> Policy circuits. Visible rules. Testable decisions.</div><h1>We help vaults<br/>enforce withdrawal<br/>rules.<span>Start with logic<br/>you can inspect.</span></h1><p className="hero-copy"><strong>The idea:</strong> turn withdrawal rules into inspectable circuits on X Layer. Explore five deployed circuit designs, then see a fixed daily limit at work in the Courtroom.</p><p className="disclosure">The Courtroom is a simulation. The reference vault is not deployed or audited. No wallet connection or real funds required.</p><div className="supply-grid"><div><span>CIRCUITS</span><b>5</b><small>taped on X Layer</small></div><div><span>GATES</span><b>50</b><small>across five circuits</small></div><div><span>CHECKS</span><b>68 / 68</b><a href="#evidence">recorded snapshot ↗</a></div></div></div>
        <div className="book-stage"><div className="law-book"><div className="book-top"><span>LAW BOOK</span><b>GENESIS</b></div><div className="book-logo">L</div><h3>Policy Processor<br/>(LAW)</h3><p>5 circuits on X Layer.<br/>One inspectable policy toolkit.</p><div className="book-bottom"><span>SpendLimit · bit-packed eval()</span><div className="book-truth">{[[0,0],[0,1],[1,0],[1,1]].map(([a,d]) => <div key={`${a}${d}`}><code>{a}{d}</code><b className={a && d ? 'red' : 'green'}>{a && d ? 'DENY' : 'ALLOW'}</b></div>)}</div><small>Input flags → local circuit prediction</small></div></div></div>
      </section>
      <section id="cards"><div className="section-heading"><div><div className="eyebrow">THE POLICY TOOLKIT</div><h2>Law Cards</h2><p>Local predictions stay separate from actual RPC results. Every input change invalidates its previous verification.</p></div><div className="section-badges"><span className="pill">5 circuits · read only</span><a className="pill green" href="#evidence">68 recorded checks ↗</a></div></div>
        <div className="cards-grid">
          <article className="rule-card concept-card"><div className="card-top"><span className="eyebrow">FOUNDING SEAL</span><span className="pill">CONCEPT</span></div><h3>ALLOW-ONCE</h3><p className="card-description">The original Seal idea. Retained as a design concept, separate from the five deployed circuits.</p><code className="formula">next_q = (intent &amp; arm) | q</code><div className="concept-mark">L<span>FOUNDING SEAL</span></div><p className="section-note">Not taped out or implemented in this release. No NFT, token launch or one-time execution guarantee.</p><span className="secondary unavailable">Not deployed</span><div className="card-foot">Design concept · not included in the 68 cases</div></article>
          {CIRCUITS.map(rule => <RuleCard key={rule.key} rule={rule} inputs={inputs}>
            {rule.key === 'spend' && <><span className="control-label">Spend flags</span><div className="button-row"><button aria-pressed={!!inputs.ah} onClick={() => toggle('ah')}>ah = {inputs.ah}</button><button aria-pressed={!!inputs.dh} onClick={() => toggle('dh')}>dh = {inputs.dh}</button></div></>}
            {rule.key === 'quorum' && <><span className="control-label">Approval inputs</span><div className="button-row">{inputs.signers.map((v,i) => <button key={i} aria-pressed={!!v} onClick={() => signer(i)}>s{i+1} = {v}</button>)}</div></>}
            {rule.key === 'mood' && <><span className="control-label">Mode bits</span><div className="button-row">{(['FOMO','FEAR','HOLD','EXIT'] as Mood[]).map(m => <button key={m} aria-pressed={inputs.mood === m} onClick={() => setInputs(s => ({...s,mood:m}))}>{m}</button>)}</div></>}
            {rule.key === 'heartbeat' && <><span className="control-label">Liveness input · not a timer</span><button aria-pressed={!!inputs.alive} onClick={() => toggle('alive')}>alive = {inputs.alive}</button></>}
            {rule.key === 'hybrid' && <><span className="control-label">Shared circuit inputs</span><div className="input-summary">Spend flags + Quorum 2 of 3<br/>Change either card to test this rule.</div></>}
          </RuleCard>)}
        </div>
        <p className="section-note">These controls represent circuit inputs. They are not authenticated signatures or an on-chain heartbeat timer. They do not change the separate Courtroom budget.</p>
      </section>
      <section id="courtroom"><div className="section-heading"><div><div className="eyebrow">THE RULES, IN ACTION</div><h2>Courtroom</h2><p>A fixed 0.10 OKB global budget per UTC day. Deposits do not increase the limit.</p></div><span className="pill amber">SIMULATED BALANCES</span></div>
        <div className="court-grid"><div className="vault-panel"><div className="card-top"><h3>Demo vault</h3><button className="text-button" onClick={reset} disabled={!mounted}>Reset demo ↺</button></div><div className="balance"><span>AVAILABLE DEMO BALANCE</span><strong data-testid="vault-balance">{formatOKB(vault.balance)} <small>OKB</small></strong></div><div className="metrics"><div><span>Daily limit</span><b>{formatOKB(DAILY_LIMIT)} OKB</b></div><div><span>Spent today</span><b data-testid="daily-spent">{formatOKB(vault.dailyOutflow)} OKB</b></div><div><span>Remaining today</span><b data-testid="daily-remaining">{formatOKB(DAILY_LIMIT - vault.dailyOutflow)} OKB</b></div></div><button className="primary full" onClick={deposit} disabled={!mounted}>Deposit 1 OKB <span>SIMULATED</span></button><div className="withdraw-buttons"><button onClick={() => withdraw(WEI * 9n / 10n)} disabled={!mounted}>Request 0.90 OKB</button><button onClick={() => withdraw(WEI / 20n)} disabled={!mounted}>Request 0.05 OKB</button><button onClick={() => withdraw(WEI / 100n)} disabled={!mounted}>Request 0.01 OKB</button></div><p className="disclosure">Each request is checked locally. No RPC call, signed transaction, deposit receipt, or withdrawal receipt is created by this panel.</p></div>
        <div className="court-right"><div className="log-panel"><div className="card-top"><h3>Decision log</h3><span className="pill">{events.length} demo events</span></div><div className="event-log" aria-live="polite" data-testid="event-log">{events.length === 0 ? <div className="empty"><span>∅</span><h4>Start with a request.</h4><p>Try 0.90: denied.<br/>Try 0.05 twice: allowed.<br/>Then try 0.01: denied.</p></div> : events.map(e => <div className="event" key={e.id}><div><b className={e.type === 'DENY' ? 'red' : 'green'}>{e.type}</b><strong>{formatOKB(e.amount)} OKB</strong></div><p>{e.reason}</p>{e.packed && <code>Adapter input: {e.packed} · LOCAL SIMULATION</code>}</div>)}</div></div><div className="comparison"><article><div className="card-top"><b className="red">BEFORE</b><span className="pill">Config only</span></div><code>dailyLimit: 0.1<br/>// a setting is not enforcement</code><p>A number in a configuration file still needs code that enforces it.</p></article><article><div className="card-top"><b className="green">AFTER</b><span className="pill">Reference adapter</span></div><code>spent + requested &gt; limit<br/>→ pinned circuit → decision</code><p>Derived inputs, an explicit rule and a reproducible result. Simulated here.</p></article></div></div></div>
        <details className="adapter"><summary>How the withdrawal adapter works</summary><span className="eyebrow">HOW THE ADAPTER WORKS</span><code>overLimit = spentToday + requestedAmount &gt; dailyLimit</code><p>The reference vault derives this predicate from its own state. It sends <b>[overLimit, 1]</b> to the pinned AND circuit: <code>0x02 → ALLOW</code>, <code>0x03 → DENY</code>. It also independently enforces the numeric limit. The new vault contract is reference code, not a deployment claimed by this UI.</p></details>
      </section>
      <section id="evidence"><details className="evidence-details"><summary>Deployment evidence &amp; implementation details <span>Addresses, tests and limitations ↗</span></summary><div className="section-heading"><div><div className="eyebrow">03 / CHECK THE EVIDENCE</div><h2>Deployment evidence</h2><p>A local test result, an RPC response, and a transaction receipt prove different things.</p></div></div><div className="evidence-grid"><article><span className="pill">EXISTING DEPLOYMENT REFERENCES</span><h3>X Layer processor</h3>{verification.status === 'VERIFIED_AT_RECORDED_BLOCK' && <p className="green">{verification.cases} / 68 evaluations and {verification.receipts} listed receipts verified at block {verification.blockNumber?.toLocaleString('en-US')}. This is a recorded snapshot, not continuous monitoring. <a href="/verification.json" target="_blank" rel="noreferrer">Read the verification snapshot ↗</a></p>}<p>Addresses are taken from the project manifest. Use the read-only verifier to check chain ID, factory registration, receipts, issuance parameters, and all 68 circuit cases at a recorded block.</p><a href={PROCESSOR_URL} target="_blank" rel="noreferrer">Inspect processor ↗</a><dl><dt>Processor</dt><dd>{PROCESSOR}</dd><dt>Factory</dt><dd>{FACTORY}</dd><dt>Transistors</dt><dd>{TRANSISTORS}</dd><dt>Deployment wallet</dt><dd>{DEPLOYER}</dd></dl></article><article><span className="pill">LOCAL VERIFICATION</span><h3>Test the implementation</h3><p>Reproducible checks cover encoded netlists, demo decisions, and reference-contract behavior on an isolated local EVM. These are not a security audit or evidence of a deployed vault.</p><code className="command">npm ci<br/>npm test<br/>npm run verify:mainnet</code><a href={`${REPO}/blob/main/VERIFY.md`} target="_blank" rel="noreferrer">Verification guide ↗</a><p className="small">Source code and verification instructions are published in the repository.</p></article><article><span className="pill amber">NOT IMPLEMENTED</span><h3>No borrowed guarantees</h3><p>This release does not offer bond escrow, automatic slashing, author revenue sharing, authenticated multisig approvals, token-launch buttons, or an optimisation bounty market.</p><p>Registry administration and upstream processor upgrades remain trust boundaries. A stored netlist hash alone cannot prove unchanged execution.</p><a href={`${REPO}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer">Threat model & limitations ↗</a></article></div>
        <div className="issuance"><div><span className="eyebrow">ISSUANCE / MANIFEST PARAMETERS</span><h3>2,300,000 cap · 0.000066 OKB per transistor</h3><p>Fees are additional. Transistors are used to tape out new circuits; reusing an existing circuit does not require a new mint. Demand depends on builders choosing to create useful circuits, not a promise of yield or price appreciation.</p></div><a className="secondary" href={`${REPO}/blob/main/ECONOMICS.md`} target="_blank" rel="noreferrer">Read the assumptions ↗</a></div>
      </details></section>
      <footer><a className="brand" href="#"><span className="brand-icon">L</span><span>Policy Processor<small>LAW · GENESIS · X LAYER</small></span></a><p>Prototype software. Not audited. No real funds in this demo.</p><a href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a></footer>
    </div>
    <div className="mobile-bar"><span><b>Demo {formatOKB(vault.balance)} OKB</b><small>{events.length} local events</small></span><a href="#courtroom">Open Courtroom ↓</a></div>
  </main>;
}
