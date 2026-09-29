# User Flow Document (UFD) — Policy Processor (LAW)
**Version:** 1.0 | **Date:** Sep 25, 2026 | **Hackathon:** Ignix Genesis Transistor
**Principle:** No AI-purple slop. Every state designed: empty, loading, error, success, proof.

---

## 1. User Personas (All Three)

### P1: Vault Owner (Primary for demo)
- **Goal:** Deploy vault that cannot be drained by changing config off-chain
- **Pain:** "We changed multisig threshold in GitHub, someone exploited old config"
- **Tech:** Knows OKX wallet, X Layer, but not circuit design
- **Success:** Vault enforces circuit, withdrawal blocked with on-chain receipt

### P2: Policy Author (Secondary, drives mint demand)
- **Goal:** Tape out new policy, bond it, earn 25% of mint fees
- **Pain:** "I built useful circuit, anyone can call free, I earn nothing"
- **Tech:** Understands NAND, BLIF, Foundry
- **Success:** Circuit NFT minted, bonded, active, earning

### P3: Challenger / Auditor (Security role)
- **Goal:** Find bug in policy, slash bond, earn reward
- **Pain:** "Circuit claims to be safe but has hidden bug"
- **Tech:** SAT solver, exhaustive testing
- **Success:** Submit counterexample, circuit deactivated, bond transferred

### P4: Visitor / Judge (90-second demo)
- **Goal:** Understand value in 10s, see proof in 2 min
- **Pain:** Judges see 100 projects, no context
- **Success:** Before/After obvious, proof baked in, OKLink links work

---

## 2. Core User Flows (Best = Wedge Demo First)

### FLOW A: The Wedge Demo — Deposit → Over-limit Withdraw → Blocked by eval() [PRIMARY — 90s]
**Actor:** Vault Owner + Judge
**Entry:** Landing page /vault

**Steps:**
1. **Landing:** Header shows processor 0x... not deployed yet? Empty state: "Processor not deployed — deploy via Foundry" with button "View Deploy Script" (not disabled, shows code)
2. **Connect Wallet:** Button "Connect OKX Wallet". States:
   - Not connected: Show "Connect to X Layer (Chain 196)" with OKX logo
   - Wrong chain: "Switch to X Layer" button, calls wallet_switchEthereumChain
   - Connected: Show address 0x1234...5678, balance in OKB, link to OKLink
3. **Vault Overview:** Show TVL 1.0 OKB, daily outflow 0.2 OKB, limit 10% (0.1 OKB per day for demo). Empty state if no deposits: "No deposits yet — deposit 1 OKB to start" with illustration (not purple gradient)
4. **Deposit:** Input 1 OKB, button "Deposit". Loading: spinner + "Confirm in wallet". Success: tx hash 0xabc... with OKLink link, TVL updates to 1.0, event log shows Deposit event
5. **Try Withdraw Over Limit:** Input 0.9 OKB (exceeds daily 0.1 remaining). Button "Withdraw 0.9 OKB". Before click, UI shows eval preview: `eval(SpendLimit, amount_high=1, daily_high=1) -> DENY`
6. **Eval Call (Real):** On click, calls `processor.eval(circuitId=2, bytes=0x0101)` via viem (read-only, free). Loading: "Calling circuit on X Layer... 0.4s". Success: returns 0x01 DENY, shows raw bytes + decoded
7. **Blocked:** Vault shows "Withdrawal blocked by Policy #2 — Circuit NFT 1.2.2 — Reason: daily limit exceeded — Receipt: OKLink tx 0x... — Bond 2000 LAW slashable"
8. **Try Under Limit:** Input 0.05 OKB, eval returns ALLOW, withdraw succeeds, daily outflow updates to 0.25 OKB, OKLink link
9. **Proof:** Button "View Exhaustive Proof" shows all 4 combos tested, monotonicity check, gas cost

**Edge Cases:**
- Wallet not connected: Show "Connect wallet to evaluate" disabled button with tooltip
- RPC down: Show "X Layer RPC unavailable — retry" with fallback RPC https://rpc.xlayer.tech
- Circuit not taped out: Show "Circuit #2 not taped out yet — tape out via canvas" with link to tapeout.net/#l2/xlayer/0x...
- Insufficient balance: Show "Insufficient OKB — faucet: https://www.okx.com/xlayer/faucet"

**Success Metric:** Judge sees before (config file editable) vs after (Circuit NFT permanent) in <90s, clicks eval themselves, sees OKLink receipt.

---

### FLOW B: Deploy Processor → Mint → Tape Out Policy [SECONDARY — for Policy Author]

**Actor:** Policy Author
**Entry:** /deploy

