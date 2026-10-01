# Policy Processor LAW - Live Deployment X Layer 196

**Status: LIVE - 5 circuits taped, 50 transistors burned, 68 exhaustive proofs**

## On-Chain Addresses

- **Factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761` (TapeOut official)
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8` - Policy Processor LAW Genesis
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941` (ERC-1155)
- **Deployer:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556`
- **Beacon:** `0x1059Ad62cAbB6a6925bb65aA617300556c60A51B` impl `0x265bf10faB9ddEC0eE0A649C6B9DB845f1b9a06b`

## Economics

- Supply cap: 2,300,000 (1000x Intel 4004)
- Mint price: 0.000066 OKB (66000000000000 wei) immutable
- Protocol fee: 0.00066 OKB per mint batch (factory.protocolFee)
- Tapeout fee: 0.0013 OKB per circuit
- Deploy fee: 0.0066 OKB
- Mint cost formula: `mintPrice * n + protocolFee`
- Creator withdraw: `transistors.withdraw()` recycles proceeds

## Transactions

| Action | Tx Hash | Block | Gas | Details |
|--------|---------|-------|-----|---------|
| Create Processor | `0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887` | 71932071 | - | Policy Processor LAW |
| Mint 50 NAND | `0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6` | 71932752 | 157599 | 50 transistors, cost 0.00396 OKB |
| Tape SpendLimit 2g 14B id1 | `0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23` | 71932763 | 246582 | AND gate, 2 inputs |
| Tape Quorum 12g 84B id2 | `0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182` | 71932766 | 240633 | 2-of-3 majority |
| Tape Mood 12g 84B id3 | `0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e` | 71932770 | 240633 | FOMO/FEAR/HOLD/EXIT |
| Tape DeadMan 6g 42B id4 | `0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e` | 71932774 | 223740 | Heartbeat lock |
| Tape RuleMux 18g 126B id5 | `0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00` | 71932777 | 252730 | SpendLimit+Quorum hybrid |

Final balance: 0.007423 OKB left.

## Circuits - 7 Ways Stack

| ID | Name | Gates | Bytes | Inputs | Function | 7 Ways |
|----|------|-------|-------|--------|----------|--------|
| 1 | SpendLimit | 2 | 14 | 2 | `deny = ah & dh` AND | 1. Vault Guard (wedge) |
| 2 | Quorum2of3 | 12 | 84 | 3 | `(s1&s2)|(s1&s3)|(s2&s3)` majority | 2. Permission Seal (multisig) |
| 3 | MoodASIC | 12 | 84 | 4 | FOMO=ALLOW, FEAR=DENY if guard, HOLD=neutral, EXIT=DENY | 3. Mood ASIC |
| 4 | DeadMan | 6 | 42 | 3 | `alive = now-lastBeat<1h` | 4. Dead Man Switch |
| 5 | RuleMux | 18 | 126 | 5 | `hybrid = (ah&dh) | !(quorum)` | 5. RuleMux composable |

Plus:
- 6. TapeID coin: Each Law Card "Launch $TOKEN 80/20" button → IGNIX 80% container / 20% buyback
- 7. Fabrica bounty: Pill "Sponsor bounty: smaller circuit same function wins" + headroom scan

Total transistors burned: 2+12+12+6+18 = 50 (balance 0, minted 50)
Total exhaustive: 4+8+16+8+32 = 68 cases, all verified on-chain via `eval(circuitId, bitPackedInput)`

## Eval Encoding

- Input: bit-packed LSB first, 1 byte per up to 8 inputs
  - SpendLimit [ah,dh] → packed = ah|dh<<1 → 0x00..0x03
  - Quorum [s1,s2,s3] → 0x00..0x07
- Output: `0x00` = ALLOW, `0x01` = DENY (LSB)
- Example: SpendLimit [1,1] → input `0x03` → output `0x01` (DENY)

## Verification

```bash
# Check circuits
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "nextId()" --rpc-url https://rpc.xlayer.tech
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "circuitInfo(uint256)" 1 --rpc-url https://rpc.xlayer.tech
cast call 0x6F74553bAe997e896AD76BaC27401602A01790E8 "eval(uint256,bytes)" 1 0x03 --rpc-url https://rpc.xlayer.tech
```

All 68 evals return expected truth table values.

## UI 10/10

- 1120px shell, #E6E8EB hairline rgba(0.06), 44px mobile min-height, bottom nav
- Glass morphism: blur(20px) saturate(180%) + rgba(255,255,255,0.72) + border rgba(255,255,255,0.6) + highlight
- Cards: independent segments marginBottom, bubbles (pills) grouped consistent spacing, short (no black line)
- Book + Cards + Courtroom only (Proof section removed per user)
- Footer: single clean footer (not duplicated)

## Links

- OKLink Processor: https://www.oklink.com/xlayer/address/0x6F74553bAe997e896AD76BaC27401602A01790E8
- OKLink CreateTx: https://www.oklink.com/xlayer/tx/0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887
- TapeOut: https://tapeout.net/#l2/xlayer/0x6F74553bAe997e896AD76BaC27401602A01790E8
- **Live Production:** https://policyprocessor.vercel.app (professional, verified 68 exhaustive / 5 circuits / 5 Live)
- **Vercel Build:** https://policy-processor-jactfuon4-hackid3.vercel.app
- Local Dev: https://3000-...e2b.app

## Next Steps for Hackathon Submission

- Update submission form with Processor address, deployer, demo link, GitHub
- Ensure demo shows wedge: deposit 1 OKB → withdraw 0.9 blocked (DENY) vs 0.05 allow
- Show Mood toggle, DeadMan heartbeat, Quorum 2/3, RuleMux hybrid, TapeID coin launch
- Show OKLink receipts + Gas0 + exhaustive 68
