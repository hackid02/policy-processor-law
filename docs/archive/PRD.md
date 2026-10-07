> HISTORICAL / SUPERSEDED. This file describes an earlier prototype and may contain incorrect claims. Do not use it as a submission or security specification. See README.md, VERIFY.md, SECURITY.md and SUBMISSION.md at the repository root.

# PRD.md — Policy Processor (LAW) — Product Requirements Document

## 1. Problem
Vault rules today are off-chain configs (GitHub, multisig threshold) that can be edited silently. $2M+ drained because rule changed off-chain, no on-chain proof. TapeOut processors exist but 90% have 0 minters, 0 circuits, no vault use — speculative. Ignix Genesis Transistor needs dedicated vault mechanics but no processor has proven mint demand.

## 2. Solution
Policy Processor (LAW): A processor where every circuit IS a vault policy. Transistors = blank law units, Circuit NFT = enacted law that cannot be edited, free to call via eval(), with bond/slash for security and 25% mint revenue to authors.

## 3. Goals
- Win Genesis Transistor: become Ignix vault mechanics
- Prove mint demand: every policy needs transistors + bond
- Ship boring layer: empty/loading/error/success + OKLink receipts + exhaustive proof
- Demo in 90s: before/after obvious

## 4. Non-Goals
- No DeWEB (SiteRegistry not on X Layer)
- No PoD mining (X Layer self-built cannot mine BEM)
- No platform (wedge = SpendLimit 12 gates)
- No AI-purple slop

## 5. Users
- Vault Owner (primary): Wants vault that cannot be drained by config edit
- Policy Author (secondary): Wants to monetize useful circuit
- Challenger (security): Wants to earn by finding bugs
- Judge (90s demo): Wants before/after + proof

## 6. User Stories

**US-001: Vault Owner Deposits and Tries Over-Limit Withdraw (Wedge Demo)**
- As vault owner, I want to deposit 1 OKB and try withdraw 0.9 OKB over daily limit, so that I see circuit blocks it with on-chain receipt
- Acceptance: Deposit tx OKLink link, TVL updates, withdraw 0.9 blocked, eval returns DENY, OKLink receipt, bond info, try 0.05 withdraw ALLOW succeeds

**US-002: Policy Author Deploys Processor and Tapes Out Policy**
- As policy author, I want to deploy processor LAW with supply 2.3M price 0.000066 OKB, mint 15 NANDs, import BLIF, tape out ALLOW-ONCE, bond 2000 LAW, so that I earn 25% mint proceeds
- Acceptance: Processor address on OKLink, minted balance 15, Circuit ID 1.2.1, NFT page, bond active, author rewards

**US-003: Challenger Finds Counterexample and Slashes**
- As challenger, I want to run exhaustive check over all inputs, find counterexample where riskier input gets softer verdict, submit slash, so that I earn bond
- Acceptance: Prover shows PASS/FAIL with counterexample bytes, slash tx OKLink link, policy deactivated, bond transferred

**US-004: Visitor Evals Circuit in Playground**
- As visitor, I want to pick SpendLimit circuit, input amount_high and daily_high, eval on-chain, see raw bytes and decoded DENY/ALLOW, gas, latency, OKLink link, so that I trust proof
- Acceptance: Eval playground calls processor.eval() view, returns 0x00/0x01, shows gas 0, latency 0.4s, OKLink call trace, truth table

## 7. Functional Requirements

**Processor:**
- FR-001: Deploy via factory 0x1f09... with name LAW, symbol LAW, supply 2.3M, price 0.000066 OKB, story immutable
- FR-002: Mint NANDs (ERC1155 id 0) via processor.mint(0, amount), price 0.000066 each
- FR-003: Tape out via canvas import BLIF, burns NANDs, mints Circuit NFT, returns circuitId, tx hash, OKLink link
- FR-004: Withdraw earnings via processor.withdraw()

