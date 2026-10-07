"use client";
import { useEffect, useRef, useState } from 'react';
import { createPublicClient, http } from 'viem';
import { DAILY_LIMIT, formatOKB, parseOutput, type Bit } from '../../lib/policy';
import { PROCESSOR, PROCESSOR_URL, EVAL_ABI } from '../../lib/deployment';

export type RequestSnapshot = {
  requested: bigint;
  spentBefore: bigint;
  day: number;
  input: `0x${string}`;
  predicted: Bit;
};
type Result = { status: 'checking' | 'match' | 'mismatch' | 'error'; block?: bigint; checkedAt?: string; actual?: Bit; message?: string };
const client = createPublicClient({ transport: http('https://rpc.xlayer.tech', { timeout: 6000, retryCount: 0 }), cacheTime: 0 });

// Each keyed log entry owns its immutable snapshot and asynchronous comparison.
// No RPC result can change balances, authorise a withdrawal or update another entry.
export default function CourtroomComparison({ snapshot }: { snapshot: RequestSnapshot }) {
  const [result, setResult] = useState<Result | null>(null);
  const sequence = useRef(0);
  const busy = useRef(false);
  useEffect(() => () => { sequence.current++; }, []);
  async function compare() {
    if (busy.current) return;
    busy.current = true;
    const request = ++sequence.current;
    setResult({ status: 'checking' });
    let block: bigint | undefined;
    try {
      if (await client.getChainId() !== 196) throw new Error('RPC is not X Layer (chain 196).');
      block = await client.getBlockNumber();
      const raw = await client.readContract({ address: PROCESSOR, abi: EVAL_ABI, functionName: 'eval', args: [1n, snapshot.input], blockNumber: block });
      const actual = parseOutput(raw);
      if (sequence.current !== request) return;
      setResult({ status: actual === snapshot.predicted ? 'match' : 'mismatch', block, actual, checkedAt: new Date().toISOString() });
    } catch (error) {
      if (sequence.current !== request) return;
      setResult({ status: 'error', block, checkedAt: new Date().toISOString(), message: error instanceof Error ? error.message.split('\n')[0].slice(0, 170) : 'RPC request failed.' });
    } finally {
      if (sequence.current === request) busy.current = false;
    }
  }
  function exportEvidence() {
    if (!result || result.status === 'checking') return;
    const evidence = { schema: 'law-policy-comparison/v1', expectedChainId: 196, processor: PROCESSOR, circuitId: 1, rpcEndpoint: 'https://rpc.xlayer.tech', snapshot: { ...snapshot, dailyLimit: DAILY_LIMIT }, comparison: result, limitations: 'Browser scenario compared through a trusted RPC provider. Not a signed proof, audit, transaction receipt or real withdrawal. RPC never changes simulated accounting.' };
    const json = JSON.stringify(evidence, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `LAW-SpendLimit-${snapshot.input}-${Date.now()}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const label = (bit: Bit) => bit === 1 ? 'DENY' : 'ALLOW';
  return <div className="court-comparison" data-testid="court-comparison">
    <div className="comparison-title"><b>SpendLimit · circuit 1</b><span className="pill">READ-ONLY COMPARISON</span></div>
    <dl className="request-snapshot"><div><dt>Requested</dt><dd>{formatOKB(snapshot.requested)} OKB</dd></div><div><dt>Spent before request</dt><dd>{formatOKB(snapshot.spentBefore)} OKB</dd></div><div><dt>Fixed daily limit</dt><dd>{formatOKB(DAILY_LIMIT)} OKB</dd></div></dl>
    <code>{formatOKB(snapshot.spentBefore)} + {formatOKB(snapshot.requested)} &gt; {formatOKB(DAILY_LIMIT)} → [{snapshot.predicted}, 1] → {snapshot.input}</code>
    <p className="snapshot-local">Local circuit prediction: <strong>{label(snapshot.predicted)} ({snapshot.predicted})</strong></p>
    <div className="court-rpc-result" aria-live="polite">
      {!result && <span>Not compared yet. No RPC result is assumed.</span>}
      {result?.status === 'checking' && <span>Checking this request’s captured input on X Layer…</span>}
      {result?.status === 'match' && <span className="green">RPC returned {label(result.actual!)} ({result.actual}). Matches this request’s local prediction.</span>}
      {result?.status === 'mismatch' && <span className="red">Mismatch: RPC returned {label(result.actual!)} ({result.actual}), local prediction was {label(snapshot.predicted)} ({snapshot.predicted}). This comparison is not verified. Simulated accounting has not been changed by RPC.</span>}
      {result?.status === 'error' && <span className="amber">Not verified. {result.message} No successful RPC result or fallback is assumed.</span>}
    </div>
    {result?.block !== undefined && <p className="comparison-block">{result.status === 'error' ? 'Attempted at' : 'Compared at'} X Layer block {result.block.toString()} · captured UTC day {new Date(snapshot.day * 86400000).toISOString().slice(0,10)}</p>}
    <button className="secondary" onClick={compare} disabled={result?.status === 'checking'}>{result?.status === 'checking' ? 'Comparing…' : result ? 'Compare this request again' : 'Compare this request on X Layer'} ↗</button>
    <button className="secondary export-evidence" disabled={!result || result.status === 'checking'} onClick={exportEvidence}>Export evidence ↓</button>
    <a className="comparison-processor" href={PROCESSOR_URL} target="_blank" rel="noreferrer">Processor ↗</a>
    <p className="comparison-note">Export preserves the captured scenario, result and any error. RPC evaluates flags, not your balance on-chain. No signed transaction, receipt or real withdrawal is created.</p>
  </div>;
}
