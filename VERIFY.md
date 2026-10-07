# Reproduce the evidence

## 1. Install from lockfiles

Use Node 20.9+ and npm. Run `npm ci` at repository root and `npm --prefix web ci` for the web app. Root dependencies are local test tooling, not application production dependencies.

## 2. Independent local circuit checks

```sh
npm run test:circuits
```

Five test groups iterate all **68 inputs** (4 + 8 + 16 + 8 + 32). The tests decode each 7-byte NAND instruction from the `.bin` files, reject invalid references, and compare outputs with both a separately written Boolean formula and the saved JSON table. They also check byte counts, gate counts, uniqueness, and encoded hex consistency.

This is not a 65,536-case test or a security audit.

## 3. Demo and reference-contract regression checks

```sh
npm run test:policy
npm run test:contracts
# all three suites:
npm test
```

The policy suite exercises integer accounting, exact limits, deposits, UTC reset boundaries, bit packing, per-circuit output meaning, mode mapping, and strict RPC decoding.

The contract suite compiles the actual `contracts/PolicyRegistry.sol` and `contracts/VaultLaw.sol` sources with Solidity 0.8.37 targeting Shanghai. It deploys them with a controllable processor fixture on **Anvil chain 31337**, not mainnet. Tests exercise first-request denial, exact boundaries, global multi-user accounting, daily resets, caller-input removal, fail-closed evaluation, pinned hashes, permission checks, transfer rollback, and reentrancy.

The test suite does not use live funds. Mocks are explicitly confined to local fault-injection tests; they do not substitute for a failed mainnet check.

## 4. Existing X Layer deployment

```sh
npm run verify:mainnet
```

The verifier never creates a signer and never sends a transaction. It checks:

1. Chain ID is 196 and all three declared contracts have bytecode.
2. Factory `isCPU(processor)` is true.
3. The processor points to the declared transistor contract.
4. Supply cap is 2,300,000 and unit price is 66,000,000,000,000 wei.
5. Circuit metadata and encoded netlists match the local files.
6. All 68 `eval()` responses match at one recorded block.
7. Listed creation, mint, and five tapeout receipts succeeded, used the declared sender/targets, and fall inside the published hackathon window.
8. The processor-creation calldata includes the disclosed supply and unit price.

The report includes timestamp, block number/hash, per-check results, receipts, and errors. See `reports/mainnet-verification.json`. A verification result is a snapshot, not continuous monitoring or a guarantee against subsequent upgrades.

The checked receipts are **deployment/manufacturing receipts**, not Courtroom withdrawal receipts. No revised vault deployment is claimed.

A network or assertion failure leaves status `NOT_VERIFIED` and exits nonzero. Rerun with a trusted X Layer RPC if needed; do not relabel the failure as a pass.

## 5. Web build and browser regression checks

```sh
npm --prefix web run build
npm --prefix web run start
# In another terminal:
npx playwright install --with-deps chromium
npm run test:browser
```

The production build enforces TypeScript checks. Browser tests intentionally mock RPC transport to exercise valid results, mismatches, wrong-chain responses, invalid bytes, outages, and stale asynchronous responses. They also test actual buttons, daily-limit behavior, reset, legacy redirects, and mobile overflow.

Browser RPC mocks are not on-chain evidence. Use the separate mainnet report for that.

## Evidence freshness

Reports bundled with this patch record the actual local run, not future promises. Re-run tests after modifications, record the exact submitted Git commit, and confirm the deployed frontend serves that commit. Do not infer production deployment from a successful local build.