1. **Deploy Processor:** Show factory address 0x1f09..., params: LAW, 2.3M, 0.000066 OKB, story. Button "Copy Foundry Command". Command: `forge script contracts/Deploy.s.sol --rpc-url https://xlayerrpc.okx.com --account deployer --broadcast --slow`. States: Not deployed (show command), Deploying (show tx hash pending), Deployed (show processor address 0x..., OKLink link, sales 0 OKB)
2. **Mint Transistors:** Input amount 15, price 0.000066 OKB each, total 0.00099 OKB. Button "Mint 15 NANDs". Loading: wallet confirm. Success: balance 15 LAW, tx hash, OKLink link. Error: "Insufficient OKB" or "Supply cap reached"
3. **Design Circuit:** Tabs: "Canvas" (iframe to tapeout.net/#l2/xlayer/0x.../canvas) and "Import BLIF" (upload ALLOW_ONCE.blif). Shows NAND count, LATCH count, netlist bytes, estimated burn. Empty: "No circuit designed yet"
4. **Tape Out:** Button "Tape Out — Burns 8 transistors, mints Circuit NFT". Warning modal: "This burns transistors permanently, cannot be undone. Check: wallet has 8 NANDs, processor address correct, BLIF self-test PASS". Confirm. Loading: 2 txs (design proof + tapeout). Success: Circuit ID 1.2.1, NFT page link https://tapeout.net/#l2account/xlayer/0x.../1, tx hash, OKLink link
5. **Bond Policy:** Input bond 2000 LAW, name "SpendLimit V1". Button "Register Policy with Bond". Success: Policy ID 0, active, author address, bond amount, OKLink link

**Edge Cases:**
- No wallet: "Connect OKX Wallet to mint"
- Wrong chain: "Switch to X Layer"
- Not enough NANDs: "Need 8 NANDs, you have 2 — mint more"
- BLIF fails self-test: "Self-test FAIL — input 11 expected 1 got 0 — fix BLIF"

---

### FLOW C: Challenge Policy — Find Counterexample → Slash [TERTIARY — Security]

**Actor:** Challenger
**Entry:** /policies/0

1. **View Policy:** Show circuit ID, author, bond 2000 LAW, active status, safety envelope: "Riskier input never gets softer verdict"
2. **Run Prover:** Button "Run Exhaustive Check (65k inputs)". Loading: progress bar. Result: PASS or FAIL with counterexample: "Input 0x0AFF expected ALLOW got DENY"
3. **Submit Counterexample:** Input counterexample bytes, button "Slash Policy". Loading: wallet confirm. Success: Policy deactivated, bond transferred to challenger, event PolicySlashed, OKLink link
4. **Empty:** No policies yet: "No policies registered — be first to tape out and bond"

---

### FLOW D: Eval Playground — For Judge / Visitor [QUICK PROOF]

**Actor:** Visitor / Judge
**Entry:** /circuits

1. **Circuit List:** Table: ID, Name, Gates, Inputs, Outputs, Author, Bond, Active, OKLink link. Empty: "No circuits taped out yet — deploy processor first"
2. **Select Circuit:** Click SpendLimit -> detail page shows truth table, NAND count, netlist hash, tapeout tx, Circuit NFT page
3. **Eval Playground:** Inputs: amount_high dropdown 0/1, daily_high dropdown 0/1. Button "Eval On-Chain". Calls `processor.eval(circuitId, bytes)`. Shows raw output bytes, decoded DENY/ALLOW, gas used (0, read-only), latency ms, OKLink call trace
4. **Exhaustive Proof:** Button "View All Inputs" shows table of 4 combos with PASS/FAIL

---

## 3. Screen Inventory & States (Anti AI-Purple Slop)

**Design System:** Black #0a0a0a, Card #111, Border #222, Text #e5e5e5, Success #4ade80, Fail #f87171, Link #60a5fa. No purple gradients, no glassmorphism, no generic AI illustrations. Use monospace for proofs, technical borders, OKLink-style data density.

**Every screen must have:**
- Empty state: Illustration (simple line art) + message + CTA button
- Loading state: Spinner + text "Calling X Layer... 0.4s" + tx hash if pending
- Error state: Red border + error code + retry button + OKLink link if tx failed
- Success state: Green check + tx hash + OKLink link + share button
- Proof state: Monospace block with hash, gas, latency, bond info

**Screens:**
- / : Processor overview (supply, minted, sales, circuits) — empty if not deployed
- /vault : Vault demo (TVL, daily outflow, deposit/withdraw, eval result) — empty if no deposits
- /circuits : Circuit list + playground
- /circuits/:id : Circuit detail + truth table + eval + proof
- /deploy : Deploy flow (factory, mint, tapeout, bond)
- /policies : Policy registry + challenge

---

## 4. OKLink & Explorer Integration (Proof Layer)

Every tx must have:
- Tx hash truncated 0x1234...5678 with full copy button
- Link to https://www.oklink.com/xlayer/tx/{hash}
- Link to processor page https://tapeout.net/#l2/xlayer/{processor}
- Link to circuit page https://tapeout.net/#l2account/xlayer/{processor}/{circuitId}
- Block number, gas used, timestamp

Every circuit must have:
- Circuit ID (e.g., 1.2.1)
- Netlist hash (SHA256)
- NAND count, LATCH count
- Tapeout tx hash + OKLink link
- Eval call example with viem code snippet

---

## 5. Metrics to Bake In (Suraj #8)

- Gas per eval: 0 (read-only) or ~0.0001 OKB if tx
- Latency: 0.4s on X Layer
- Cost per policy: 15 NANDs * 0.000066 = 0.00099 OKB
- Exhaustive proof: 4/4 PASS for MVP, 256/256 for 8-bit version
- Monotonicity: PASS
- Bond: 2000 LAW slashable
- Revenue: 25% of mint proceeds to authors
- Completion: Minted/Supply ratio, Circuits count

---

## 6. What We Will NOT Do (Kill Ideas Needing Miracle)

- No DeWEB hosting (SiteRegistry not deployed on X Layer per TapeKit Issue #6)
- No PoD mining (self-built X Layer processors cannot mine BEM)
- No sub-circuit references (X Layer requires flat NAND)
- No wash trading (disqualifier)
- No new research breakthroughs (use proven 8-12 gate circuits)
