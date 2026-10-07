> HISTORICAL / SUPERSEDED. This file describes an earlier prototype and may contain incorrect claims. Do not use it as a submission or security specification. See README.md, VERIFY.md, SECURITY.md and SUBMISSION.md at the repository root.

# Claude AI — Full Audit & Stress Test Pack for Policy Processor LAW

Copy everything below and give to Claude. Include these files as attachments.

## What to Give Claude

### 1. Core Files (must attach)

```
policy-processor/
├── circuits/
│   ├── compiler.mjs          # NAND compiler, truthTable generator
│   ├── SpendLimit.bin        # 14B 2 gates
│   ├── Quorum2of3.bin        # 84B 12 gates
│   ├── MoodASIC.bin          # 84B 12 gates
│   ├── DeadMan.bin           # 42B 6 gates
│   ├── RuleMux.bin           # 126B 18 gates
│   ├── SpendLimit.json       # truth table 4 rows + hex
│   ├── Quorum2of3.json       # 8 rows
│   ├── MoodASIC.json         # 16 rows
│   ├── DeadMan.json          # 8 rows
│   ├── RuleMux.json          # 32 rows
│   └── deploy-xlayer.mjs     # deploy script with protocolFee fix
├── web/app/page.tsx          # Full UI 1120px glass, 68 exhaustive, Gas0 live eval
├── contracts/test/Fork.t.sol # Foundry fork test
├── docs/suraj-7-ways.md      # 7 Ways research + comparison
├── DEPLOYMENT_LIVE.md        # Live txs + addresses
├── SUBMISSION.md             # Submission fields
└── README.md
```

### 2. Live On-Chain Context (paste this)

```
X Layer Chain 196
Factory: 0x1f09DAeFA827f02CBb40967cc91b259763760761
Processor: 0x6F74553bAe997e896AD76BaC27401602A01790E8
Transistors: 0xeDDe115d032bE238cd7AA37AEc183262C598a941
Deployer: 0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556
RPC: https://rpc.xlayer.tech

Txs:
Create 0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887 block 71932071
Mint 50 0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6 block 71932752 cost 0.00396 OKB = mintPrice*50 + protocolFee 0.00066
Tape1 id1 2g 0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23 block 71932763
Tape2 id2 12g 0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182 block 71932766
Tape3 id3 12g 0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e block 71932770
Tape4 id4 6g 0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e block 71932774
Tape5 id5 18g 0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00 block 71932777

Eval encoding: bit-packed LSB first, 1 byte per up to 8 inputs
Example: SpendLimit [ah=1,dh=1] -> packed = 1|2 = 3 -> 0x03 -> eval -> 0x01 DENY
Truth tables in JSON files must match on-chain eval for all 68 cases (4+8+16+8+32)
```

### 3. Prompt to Give Claude (copy-paste)

