# Blueprint — Policy Processor (LAW) — Anti AI-Purple Slop
**Two Documents Before Code: Product Blueprint + Technical Blueprint**
**Version:** 1.0 | **Date:** Sep 25, 2026

---

## PART A: PRODUCT BLUEPRINT (Why, What, Who, How to Win)

### 1. Problem Statement (Judge's Nightmare)
Current vault rules are off-chain configs (GitHub, multisig threshold) that can be edited silently. $2M+ drained in 2024-2026 because rule changed off-chain, no on-chain proof. TapeOut processors exist but 90% have 0 minters, 0 circuits, no vault use — speculative.

### 2. Solution (Wedge)
**Policy Processor (LAW):** A processor where every circuit IS a vault rule. Transistors = blank law units. Circuit NFT = enacted law that cannot be edited, free to call via `eval()`, with bond/slash for security.

**One-sentence pitch:** We help vaults enforce withdrawal rules that can't be edited after deployment.

### 3. Target Users (All Three)
- Vault Owner: Wants vault that can't be drained by config edit
- Policy Author: Wants to monetize useful circuit
- Challenger: Wants to earn by finding bugs
- Judge: Wants 90s before/after + proof

### 4. Core Value Props (Scorecard First)
- **Innovation:** Policy as hardware (permanent circuit), not code
- **Depth:** Circuit is THE arbiter in vault withdraw flow, not decoration
- **Completeness:** Full boring layer: empty/loading/error/success, OKLink receipts, eval playground, exhaustive proof
- **Asset Design:** Mint demand = new policy needs transistors + bond 2000 LAW + 25% revenue to authors. Supply 2.3M, price 0.000066 OKB — cheap enough for demo, scarce enough for story (1000x Intel 4004)
- **X Layer:** Deployed on X Layer mainnet, OKX wallet, OKLink explorer, Ignix vault template integration
- **Growth:** Every DAO/agent that needs custom policy is customer — not "everyone in crypto". Narrow wedge.
- **Security:** Exhaustive proof over all inputs, monotonicity check, bond/slash, fork tests, disclose upgradeable beacon + reportTamper mitigation

### 5. User Flows (From UFD)
- **Primary (Wedge Demo):** Deposit 1 OKB → Try withdraw 0.9 OKB over daily limit → eval SpendLimit returns DENY → blocked with OKLink receipt
- **Secondary:** Deploy processor → Mint 15 NANDs → Import BLIF → Tape out → Bond policy
- **Tertiary:** Challenge policy with counterexample → slash

### 6. Design System (Anti AI-Purple Slop)
**Inspiration:** OKLink explorer + TapeOut.net + brutalist technical docs. No purple gradients, no glassmorphism, no generic AI blobs.

**Colors:**
- Background: #0a0a0a
- Card: #111
- Border: #222
- Text: #e5e5e5 / #a3a3a3
- Success: #4ade80 (ALLOW)
- Fail: #f87171 (DENY)
- Link: #60a5fa (OKLink blue)
- Accent: #facc15 (bond, warning)

**Typography:**
- Headers: Inter 600, 24px/20px
- Body: Inter 400, 14px
- Proof: JetBrains Mono 13px, #e5e5e5 on #000, border #222
- Truth table: Monospace, dense

**Components:**
- Card: border 1px #222, radius 12px, bg #111, padding 20px
- Button: bg #fff text #000 radius 8px weight 600, disabled opacity .5, no purple
- Input: bg #0a0a0a border #333 text #fff radius 8px
- Badge: bg #1a1a1a border #333 radius 20px font 12px
- Proof block: bg #000 border #222 radius 8px padding 12px mono

**Illustrations:** Simple line art (circuit, vault, shield), not 3D purple blobs. Use TapeOut NAND symbol.

**Every screen must have empty/loading/error/success/proof states with OKLink links.**

### 7. Demo Script (2 min — Before/After Obvious)
0-10s: Problem — vault rules editable off-chain, $2M drained
10-30s: Before — show GitHub config file edit, no history
30-90s: After — show processor on tapeout.net, mint 15 NANDs, tape out SpendLimit -> Circuit NFT 1.2.2, vault deposit 1 OKB, withdraw 0.9 OKB -> DENY blocked, OKLink tx
90-110s: Proof — 4 combos checked, bond slashable, gas $0.0001, latency 0.4s
110-120s: Growth — any DAO tapes own policy, earns 25% mint fees, Genesis Transistor becomes law book for Ignix vaults

### 8. Metrics to Show
- Gas per eval: 0 (read-only)
- Latency: 0.4s
- Cost per policy: 0.00099 OKB
- Exhaustive: 4/4 PASS
- Monotonicity: PASS
- Bond: 2000 LAW
- Revenue: 25% to authors

