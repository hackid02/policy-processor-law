# ARCHITECTURE.md — Policy Processor (LAW)

## 1. Architecture Decision Records (ADRs)

### ADR-001: Choose X Layer Factory 0x1f09... for Genesis Hackathon
- **Context:** Factory on BSC 0x6822... can mine BEM, factory on X Layer 0x1f09... cannot, but hackathon requires X Layer.
- **Decision:** Use X Layer factory 0x1f09daefa827f02cbb40967cc91b259763760761, ChainID 196.
- **Consequences:** Cannot mine BEM, must focus on vault use, not mining.

### ADR-002: Supply 2.3M, Price 0.000066 OKB
- **Context:** Supply 88,888 scarce (Remembrance Seal) vs 1M common vs 2.3M story (1000x Intel 4004).
- **Decision:** 2.3M supply, 0.000066 OKB price (same as Stego/Remembrance winners, proven cheap).
- **Consequences:** Story "A thousand 4004s", cheap mint encourages adoption, prevents dust.

### ADR-003: Flat NAND BLIF, No Sub-Circuits
- **Context:** X Layer does not accept circuits referencing sub-circuits (per RuleChip repo).
- **Decision:** All BLIFs flat NAND only, no black-box circuits.
- **Consequences:** Must compile to flat netlist, more gates but compatible.

### ADR-004: Wedge = SpendLimit 12 Gates, Not 112
- **Context:** Stego WITHDRAW_GUARD 112 gates, heavy, hard to demo in 2 min. Suraj framework says wedge not platform.
- **Decision:** MVP 2-bit SpendLimit 12 gates (amount_high & daily_high), expandable to 112-gate 8-bit post-hackathon.
- **Consequences:** Demo in 90s, exhaustive proof 4 combos, easy to grasp, passes 4-hour test.

### ADR-005: PolicyRegistry with Bond/Slash + 25% Revenue
- **Context:** Circuit creators have no monetization, anyone can call free. Need mint demand.
- **Decision:** Bond 2000 LAW slashable if counterexample found, 25% mint proceeds to authors via notifyReward.
- **Consequences:** Security + economics, aligns with Ignix vault mechanics.

### ADR-006: Anti AI-Purple Design System
- **Context:** Most hackathon demos look like AI-purple slop (purple gradients, glassmorphism).
- **Decision:** Brutalist technical: bg #0a0a0a, card #111, border #222, mono proofs, OKLink density, line art.
- **Consequences:** Looks like explorer, not AI demo, judges trust technical depth.

### ADR-007: Next.js + viem + Foundry
- **Context:** Frontend needs wallet connect, X Layer RPC, eval calls. Contracts need fork tests.
- **Decision:** Next.js 14 + viem + wagmi for frontend, Foundry for contracts, Node.js for circuit tests.
- **Consequences:** Standard stack, easy to hire, Vercel deploy, fork tests against live factory.

## 2. System Components

### On-Chain
- **Factory:** 0x1f09... (X Layer) — createCPU(name,symbol,story,supply,price)
- **Processor LAW:** Clone, supply 2.3M, price 0.000066 OKB, story immutable, revenue to deployer
- **Transistor LAW:** ERC1155 id 0=NAND, id 1=LATCH, mint() burns OKB, withdraw() to deployer
- **Circuit NFTs:** ERC721, tapeout() burns NANDs, netlist() view, eval() view
- **PolicyRegistry:** registerPolicy, slashPolicy, notifyReward, reportTamper
- **VaultLaw:** deposit(), withdraw() calls enforce -> eval()

### Off-Chain
- **Frontend:** 6 pages, wallet connect, eval playground, OKLink links, proof blocks
- **Circuits:** BLIF files, test.mjs exhaustive + monotonicity
- **Contracts:** Deploy.s.sol, fork tests, unit tests

## 3. Data Model

**Processor:**
- address, name, symbol, story, totalSupply, mintPrice, minted, sales, circuits, creator

**Circuit:**
- id (1.2.x), name, gates, inputs, outputs, author, bond, active, netlistHash, tapeoutTx, evalExample

**Policy:**
- policyId, circuitId, author, bond, active, name, safetyEnvelope

**Vault:**
- TVL, dailyOutflow, limit, deposits[], withdrawals[], blocked[]

## 4. Security

- Reentrancy guard on VaultLaw
- Exact price checks, bounded payout, pull-payment escrow in PolicyRegistry
- reportTamper checks netlist hash vs expected, deactivates if mismatch (mitigates upgradeable beacon)
- Exhaustive proof + monotonicity + bond slashable
- No wash trading, no self-trading

## 5. Scalability

- eval() read-only, free, node computes, no gas, scales to 1000s QPS
- Processor clone bytecode identical, circuits composable across processors
- Frontend static, Vercel edge, RPC fallback https://rpc.xlayer.tech

## 6. Observability

- Every tx has OKLink link, block number, gas, timestamp
- Every circuit has netlist hash, NAND count, tapeout tx, Circuit NFT page
- Every eval has raw bytes, decoded, latency, gas
- Events: PolicyRegistered, PolicySlashed, Deposit, Withdraw, Blocked, Throttled

## 7. Deployment

- X Layer mainnet, ChainID 196, RPC https://xlayerrpc.okx.com
- Foundry: forge script --rpc-url https://xlayerrpc.okx.com --account law-deployer --broadcast --slow
- Frontend: Vercel --prod
- Explorer: OKLink

## 8. Future Work (Post-Hackathon)

- 8-bit SpendLimit 112 gates (full Stego-like)
- Drawdown Breaker 161 gates, Allocation Band 246 gates
- Nerve bank-run game (like Stego)
- PT/YT revenue vaults (like Circuit Commons)
- SAT prover for smaller equivalent circuit (like Fabrica)
