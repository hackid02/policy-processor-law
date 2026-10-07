> HISTORICAL / SUPERSEDED. This file describes an earlier prototype and may contain incorrect claims. Do not use it as a submission or security specification. See README.md, VERIFY.md, SECURITY.md and SUBMISSION.md at the repository root.

# Suraj Framework: 7 Ways to Play TapeOut (Research)

Source: Suraj link shared by user + deep research of live X Layer projects (Sep 2026).

## The 7 Ways

### 1. Vault Guard (Stego pattern)
**What:** Circuits govern vault deposits/withdrawals/rebalances. `processor.eval()` is the gatekeeper.
- Stego: PolicyRegistry, StegoVault, 3 policies (Withdraw Guard 112 gates, Drawdown Breaker 161, Allocation Band 246), safety envelope + monotonicity, 65,536 exhaustive proof.
- Why judges love finance: obvious before/after, money at stake.

### 2. Permission Seal (Remembrance Seal pattern)
**What:** Transistors = blank seals, circuits = irreversible permission memories. Agent corporate seal.
- Seal Stack: L4 Agent Seal (who uses press), L1 Remembrance Gate (ALLOW/DENY irreversible), L2 Mood ASIC, L3 Dead Man.
- Economics: 88,888 supply, 0.000066 OKB, mint proceeds to deployer, seal-number scarcity.
- Our take: LAW Cards are seals. Each Law Card is a permission that cannot be edited after deployment.

### 3. Mood ASIC (Seal FOMO/FEAR/HOLD/EXIT)
**What:** Specialized imprint that encodes risk appetite as circuit.
- Seal: FOMO = allow, FEAR = deny if guard, HOLD = neutral, EXIT = deny all.
- Implementation: 4 inputs (2 bits mood + 2 bits guard) → 1 output, 12 gates.
- Why: Shows circuit can encode human emotion/risk, not just math. Demo: toggle mood, vault behavior changes.

### 4. Dead Man Switch (Seal insurance imprint)
**What:** Heartbeat timeout → lock/burn/vault. If agent doesn't heartbeat in 1h, vault locks.
- Seal: 2-in / 1-out / 1 latch, 8 gates, heartbeat gate.
- Implementation: inputs = alive bit, lastBeat bucket, request. Output = allow only if alive.
- Why: Real agent infra need, shows liveness, judges love safety.

### 5. RuleMux (RuleChip pattern)
**What:** Swap the circuit, change the game. Combine two circuits → third without re-tape.
- RuleChip: Snake game, WrapWall (72 gates), DeadWall (70 gates), RuleMux (22 gates) → HybridWall (top/bottom die, left/right wrap) without re-tape.
- Why: Composability is TapeOut superpower. Proves circuits are reusable components. Our RuleMux: SpendLimit (2 gates) + Quorum2of3 (12 gates) → Hybrid (18 gates) = vault guard that needs both limit OK AND quorum.

### 6. TapeID Coin (TapeID pattern)
**What:** Every Law Card can be launched as coin on IGNIX, 80/20 split, launch page stored on-chain in container.
- TapeID: Processor #245, 1M supply 0.0001 OKB, 21 NAND Driver car controller 21 gates, $NAND21 coin vault 0xD471... 80% container / 20% buyback Safe.
- Why: Value capture, every circuit is tradable asset. Our Law Cards have "Launch $ALLOW as coin 80/20" button. Shows understanding of IGNIX + container + revenue.

### 7. Design-to-Earn / Fabrica Bounty + Licensing (Fabrica + Circuit Commons)
**What:** Sponsor posts reference circuit + OKB bounty, anyone tapes smaller circuit same function, one counterexample kills, smallest wins.
- Fabrica: Contract is processor creator (mint proceeds → pool), poolShareBps 50% into house bounty, feeBps 5% back to pool, sentinel kills wrong entries for bond, headroom scan: every X Layer circuit → how much smaller proven via SAT.
- Circuit Commons: Registry, Router, UsageReceipt, Revenue Vaults PT/YT, license manifest.
- Why: Shows optimization matters, transistors are real cost, smaller = better. Our circuits are already minimal (2 gates AND, 12 gates majority), but we show Fabrica pill: "Sponsor bounty: smaller circuit same function wins".

---

## Comparison: Policy Processor vs Other Builds