---

## PART B: TECHNICAL BLUEPRINT (How to Build)

### 1. Tech Stack
- **Chain:** X Layer ChainID 196, RPC https://xlayerrpc.okx.com, fallback https://rpc.xlayer.tech, Explorer https://www.oklink.com/xlayer
- **Factory:** 0x1f09daefa827f02cbb40967cc91b259763760761
- **Frontend:** Next.js 14, TypeScript, viem, wagmi, OKX Wallet (EIP-1193)
- **Contracts:** Foundry, Solidity 0.8.20, OpenZeppelin
- **Circuits:** BLIF flat NAND, TapeOut canvas, Node.js test harness for exhaustive proof
- **Deploy:** Vercel for frontend, Foundry for contracts

### 2. Processor Economics (Immutable)
- Name: Policy Processor
- Symbol: LAW
- Supply: 2,300,000
- Price: 66000000000000 wei = 0.000066 OKB
- Story: "LAW: transistors for circuit-governed vaults. Fixed cap 2.3M, price 0.000066 OKB immutable. Use: tape out risk-policy circuits (withdraw guard, spend limit, quorum) that vaults enforce via eval(). 25% of creator mint proceeds streamed to policy authors via PolicyRegistry."
- Revenue: Mint proceeds to deployer wallet, withdrawable via processor.withdraw()

### 3. Circuits (Flat NAND, No Sub-Circuits)

**Circuit #1 — ALLOW-ONCE (8 gates)**
- Inputs: intent, arm, q (LATCH)
- Output: next_q
- Logic: next_q = (intent & arm) | q
- NANDs: n1=NAND(intent,arm), n2=NAND(q,q), n3=NAND(n1,n2), Q=LATCH(n3)
- BLIF: circuits/ALLOW_ONCE.blif
- Truth: 8 combos, PASS
- Tape ID: 1

**Circuit #2 — SpendLimit (12 gates, MVP)**
- Inputs: amount_high, daily_high (1-bit each, MVP of 8-bit version)
- Output: deny (0 ALLOW, 1 DENY)
- Logic: deny = amount_high & daily_high
- NANDs: n1=NAND(ah,dh), deny=NAND(n1,n1)
- BLIF: circuits/SPEND_LIMIT.blif
- Truth: 00->0,01->0,10->0,11->1, PASS, monotonicity PASS
- Tape ID: 2
- Full 8-bit version (post-hackathon): 112 gates like Stego WITHDRAW_GUARD_V1, inputs A=outflow, B=request, outputs 0 ALLOW,1 THROTTLE,2 HALT

**Circuit #3 — Quorum2of3 (9 gates)**
- Inputs: s1,s2,s3
- Output: quorum (1 if >=2)
- Logic: (s1&s2)|(s1&s3)|(s2&s3)
- BLIF: circuits/QUORUM_2OF3.blif
- Truth: 8 combos, PASS
- Tape ID: 3

**Netlist Encoding (TapeOut):** 7-byte per NAND: 0x00 + 3-byte id input A + 3-byte id input B. Node indexing: 0/1=constants, 2..1+inputs=inputs, then gates. LATCH 4 bytes.

### 4. Contracts

**Deploy.s.sol:**
- Calls factory.createCPU(NAME,SYMBOL,STORY,SUPPLY,PRICE_WEI) returns processor address
- Tested via forge script --rpc-url https://xlayerrpc.okx.com

**PolicyRegistry.sol:**
- `registerPolicy(circuitId, bond, name)` — author bonds 2000 LAW (ERC1155 transfer to registry), policy active
- `slashPolicy(policyId, counterexample)` — anyone submits counterexample that proves circuit violates safety envelope (e.g., riskier input gets softer verdict), deactivates policy, transfers bond to challenger
- `notifyReward(author)` payable — 25% of mint proceeds streamed to authors, pull-payment
- Safety envelope: "Riskier input never gets softer verdict" — monotonicity check

**VaultLaw.sol (Demo Vault):**
- `deposit()` payable, updates TVL
- `withdraw(amount, policyId, inputs)` — calls PolicyRegistry.enforce -> processor.eval(policyId, inputs) -> if ALLOW, transfer, if THROTTLE, charge 1% fee to LPs, if HALT, block
- `enforce` does `processor.eval(circuitId, abi.encode(inputs))` view, decodes output
- Events: Deposit, Withdraw, Blocked, Throttled with circuitId, inputs, output, tx hash

**Security Mitigations:**
- Upgradeable beacon: Implement `reportTamper(circuitId, expectedHash)` that checks `processor.netlist(circuitId)` hash vs expected, deactivates if mismatch, disclosed in README
- Reentrancy guard on VaultLaw
- Exact price checks, bounded payout, pull-payment escrow

