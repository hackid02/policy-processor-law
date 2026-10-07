# LAW correction patch — delivery summary

## Status

**Implemented and tested locally. Not pushed to GitHub, not deployed to Vercel, and no new contracts deployed.** The running preview shows the revised build. Existing mainnet manufacturing contracts were queried read-only; no funds, tokens or account permissions were changed.

## Fixed

- One explicit global 0.10 OKB-per-UTC-day policy, with integer-wei arithmetic and zero initial spent.
- First 0.90 denied; 0.05 twice allowed; subsequent 0.01 denied. Deposits do not reset the budget.
- Vault withdrawal API accepts only amount, pins its policy/circuit, derives its own risk predicate, and independently enforces the numeric limit.
- Strict output validation and failure propagation, pinned netlist checks, transfer rollback and reentrancy protection.
- Stored-reference tamper checks; arbitrary/unverified slashing and pretend bond accounting removed.
- Correct per-circuit bit packing and meanings, including Quorum's 1=PASS and the actual FEAR/HOLD behavior.
- Local models, RPC results and simulated events are distinctly labelled. Stale responses, wrong chains, mismatches and outages cannot produce a false successful verification.
- False receipt/zero-gas-withdrawal claims, unsupported permanence claims, self-ratings, fake loss example, coin-launch previews and unimplemented revenue/bounty claims removed from the active product and submission.
- Misleading legacy pages redirected or removed. Historical planning material clearly archived.
- Current locked Next.js/React dependencies, strict TypeScript checks, deterministic local tests and CI.

## Verification performed

| Check | Result | Scope |
|---|---|---|
| Encoded circuit replay | 5 groups / 68 cases passed | Local netlists vs independent formulas and stored tables |
| Policy-model suite | 17 tests passed | Integer budget, UTC reset, bit packing and semantics |
| Contract suite | 28 regression cases passed | Compiled reference contracts on isolated Anvil, chain 31337 |
| Browser suite | 18 checks passed | Actual UI actions; deterministic RPC error/race cases mocked |
| Browser with real RPC | ALLOW response matched local model | Actual public X Layer RPC, no interception |
| Production build and TypeScript | Passed | Revised web application |
| Root and web dependency audits | 0 known vulnerabilities reported | Lockfiles at check time; not a security audit |
| Existing mainnet verification | Passed at recorded block | Factory association, cap/price, five netlists, 68 eval cases, seven listed receipts and date window |

See reports/ and VERIFY.md for details. No independent contract audit, full upstream protocol assessment, or new real-fund vault deployment is claimed.

## Mainnet evidence

The report records block **72566407**, hash `0x017e144f00758410aa7ec29700ef5f60aefddb494a35968841df1f39de23f6fe`, checked at `2026-10-07T01:10:43.396Z`. This is a snapshot, not continuous monitoring. The site's `/verification.json` exposes the same snapshot. Read-only verification does not create withdrawal receipts.

## What you need to do next

1. Review the patch and publish it through your authenticated GitHub workflow.
2. Deploy `web` to a Vercel preview, then run the smoke test in HANDOFF.md before promoting it.
3. Update the demo/submission to show the corrected build. A short **silent** corrected-flow recording is supplied in `reports/corrected-flow.mp4`; the earlier long-form video shows the prior implementation.
4. Submit using the corrected SUBMISSION.md, with actual confirmation from the organizer.

No processor redeployment or additional transistor minting is needed for this frontend correction. New reference-contract deployment needs separate review and explicit approval.

## Remaining production boundaries

- Registry administration and upstream processor upgrades can affect availability.
- No independent audit or production governance/emergency-exit design is supplied.
- Other Law Cards are Boolean input demonstrations, not authenticated wallet signatures or real heartbeat infrastructure.
- Bond escrow, slashing, automatic revenue share and bounty mechanisms are intentionally absent.
- If credentials were ever committed historically, they require a separate private review/rotation process. This patch cannot make an exposed signing key safe again.