| Project | Core Idea | Gates | Strength | Weakness vs Us |
|---------|-----------|-------|----------|----------------|
| **Seal / Remembrance Seal** | Agent permission seal factory | 8 gates ALLOW-ONCE, 8 gates DEADMAN | Clean brand, 88,888 seal-number, 4-level stack | Only 2 circuits, no vault wedge, no RuleMux, no coin |
| **Stego** | Circuit-governed vaults | 112, 161, 246 gates | 65,536 exhaustive, safety envelope, Nerve game, PolicyRegistry rewards 25% | Complex, no Mood/DeadMan/RuleMux/TapeID in UI, heavy |
| **RuleChip** | Game rules as circuits | 72, 70, 22 gates | Composable Snake, HybridWall without re-tape, 256 exhaustive, flat netlist | Game not finance, judges love finance more, no vault |
| **Fabrica** | Design-to-earn market | Various | Sentinel, SAT prover, headroom scan, creator = contract | Market infra, not end-user product, no wedge demo |
| **Neon Reliquary** | Roguelite + tactical chips | 11 circuits | Playable game, 3 regions, human+3 chips free | Game heavy, 11 circuits but not minimal, no finance wedge |
| **TapeID** | Every circuit = coin | 21 gates driver | 80/20 vault, container on-chain, IGNIX live | Coin infra, not policy, single circuit demo |
| **Nandout** | Programmable decision layer | 4,4,13,4,6,11 gates | LatchEvaluator, LatchFeed, Gate/Lock, fee route, live hooks | DeFi hook, no glass UI, no 7-ways |
| **Likely2X / TRACE** | Ecosystem radar / growth atlas | 8 gates | Discovery, milestones | Not full product, processor created but no circuit |

### Our Edge: Policy Processor (LAW) 10/10 Idea

- **Wedge:** Vault Guard (finance judges love) - deposit → over-limit withdraw blocked, Before/After in 1 click, OKLink receipt, bond slashable. Simple, obvious, $2M drained story.
- **Depth:** Implements all 7 ways in 5 circuits (50 transistors total):
  1. SpendLimit 2g 14B id1 = Vault Guard
  2. Quorum2of3 12g 84B id2 = Permission Seal (multisig)
  3. MoodASIC 12g 84B id3 = Mood
  4. DeadMan 6g 42B id4 = Dead Man Switch
  5. RuleMux 18g 126B id5 = RuleMux (SpendLimit+Quorum→Hybrid)
  6. TapeID coin button on each card 80/20
  7. Fabrica bounty pill + optimization narrative
- **Technical 10/10:** Live eval Gas0 (bit-packed input), 68 exhaustive (4+8+16+8+32), Foundry fork test, TapeKit bytes (real .bin hex), processor 0x6F74... on X Layer 196, 50 minted/burned, 5 tx receipts.
- **UI 10/10:** 1120px shell, #E6E8EB hairline rgba 0.06, 44px mobile, bottom nav, glass morphism blur20px saturate180% + rgba(255,255,255,0.72) + border rgba(255,255,255,0.6) + highlight, independent segments marginBottom, short cards (no black line), single clean footer.

### Why This Wins

Judges see:
- **Finance wedge** (vault) = immediate understanding
- **All 7 patterns** in one product = shows you studied ecosystem, not just one trick
- **Live on X Layer** = not mock, real eval, real OKLink
- **Minimal gates** = you respect transistors (2 gates AND vs others 8+)
- **Glass UI** = professional like Apple Wallet/Linear, not purple slop

---

## Live Deployment (X Layer 196)

- Factory: 0x1f09DAeFA827f02CBb40967cc91b259763760761
- Processor: 0x6F74553bAe997e896AD76BaC27401602A01790E8 (LAW Genesis)
- Transistors: 0xeDDe115d032bE238cd7AA37AEc183262C598a941
- Deployer: 0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556
- Supply: 2.3M cap, 0.000066 OKB mintPrice, protocolFee 0.00066 OKB, TAPEOUT_FEE 0.0013 OKB
- CreateTx: 0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887 block 71932071
- Mint 50: 0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6 block 71932752 (cost 0.00396 OKB = mintPrice*50+protocolFee)
- Tape1 SpendLimit 2g 14B id1: 0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23 block 71932763
- Tape2 Quorum 12g 84B id2: 0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182 block 71932766
- Tape3 Mood 12g 84B id3: 0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e block 71932770
- Tape4 DeadMan 6g 42B id4: 0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e block 71932774
- Tape5 RuleMux 18g 126B id5: 0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00 block 71932777
- Balance left: 0.007423 OKB
- Eval encoding: bit-packed LSB first, 1 byte per up to 8 inputs, output LSB = verdict.
- Exhaustive: SpendLimit 4/4, Quorum 8/8, Mood 16/16, DeadMan 8/8, RuleMux 32/32 = 68 total, all OK via on-chain eval.
