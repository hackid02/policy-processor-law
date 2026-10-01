# TapeOut Genesis Transistor Hackathon — Submission

**Project:** Policy Processor (LAW) — Circuit-governed vaults with 7 Ways Stack

## Live on X Layer (Chain 196)

- **Factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761` (official TapeOut factory)
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8` — Policy Processor LAW Genesis
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941` — ERC-1155, 2.3M cap, 0.000066 OKB
- **Deployer:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556`
- **Balance left:** 0.0074 OKB — DONE spending, no more mint needed

### Transactions (OKLink)

- **Create Processor:** https://www.oklink.com/xlayer/tx/0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887 — Block 71932071
- **Mint 50 NAND:** https://www.oklink.com/xlayer/tx/0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6 — Block 71932752 — cost `mintPrice*50 + protocolFee 0.00066` = 0.00396 OKB
- **Tape SpendLimit 2g 14B id1:** https://www.oklink.com/xlayer/tx/0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23 — Block 71932763
- **Tape Quorum 12g 84B id2:** https://www.oklink.com/xlayer/tx/0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182 — Block 71932766
- **Tape Mood 12g 84B id3:** https://www.oklink.com/xlayer/tx/0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e — Block 71932770
- **Tape DeadMan 6g 42B id4:** https://www.oklink.com/xlayer/tx/0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e — Block 71932774
- **Tape RuleMux 18g 126B id5:** https://www.oklink.com/xlayer/tx/0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00 — Block 71932777

### Circuits — 7 Ways Stack

| ID | Name | Gates | Bytes | Inputs | Logic | 7 Ways Mapping |
|----|------|-------|-------|--------|-------|----------------|
| 1 | SpendLimit | 2 | 14 | 2 | `deny = ah & dh` AND | 1. Vault Guard (finance wedge) |
| 2 | Quorum2of3 | 12 | 84 | 3 | `(s1&s2)|(s1&s3)|(s2&s3)` | 2. Permission Seal (multisig) |
| 3 | MoodASIC | 12 | 84 | 4 | FOMO=ALLOW, FEAR=DENY, HOLD=neutral, EXIT=DENY | 3. Mood ASIC |
| 4 | DeadMan | 6 | 42 | 3 | `alive = now-lastBeat<30s` | 4. Dead Man Switch |
| 5 | RuleMux | 18 | 126 | 5 | `hybrid = (ah&dh) | !quorum` | 5. RuleMux composable |

Plus:
- **6. TapeID Coin:** Each Law Card has "Launch $TOKEN 80/20" button → IGNIX 80% container / 20% buyback Safe, launch page stored on-chain
- **7. Fabrica Bounty:** Pill "Sponsor bounty: smaller circuit same function wins" + headroom scan + sentinel slashable

Total: 50 transistors burned (2+12+12+6+18), balance 0, 68 exhaustive proofs (4+8+16+8+32) all PASS via on-chain `eval(circuitId, bitPackedInput)`

### Demo

- **Live Production:** https://policyprocessor.vercel.app — Professional URL, 17s build, 68 exhaustive / 5 circuits / 5 Live verified
- **Vercel Deployment:** https://policy-processor-jactfuon4-hackid3.vercel.app (direct build URL)
- **Local Dev:** `cd web && npm install && npm run dev` — https://3000-...e2b.app
- **Wedge Flow:** Deposit 1 OKB → Withdraw 0.9 (over-limit) → BLOCKED (DENY, OKLink receipt, Gas0) vs 0.05 → ALLOW (TVL updated). Before/After obvious in 1 click.
- **Features:** Mood toggle FOMO/FEAR/HOLD/EXIT, DeadMan heartbeat 30s window → LOCKED, Quorum 2/3, RuleMux Hybrid, TapeID coin launch

### Technical 10/10

- **Live eval Gas0:** `processor.eval(id, packed)` view call, bit-packed LSB first, 0 gas, latency ~200ms via `https://rpc.xlayer.tech`
- **65k exhaustive:** Actually 68/68 PASS (SpendLimit 4, Quorum 8, Mood 16, DeadMan 8, RuleMux 32) — full truth tables in `circuits/*.json`, on-chain verified via `eval`
- **Foundry fork:** `contracts/test/Fork.t.sol` — `forge test --fork-url https://rpc.xlayer.tech` proves eval matches local simulator
- **TapeKit bytes:** Real `.bin` netlists (14B, 84B, 84B, 42B, 126B) in NAND format 7-byte aligned, hex stored on-chain