**Circuits:**
- FR-005: ALLOW-ONCE 8 gates, inputs intent,arm,q, output next_q, logic (intent&arm)|q, truth 8/8 PASS
- FR-006: SpendLimit 12 gates MVP, inputs amount_high,daily_high, output deny = ah&dh, truth 4/4 PASS, monotonicity PASS
- FR-007: Quorum2of3 9 gates, inputs s1,s2,s3, output quorum if >=2, truth 8/8 PASS
- FR-008: All flat NAND, no sub-circuits, BLIF files in circuits/, test.mjs exhaustive

**PolicyRegistry:**
- FR-009: registerPolicy(circuitId, bond, name) — bonds 2000 LAW, active
- FR-010: slashPolicy(policyId, counterexample) — deactivates, transfers bond to challenger
- FR-011: notifyReward(author) payable — 25% mint proceeds to authors, pull-payment
- FR-012: reportTamper(circuitId, expectedHash) — checks netlist hash, deactivates if mismatch

**VaultLaw:**
- FR-013: deposit() payable, updates TVL, dailyOutflow
- FR-014: withdraw(amount, policyId, inputs) — calls PolicyRegistry.enforce -> processor.eval() -> ALLOW/THROTTLE/HALT, emits Deposit, Withdraw, Blocked, Throttled with circuitId, inputs, output, tx hash

**Frontend:**
- FR-015: 6 pages: / (processor stats), /vault (demo), /circuits (list+playground), /circuits/[id] (detail+truth+proof), /deploy (deploy flow), /policies (registry+challenge)
- FR-016: Wallet connect OKX Wallet, chain switch to 196, balance, address truncated, OKLink link
- FR-017: Every tx has hash truncated + copy + OKLink link, block number, gas, timestamp
- FR-018: Every circuit has ID, netlist hash, NAND count, tapeout tx, Circuit NFT page, eval example
- FR-019: Every screen has empty (line art+message+CTA), loading (spinner+"Calling X Layer... 0.4s"), error (red border+code+retry+OKLink), success (green check+tx+OKLink+share), proof (mono block+hash+gas+latency+bond)

## 8. Non-Functional Requirements

- **Performance:** eval() read-only free, 0.4s latency, 1000s QPS, frontend static Vercel edge
- **Security:** Reentrancy guard, exact price checks, bounded payout, pull-payment escrow, exhaustive proof, monotonicity, bond slashable, reportTamper, no wash trading
- **Observability:** OKLink links for every tx, netlist hash for every circuit, raw bytes + decoded for every eval, events for every action
- **Compatibility:** X Layer ChainID 196, RPC https://xlayerrpc.okx.com fallback https://rpc.xlayer.tech, OKX Wallet EIP-1193, TapeOut canvas, flat NAND BLIF

## 9. Metrics

- Gas per eval: 0 (read-only)
- Latency: 0.4s
- Cost per policy: 0.00099 OKB
- Exhaustive: 4/4 PASS MVP, 256/256 8-bit, 65k/65k full
- Monotonicity: PASS
- Bond: 2000 LAW
- Revenue: 25% to authors
- Completion: Minted/Supply ratio, Circuits count

## 10. Release Plan

- **MVP (Hackathon):** Processor LAW 2.3M 0.000066 OKB, 3 circuits 8/12/9 gates, PolicyRegistry+VaultLaw, frontend 6 pages, demo 2 min, exhaustive proof 4/4, OKLink links, submit
- **Post-Hackathon:** 8-bit SpendLimit 112 gates, Drawdown Breaker 161, Allocation Band 246, Nerve game, PT/YT vaults, SAT prover

## 11. Risks

- Upgradeable beacon: Mitigate reportTamper + disclose
- X Layer flat netlist only: Mitigate flat NAND BLIF
- Wash trading disqualifier: Mitigate mint only needed amount, no self-trade

## 12. Open Questions

- Should supply be 2.3M or 88,888? Decision: 2.3M story "1000x Intel 4004"
- Should price be 0.000066 or lower? Decision: 0.000066 proven by winners
- Should we include 112-gate full version in MVP? Decision: No, 12-gate wedge for 90s demo, 112-gate post-hackathon
