# Policy Processor (LAW)

**A policy-verification toolkit for vault developers: model a withdrawal scenario, inspect its derived input, compare it with a deployed X Layer circuit, and export the evidence.**

- Existing public site: https://policyprocessor.vercel.app/
- Repository: https://github.com/hackid02/policy-processor-law
- The corrected frontend was published to GitHub and Vercel on 2026-10-07. It does not change the existing processor or deploy a new vault. See PUBLISHED.md.

## What exists

| Component | Status | Evidence |
|---|---|---|
| TapeOut processor + five circuit netlists | Existing X Layer mainnet deployment | `reports/mainnet-verification.json` |
| Factory association, supply cap, mint price, creation/mint/tapeout receipts | Read-only verifier passed at recorded block | Same report; rerun `npm run verify:mainnet` |
| 68 circuit input cases | Independently checked locally and queried on mainnet at the recorded block | `npm run test:circuits`, verification report |
| Law Cards | Local model plus explicit, separate RPC verification per input | Web application + browser tests |
| Courtroom | Custom scenarios with exact integer accounting, optional real RPC comparisons and JSON evidence export; no custody | Shared policy module, request-scoped RPC and browser tests |
| Revised `VaultLaw` and `PolicyRegistry` | Tested local reference contracts; NOT deployed by this patch, NOT audited | `npm run test:contracts` |
| Bonds, slashing, author revenue share, authenticated multisig, coin launch, bounty market | Not implemented | Deliberately not marketed as working features |

## Run and test

Node 20.9+ is required (tested with Node 20.20.2). No private key is needed.

```sh
npm ci
npm test
npm --prefix web ci
npm --prefix web run build
npm --prefix web run start
# http://localhost:3000
```

Browser regression suite, with the web server running:

```sh
npx playwright install --with-deps chromium
npm run test:browser
node tests/restored-ui.mjs
node tests/courtroom-rpc.mjs
node tests/toolkit.mjs
```

Read-only mainnet verification:

```sh
npm run verify:mainnet
# Optional: XLAYER_RPC_URL=https://... npm run verify:mainnet
```

RPC failure produces a failed verification report and nonzero exit code. It is not replaced by a successful local simulation.

## A focused developer workflow

LAW helps developers compare expected policy outcomes with real processor responses. It does not claim that a circuit is better than a direct Solidity check for every policy. The Courtroom models numeric state locally, derives SpendLimit flags, and optionally evaluates those flags at a recorded X Layer block. Exported JSON preserves exact wei amounts, inputs, predicted/actual outputs, timestamps and any error. It is RPC-based inspection evidence, not a signed proof, audit or transaction receipt.

Use **Evaluate scenario**, then **Compare this request on X Layer**, then **Export evidence**. Reset/reload clears browser session state; export results you want to retain. No wallet, authentication or deposit is required for this read-only workflow. See [JUDGE_GUIDE.md](JUDGE_GUIDE.md).

## The withdrawal specification

The Courtroom begins with a simulated balance of **1.00 OKB** and **zero spent**. Its fixed global budget is **0.10 OKB per UTC calendar day**.

- A first 0.90 request is denied.
- A 0.05 request is allowed; another 0.05 is allowed.
- A following 0.01 request is denied.
- Adding scenario balance does not refill the daily budget.
- Exactly the remaining allowance is permitted; one wei above it is not.
- A UTC date change resets the allowance, not the balance.

All calculations use integer wei. This is a fixed global limit, not 10% of a changing TVL, not a per-user budget, and not a rolling 24-hour window.

### Where arithmetic happens

SpendLimit is a **two-input AND circuit**, not a numeric comparator. The reference vault computes `overLimit` from trusted state, then sends `[overLimit, 1]` as the adapter input:

- `0x02` → output `0x00` → ALLOW
- `0x03` → output `0x01` → DENY

The vault also enforces the numeric limit independently. This demonstrates a circuit adapter; it does not claim the circuit performs addition or full numeric policy evaluation. Arbitrary caller-provided risk flags and policy selection have been removed from the withdrawal API.

Quorum, Mood, Heartbeat and RuleMux cards remain separate Boolean demonstrations. They are not authenticated wallet approvals or additional enforcement in the reference daily-limit vault.

## Read the evidence, not a badge

- [Verification commands and scope](VERIFY.md)
- [Threat model and remaining limitations](SECURITY.md)
- [Issuance parameters and demand assumptions](ECONOMICS.md)
- [Corrected hackathon submission](SUBMISSION.md)
- [Existing deployment references](DEPLOYMENT_LIVE.md)
- [Publishing and deployment checklist](HANDOFF.md)

Historical notes are in `docs/archive/` and are explicitly superseded. They are not security specifications.