```
You are a senior smart contract auditor + full-stack stress tester for TapeOut hackathon.

Project: Policy Processor LAW — circuit-governed vaults on X Layer 196.

Goal: Find bugs, vulnerabilities, logic errors, UI issues, gas issues, and give 10/10 fixes.

CONTEXT:
- 5 NAND circuits taped live on Processor 0x6F74553bAe997e896AD76BaC27401602A01790E8
- 50 transistors minted/burned, 0.007 OKB left, DONE spending
- Web UI in web/app/page.tsx — 1120px, glass morphism blur20px, 44px mobile, bottom nav
- Must keep technical 10/10 (live eval Gas0, 68 exhaustive, Foundry fork, TapeKit bytes) and UI 10/10

TASKS — Do all:

1. CIRCUIT LOGIC AUDIT:
   - Read compiler.mjs — does it correctly encode NAND? Is nextIdx=2+nIn correct? Any off-by-one?
   - Verify each .json truth table matches claimed logic:
     * SpendLimit: AND (0,0->0, 1,1->1) — 2 gates minimal?
     * Quorum2of3: majority 2-of-3 — 12 gates minimal? Could be smaller (Fabrica bounty)?
     * MoodASIC: FOMO=ALLOW, FEAR=DENY if guard, HOLD=neutral, EXIT=DENY — does truth table match?
     * DeadMan: heartbeat timeout → lock — does [0,0,0]->1, [1,0,0]->0 etc make sense?
     * RuleMux: hybrid = (ah&dh) | !quorum — is composition correct?
   - Check bit-packing: LSB first, 1 byte up to 8 inputs — any endianness bug?
   - Run exhaustive: all 68 cases via on-chain eval vs JSON — any mismatch?
   - Check monotonicity: riskier input never softer verdict?

2. SMART CONTRACT / DEPLOY SCRIPT AUDIT:
   - Read deploy-xlayer.mjs — protocolFee fix (mintPrice*n + protocolFee) + withdraw pattern from Stego — any reentrancy? Any unchecked return?
   - Check mint: id 0 = NAND, id 1 = LATCH — we only mint NAND, correct?
   - Check tapeout: value = TAPEOUT_FEE 0.0013 OKB — any front-running?
   - Check transistor economics: 2.3M cap, 0.000066 OKB, creator withdraw — any griefing?
   - Fork test Fork.t.sol — does it correctly test live deployment? Any missing assert?

3. WEB UI / FULL-STACK STRESS TEST:
   - Read page.tsx — 774 lines, React useState for ah,dh, tvl, dailyOutflow, mood, alive, quorum s1/s2/s3
   - Bugs: stale closure in handleWithdraw? dailyOutflow functional update? TVL negative? Check Math.max(0, p-amount)
   - Race: isLoading prevents double withdraw? Good.
   - Eval: bit-packed vs old 0x0ah0dh bug — fixed to packed = ah|dh<<1 — verify
   - Glass: backdropFilter blur(20px) saturate(180%) — does it work on mobile? Performance?
   - Cards: independent segments marginBottom, pills grouped — any layout shift?
   - Boring layer: empty (∅ + Test buttons), loading (eval() 0.4s), error (TVL insufficient, DEADMAN LOCKED), success (ALLOW/DENY + OKLink + Gas0) — all present?
   - Footer: single clean footer? Previously duplicated — fixed?
   - Deploy button: previously dead, now 5 Live ✓ → scroll + OKLink — good?
   - Mobile: 44px min-height, bottom nav, 1120px shell — any overflow-x?
   - No Naija branding — check for any Nigerian text?

4. SECURITY / VULNERABILITIES:
   - Any private key leak in repo? (We use env PRIVATE_KEY, not hardcoded)
   - Any XSS via oklink URLs? (We use target="_blank" rel="noopener" — good)
   - Any infinite loop in truthTable generation? (256*256 loop for 65k — but we have 68, ok)
   - Any gas griefing in eval? (eval is view, Gas0, ok)
   - Any transistor burn griefing? (50 burned, balance 0, ok)

5. COMPARISON / IDEA 10/10:
   - Read docs/suraj-7-ways.md — does our 7 Ways Stack cover Vault Guard, Permission Seal, Mood, DeadMan, RuleMux, TapeID coin, Fabrica bounty? Any missing?
   - Compare to Seal/Stego/RuleChip/Fabrica/Neon/TapeID — is our edge (finance wedge + all 7 in 50g) valid?
   - Is usefulness clear? Before $2M drained config file vs After Law Card NFT permanent?

6. STRESS TEST:
   - Simulate 100 rapid withdraws — does dailyOutflow cap at 10 prevent overflow? Does TVL stay >=0?
   - Simulate mood toggles + deadman expiry + quorum fail all at once — finalDeny logic correct?
   - Simulate bit-packed inputs 0x00..0xFF for 5 circuits — any revert?

OUTPUT FORMAT:
- Give severity: Critical / High / Medium / Low / Info
- For each bug: file:line, description, exploit scenario, fix (code snippet)
- For UI: screenshot description + CSS fix
- For gas: optimization suggestion
- Final score: Technical /10, UI /10, Idea /10 with justification
- List OK to submit or must-fix before submission

Do not hallucinate — only report bugs you can prove from attached files and live RPC https://rpc.xlayer.tech.
```

### 4. What NOT to Give Claude

- ❌ Private key `0x***REDACTED***` — NEVER share
- ❌ `.env` files
- ❌ `node_modules`

### 5. How to Package

Option A — Zip:
```bash
cd /home/user
zip -r policy-processor-audit.zip policy-processor/circuits/*.bin policy-processor/circuits/*.json policy-processor/circuits/*.mjs policy-processor/web/app/page.tsx policy-processor/contracts/test/Fork.t.sol policy-processor/docs/*.md policy-processor/*.md -x "*/node_modules/*"
```

Option B — Just upload files + paste prompt into Claude web.

Option C — Give Claude GitHub link if repo is public.

## Expected Claude Output

Claude should return:
- Bug list with fixes
- Stress test results (100 withdraws, mood+deadman+quorum combined)
- Gas report
- UI fixes (if any purple slop, layout shift)
- Final scores

If Claude finds Critical bug, fix before hackathon submission.

---

Generated: 2026-09-29 — Processor live, 68/68 PASS, DONE spending.