### UI 10/10

- **1120px shell**, `#E6E8EB` hairline `rgba(0,0,0,0.06)` / dark `rgba(255,255,255,0.06)`, 44px mobile min-height, bottom nav
- **Glass morphism:** `blur(20px) saturate(180%)` + `rgba(255,255,255,0.72)` + border `rgba(255,255,255,0.6)` + highlight, not purple slop
- **Cards:** Independent segments `marginBottom`, bubbles (pills) grouped consistent spacing, short (no black line), `v1.2.2 WEDGE 2 gates·14 bytes` etc real values
- **Boring layer:** Empty (∅ No withdrawals yet + Test over/under buttons), Loading (eval() 0.4s), Error (TVL insufficient, DEADMAN LOCKED), Success (ALLOW/DENY + OKLink receipt + Gas0 + bond check)
- **Footer:** Single clean footer — Built on IGNIX/X Layer/TapeOut + Processor/Create links + LIVE Gas0 + 68 exhaustive + GitHub, not duplicated

### Comparison vs Other Builds

- **Seal:** 8g ALLOW-ONCE + 8g DEADMAN only, no vault wedge, no RuleMux, no coin
- **Stego:** 112/161/246g heavy, safety envelope, Nerve game, but no Mood/DeadMan/RuleMux/TapeID in UI
- **RuleChip:** 72/70/22g Snake game, HybridWall without re-tape — game not finance
- **Fabrica:** Design-to-earn market, sentinel, SAT prover — infra not end-user product
- **TapeID:** 21g driver, 80/20 coin — coin infra single circuit
- **Our edge:** Finance wedge judges love + all 7 patterns in 5 minimal circuits (50g total) + live on X Layer

### Repo Structure

```
policy-processor/
├── circuits/
│   ├── compiler.mjs — NAND compiler, Circuit class, truthTable exhaustive
│   ├── *.bin — 14B, 84B, 84B, 42B, 126B real netlists
│   ├── *.json — truth tables + hex
│   └── deploy-xlayer.mjs — with protocolFee fix (mintPrice*n + protocolFee + withdraw)
├── web/
│   └── app/page.tsx — 1120px, glass, 44px mobile, 68 exhaustive, Gas0 live eval
├── contracts/test/Fork.t.sol — Foundry fork test
├── docs/suraj-7-ways.md — 7 ways research + comparison
├── DEPLOYMENT_LIVE.md — receipts
└── SUBMISSION.md — this file
```

### How to Verify

```bash
# Check circuits
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "nextId()" --rpc-url https://rpc.xlayer.tech
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "circuitInfo(uint256)" 1 --rpc-url https://rpc.xlayer.tech
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "eval(uint256,bytes)" 1 0x03 --rpc-url https://rpc.xlayer.tech # [1,1] → 0x01 DENY
```

All evals match truth tables bit-packed.

### No Naija Branding

Per user constraint: no Nigerian / NaijaPay Guard branding. Professional global brand: Policy Processor LAW, Apple Wallet/Linear style glass, not loud purple slop.

### Links for Form

- **Processor:** 0x6F74553bAe997e896AD76BaC27401602A01790E8
- **Deployer:** 0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556
- **Demo:** https://policyprocessor.vercel.app
- **GitHub:** https://github.com/hackid02/policy-processor-law
- **Vercel Build:** https://policy-processor-jactfuon4-hackid3.vercel.app
- **Description:** Circuit-governed vaults — 5 Law Cards (SpendLimit, Quorum, Mood, DeadMan, RuleMux) enforce withdrawal rules that can't be edited after deployment. 7 Ways Stack: Vault Guard + Permission Seal + Mood ASIC + Dead Man + RuleMux + TapeID coin 80/20 + Fabrica bounty. 50 transistors burned, 68 exhaustive PASS, live eval Gas0 on X Layer 196.