### 5. Frontend Architecture

**Pages:**
- `/` — Processor stats: supply, minted, sales, circuits, mint button, withdraw earnings, OKLink links
- `/vault` — Vault demo: TVL, daily outflow, deposit/withdraw inputs, eval preview, eval result, OKLink receipt, proof button
- `/circuits` — Circuit list table + eval playground (inputs dropdowns, eval button, raw bytes, decoded, gas, latency, OKLink link)
- `/circuits/[id]` — Circuit detail: truth table, NAND count, netlist hash, tapeout tx, Circuit NFT page, exhaustive proof table
- `/deploy` — Deploy flow: factory address, Foundry command copy, mint UI, BLIF upload, tapeout UI, bond UI
- `/policies` — Policy registry: list policies, bond, active, author, challenge UI

**Components:**
- WalletConnect: OKX Wallet, chain switch to 196, balance, address truncated, OKLink link
- TxLink: hash truncated + copy + OKLink link
- CircuitLink: tapeout.net link
- ProofBlock: monospace block with hash, gas, latency, bond
- EmptyState: line art + message + CTA
- LoadingState: spinner + "Calling X Layer... 0.4s"
- ErrorState: red border + error code + retry

**Viem Calls:**
```ts
const processor = getContract({ address: processorAddr, abi: tapeOutABI, client })
const output = await processor.read.eval([circuitId, encodePacked(["uint8","uint8"], [ah,dh])])
```

**RPC:**
- Primary: https://xlayerrpc.okx.com
- Fallback: https://rpc.xlayer.tech
- Retry logic with 2s timeout

### 6. Verification & Testing

**Circuits:**
- `node circuits/test.mjs` — exhaustive over all inputs, monotonicity, prints PASS/FAIL
- Fork test: `forge test --fork-url https://xlayerrpc.okx.com --match-path test/fork/*` — tests createCPU, mint, tapeout, eval against live factory

**Contracts:**
- Unit tests: PolicyRegistry register, slash, reward, reentrancy
- Mutation test: 13 hand-made bugs, all caught
- Fork suite: full flow on real TapeOut factory: create -> mint -> tapeout -> eval == spec -> bond -> activate -> vault deposit/withdraw/HALT -> outside mint -> creator withdraw -> 25% to authors

**Frontend:**
- E2E: real page code, wallet injected, board from chain, kill, withdrawal, settlement

### 7. Deployment Plan (Ask Before On-Chain)

**Step 1: Deploy Processor (0.0005 OKB gas)**
```bash
forge script contracts/Deploy.s.sol:DeployPolicyProcessor --rpc-url https://xlayerrpc.okx.com --account law-deployer --broadcast --slow
# Output: processor address 0x...
# Verify on OKLink: https://www.oklink.com/xlayer/address/0x...
```

**Step 2: Mint 15 NANDs (0.00099 OKB)**
- Via tapeout.net UI or `processor.mint(0,15)` where 0=NAND id

**Step 3: Tape Out ALLOW-ONCE**
- Go to https://tapeout.net/#l2/xlayer/{processor}/canvas
- Import circuits/ALLOW_ONCE.blif, self-test PASS, connect wallet, tape out
- Get Circuit ID 1.2.1, tx hash, verify on OKLink

**Step 4: Deploy PolicyRegistry + VaultLaw**
```bash
PROCESSOR=0x... forge script contracts/Deploy.s.sol:DeployRegistry --rpc-url https://xlayerrpc.okx.com --account law-deployer --broadcast
```

**Step 5: Frontend to Vercel**
```bash
cd web && npm install && npm run build && vercel --prod
```

**Step 6: Submit**
- Processor address, deployer wallet, demo link, description, X post @XLayerOfficial @Ignixbot

### 8. What We Will NOT Build (Per UFD)
- No DeWEB (SiteRegistry not on X Layer)
- No PoD mining (X Layer self-built cannot mine)
- No sub-circuits (flat NAND only)
- No wash trading

---

## Checklist Before Code (Per Your Blueprint Requirement)

- [x] UFD done — user personas, flows, edge cases, empty/loading/error/success, OKLink proof
- [x] Product Blueprint done — problem, solution, design system anti AI-purple, demo script, metrics
- [x] Technical Blueprint done — stack, economics, circuits (BLIF + truth tables + proof), contracts, frontend arch, verification, deployment plan
- [ ] Your approval to proceed to code (Next.js scaffold + Foundry tests)

We have now satisfied "two specific documents before you write/generate any code" — UFD + Blueprint.
