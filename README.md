# Policy Processor LAW — Circuit-governed Vaults on X Layer

**Live Demo:** https://policyprocessor.vercel.app — GitHub: https://github.com/hackid02/policy-processor-law

**We help vaults enforce withdrawal rules that can't be edited after deployment.**

Before: Config file in GitHub, editable silently, $2M drained.  
After: Law Card NFT, permanent NAND circuit, free `eval()`, OKLink receipt, bond slashable.

Live on X Layer 196: `0x6F74553bAe997e896AD76BaC27401602A01790E8` — 5 circuits, 50 transistors burned, 68 exhaustive PASS.

## Live Deployment

- **Factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761`
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8`
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941` — 2.3M cap, 0.000066 OKB, 50/50 burned
- **Deployer:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556`
- **Create:** https://www.oklink.com/xlayer/tx/0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887
- **Mint 50:** https://www.oklink.com/xlayer/tx/0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6 (cost `mintPrice*50 + protocolFee 0.00066`)
- **Tape 1-5:** 0x20a4...2f23, 0x1a1e...2182, 0x600d...001e, 0x38cf...bef7e, 0x8ced...a4fe00

## 7 Ways Stack (10/10 Idea)

| ID | Name | Gates | Bytes | 7 Ways |
|----|------|-------|-------|--------|
| 1 | SpendLimit | 2 | 14 | Vault Guard — wedge, finance judges love |
| 2 | Quorum2of3 | 12 | 84 | Permission Seal — 2-of-3 multisig |
| 3 | MoodASIC | 12 | 84 | Mood — FOMO/FEAR/HOLD/EXIT |
| 4 | DeadMan | 6 | 42 | Dead Man Switch — heartbeat → lock |
| 5 | RuleMux | 18 | 126 | RuleMux — SpendLimit+Quorum→Hybrid without re-tape |

Plus TapeID coin (80/20 IGNIX) and Fabrica bounty (smaller circuit wins).

## Quick Start

```bash
cd web
npm install
npm run dev
# Open http://localhost:3000
```

### Wedge Demo (1 click)

1. **Deposit 1 OKB** → TVL 1.0 → 2.0
2. **Withdraw 0.9 (over-limit)** → DENY — circuit `ah & dh`, OKLink receipt, Gas0, bond check
3. **Withdraw 0.05 (under)** → ALLOW — TVL updated
4. Toggle **Mood** FOMO/FEAR/HOLD/EXIT → verdict changes
5. **Heartbeat** → DeadMan alive 30s window → LOCKED after timeout
6. **Quorum** s1/s2/s3 → 2/3 needed
7. **RuleMux** hybrid = SpendLimit OR !Quorum
8. **Launch $TOKEN 80/20** → TapeID coin

## Technical 10/10

- **Live eval Gas0:** `processor.eval(id, bitPacked)` view, bit-packed LSB first, 0 gas
  - SpendLimit [1,1] → `0x03` → `0x01` DENY
- **Exhaustive:** 68/68 PASS (4+8+16+8+32) — `circuits/*.json` truth tables vs on-chain eval
- **Foundry fork:** `forge test --fork-url https://rpc.xlayer.tech` — `contracts/test/Fork.t.sol` proves live circuits
- **TapeKit bytes:** Real `.bin` netlists 14B/84B/84B/42B/126B NAND 7-byte aligned, hex on-chain

```bash
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "eval(uint256,bytes)" 1 0x03 --rpc-url https://rpc.xlayer.tech
```

## UI 10/10

- **1120px shell**, `#E6E8EB` hairline `rgba(0,0,0,0.06)`, 44px mobile min-height, bottom nav
- **Glass:** `blur(20px) saturate(180%)` + `rgba(255,255,255,0.72)` + border `rgba(255,255,255,0.6)` + highlight
- **Cards:** Independent segments `marginBottom`, pills grouped consistent spacing, short (no black line), real values `2 gates·14 bytes`
- **Boring layer:**
  - Empty: ∅ No withdrawals yet + Test over/under buttons
  - Loading: eval() 0.4s spinner
  - Error: TVL insufficient, DEADMAN LOCKED
  - Success: ALLOW/DENY + OKLink receipt + Gas0 + bond check
- **Footer:** Single clean footer — IGNIX/X Layer/TapeOut + Processor/Create + LIVE Gas0 + 68 exhaustive + GitHub

## Circuits

Compiled via `circuits/compiler.mjs` — custom NAND compiler, Circuit class `nIn/nOut/nextIdx=2+nIn`, `encodeNAND`, `truthTable` exhaustive.

```
SpendLimit: 2 gates, 14 bytes, AND
Quorum2of3: 12 gates, 84 bytes, majority
MoodASIC: 12 gates, 84 bytes, 4 inputs
DeadMan: 6 gates, 42 bytes, 3 inputs
RuleMux: 18 gates, 126 bytes, 5 inputs
Total: 50 gates burned
```

## Comparison

- **Seal:** 8g + 8g only, no vault
- **Stego:** 112/161/246g heavy, no Mood/DeadMan/RuleMux/TapeID UI
- **RuleChip:** 72/70/22g game, not finance
- **Fabrica:** market infra, not product
- **TapeID:** 21g coin infra
- **Ours:** Finance wedge + all 7 in 50g minimal

## Docs

- `docs/suraj-7-ways.md` — 7 ways research + comparison
- `DEPLOYMENT_LIVE.md` — receipts
- `SUBMISSION.md` — hackathon form fields

## No Naija Branding

Professional global brand: Policy Processor LAW, Apple Wallet/Linear glass, not purple slop.

## License

MIT
