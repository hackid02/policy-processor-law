# TECH_STACK.md — Policy Processor (LAW)

## Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Wallet:** wagmi 2.x + viem 2.x + OKX Wallet (EIP-1193)
- **Chain:** X Layer ChainID 196, RPC https://xlayerrpc.okx.com, fallback https://rpc.xlayer.tech
- **Styling:** Tailwind CSS (but custom brutalist, no purple), Inter font, JetBrains Mono for proofs
- **Deploy:** Vercel, edge runtime, static export for /circuits
- **Testing:** Vitest + Playwright E2E (wallet injected, board from chain)

## Contracts
- **Framework:** Foundry (forge, anvil, cast)
- **Language:** Solidity 0.8.20
- **Libs:** OpenZeppelin 5.x (ReentrancyGuard, Ownable)
- **Chain:** X Layer mainnet 196, test via anvil --chain-id 196 + fork https://xlayerrpc.okx.com
- **Testing:** forge test, forge test --fork-url https://xlayerrpc.okx.com --match-path test/fork/*, mutation test (13 bugs)
- **Deploy:** forge script --rpc-url https://xlayerrpc.okx.com --account law-deployer --broadcast --slow

## Circuits
- **Format:** BLIF flat NAND, 7-byte per NAND (0x00 + 3-byte id A + 3-byte id B), LATCH 4 bytes
- **Design:** TapeOut canvas https://tapeout.net/#l2/xlayer/{processor}/canvas + local BLIF files
- **Testing:** Node.js test.mjs exhaustive over all inputs (4/4 MVP, 256/256 8-bit, 65k/65k full), monotonicity check, bit-exact with on-chain eval()
- **Tools:** GateSmith (human-readable Boolean -> deterministic compiler), Fabrica CLI (compile Verilog to netlist, SAT prover)

## Infra
- **RPC:** https://xlayerrpc.okx.com (primary), https://rpc.xlayer.tech (fallback), retry 2s timeout
- **Explorer:** OKLink https://www.oklink.com/xlayer/tx/{hash}, https://www.oklink.com/xlayer/address/{addr}
- **TapeOut:** https://tapeout.net/#l2/xlayer/{processor}, https://tapeout.net/#l2account/xlayer/{processor}/{circuitId}
- **Storage:** No backend, static frontend, localStorage for draft (processor address, wallet, supply, price, cap, circuit, use case, demo, description) per Likely2X pattern

## Tooling (Pro Coder Setup)
- **Lint:** ESLint + Prettier + Solhint
- **Git:** Conventional commits, husky pre-commit (lint + test)
- **CI:** GitHub Actions (lint, test, build, fork test)
- **Package Manager:** pnpm (frontend), forge (contracts)
- **Env:** .env.example -> .env.local with X Layer addresses, no secrets in repo

## Why This Stack?
- Next.js + viem: Standard for X Layer hackathons, OKX Wallet support, easy Vercel deploy
- Foundry: Standard for TapeOut X Layer projects (Stego, Fabrica, LeoLabs, GateSmith all use Foundry), fork tests against live factory
- Flat NAND BLIF: Required for X Layer (no sub-circuits), proven by RuleChip, NANDY, GateSmith
- Brutalist design: Anti AI-purple, looks like OKLink explorer, judges trust technical depth
- No backend: TapeOut circuits free to call, no server to go down, 100% on-chain (per TapeKit spec)

## Alternatives Considered
- Hardhat vs Foundry: Foundry chosen for fork tests and real projects using it
- BSC vs X Layer: BSC can mine BEM but hackathon requires X Layer, so X Layer
- 112-gate vs 12-gate: 112-gate like Stego is more secure but fails 2-min demo, 12-gate MVP passes 4-hour test, expandable post-hackathon
- Purple gradient vs brutalist: Purple fails judge trust, brutalist technical passes
