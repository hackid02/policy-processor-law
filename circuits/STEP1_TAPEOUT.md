# Step 1: Real TapeOut Circuits - DONE (Ready to Deploy)

## Factory (X Layer 196)
- Factory: `0x1f09DAeFA827f02CBb40967cc91b259763760761` (ERC-1967 proxy, verified)
- Beacon Processor: `0xf70d1ed4f62CF3780157B0b421b7E2F45bD0991C`
- Beacon Transistors: `0x1059AD62CaBB6A6925bb65AA617300556C60A51b`
- RPC: https://rpc.xlayer.tech / https://xlayerrpc.okx.com

## Real NAND Netlists Compiled (7 bytes per NAND: 0x00 + 3-byte BE a + 3-byte BE b)

| Circuit | nIn | nOut | Gates | Bytes | Hex (first 64) | Truth Table |
|---------|-----|------|-------|-------|----------------|-------------|
| SpendLimit | 2 | 1 | 2 | 14 | 0x0000000200000300000004000004 | ah&dh: 00->0,01->0,10->0,11->1 |
| Quorum2of3 | 3 | 1 | 12 | 84 | 0x00000002000003... | majority: 000->0,110->1,111->1 |
| MoodASIC | 4 | 1 | 12 | 84 | 0x00000004000005... | FOMO 00->ALLOW, EXIT 11->DENY |
| DeadMan | 3 | 1 | 6 | 42 | 0x00000002000002... | !alive \| (ah&dh) |
| RuleMux | 5 | 1 | 18 | 126 | 0x00000002000003... | (ah&dh) \| !quorum |

Total: 50 NAND gates = 50 transistors needed. Mint 100 for safety.

## Verification
- Exhaustive: SpendLimit 4/4, Quorum 8/8, Mood 16/16, DeadMan 8/8, RuleMux 32/32
- Monotonicity: PASS (riskier input never softer)
- Simulator: bit-exact with TapeOut eval() (checked against TRACE 8-gate 56-byte format)
- Files: `*.bin` (raw bytes), `*.json` (hex + truth table)

## Deployment Script
`deploy-xlayer.mjs` - uses viem, handles:
1. `factory.deployFee()` -> `createCPU(name, symbol, story, supply, mintPrice)` payable
2. `transistor.mint(0, 100)` payable (0 = NAND id)
3. `processor.TAPEOUT_FEE()` -> `processor.tapeout(nl, nIn, nOut)` payable for each circuit
4. Verify `circuitInfo()` and `eval()` on-chain

Dry run (no PRIVATE_KEY):
```
node deploy-xlayer.mjs
```

Real deploy (needs OKB):
```
PRIVATE_KEY=0x... node deploy-xlayer.mjs
# or with existing processor:
PROCESSOR_ADDRESS=0x... TRANSISTOR_ADDRESS=0x... PRIVATE_KEY=0x... node deploy-xlayer.mjs
```

Costs (approx X Layer):
- deployFee: ~0.001 OKB (from factory)
- mintPrice: 0.000066 OKB * 100 = 0.0066 OKB
- tapeoutFee: ~0.0001 OKB * 5 = 0.0005 OKB
- Total: <0.01 OKB (~$0.10)

## Next Actions for User
1. Get OKB on X Layer: https://www.okx.com/xlayer/faucet or bridge from OKX
2. Export private key from OKX Wallet (burner recommended)
3. Run: `cd circuits && PRIVATE_KEY=0x... node deploy-xlayer.mjs`
4. Save returned Processor address and update `web/app/page.tsx`:
   ```ts
   const PROCESSOR = "0xYOUR_NEW_PROCESSOR" as const;
   ```
5. Redeploy web: `cd ../web && npx vercel --prod --yes --token=...`

## What We Already Did
- Compiled 5 real NAND netlists from Boolean logic (not mock)
- Verified exhaustive 4/4, 8/8, 16/16, 32/32 + monotonicity
- Prepared deployment script with viem, handles fees, mint, tapeout, verification
- Updated UI to show real gate counts + bytes: 2 gates·14 bytes, 6·42, 12·84, 18·126
- Live at https://policyprocessor.vercel.app with real counts

## Remaining for Full On-Chain
- [ ] User provides PRIVATE_KEY with ~0.02 OKB
- [ ] Run deploy script -> get Processor `0x...` + 5 circuitIds + tx hashes
- [ ] Update OKLink links in UI with real txs
- [ ] Foundry fork test against real processor: `forge test --fork-url https://rpc.xlayer.tech`
