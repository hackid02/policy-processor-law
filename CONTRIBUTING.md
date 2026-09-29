# CONTRIBUTING.md — Policy Processor (LAW)

## Pro Coder Workflow (No Vibecoding)

### 1. Before Code
- Read DESIGN.md, ARCHITECTURE.md, PRD.md, UFD.md, Blueprint.md
- Check ADRs in ARCHITECTURE.md
- Run `pnpm test:circuits` — all 20 combos must PASS
- No code without UFD + Blueprint approval

### 2. Branching
- `main` — protected, requires PR + CI pass
- `feat/*` — new feature (e.g., feat/spendlimit-8bit)
- `fix/*` — bug fix
- Conventional commits: `feat: add quorum circuit`, `fix: eval playground latency`

### 3. Circuit Changes
- Edit BLIF in circuits/
- Run `node circuits/test.mjs` — exhaustive + monotonicity must PASS
- Update truth table in README.md + DESIGN.md
- PR must include proof output

### 4. Contract Changes
- Edit contracts/*.sol
- Run `forge test` + `forge test --fork-url https://xlayerrpc.okx.com`
- Mutation test: 13 bugs must be caught
- No secrets in repo, use .env.local

### 5. Frontend Changes
- Every screen must have empty/loading/error/success/proof states
- Every tx must have OKLink link
- No purple gradients, no glassmorphism — brutalist technical per DESIGN.md
- Test with OKX Wallet on X Layer 196, not localhost

### 6. Deployment
- Processor deploy: `forge script contracts/Deploy.s.sol:DeployPolicyProcessor --rpc-url https://xlayerrpc.okx.com --account law-deployer --broadcast --slow` — requires approval (burns OKB, irreversible)
- Mint: via tapeout.net or processor.mint(0,15)
- Tape out: via canvas import BLIF, self-test PASS, wallet confirm (burns NANDs, irreversible)
- Frontend: `vercel --prod`

### 7. Security
- No wash trading, no self-trading (disqualifier)
- Report tamper: check netlist hash vs expected
- Bond slashable: anyone can submit counterexample

### 8. Submission
- Processor address, deployer wallet, demo link, description, X post @XLayerOfficial @Ignixbot
- Demo video 2 min: problem 0-10s, before 10-30s, after 30-90s, proof 90-110s, growth 110-120s
