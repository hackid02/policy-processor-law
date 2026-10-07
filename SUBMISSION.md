# TapeOut Genesis Transistor Hackathon — corrected submission draft

## Project
**Policy Processor (LAW): inspectable Boolean policy circuits on X Layer.**

LAW explores how policy conditions can become small, testable circuits rather than opaque dashboard promises. The application exposes SpendLimit, Quorum2of3, MoodASIC, DeadMan, and RuleMux netlists, lets users change input flags, and separately compare local predictions with actual processor responses.

The Courtroom demonstrates a precisely specified fixed daily withdrawal budget using simulated browser balances. Revised reference contracts show how a vault can pin one policy, derive its own input flags, reject malformed results, and independently enforce the numeric limit. Those revised vault/registry contracts are locally tested reference implementations, not a claimed mainnet vault deployment.

## Required identifiers

- **Chain:** X Layer mainnet, 196.
- **TapeOut factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761`
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8`
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941`
- **Deployment wallet:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556`
- **Supply cap:** 2,300,000.
- **Unit mint price:** 0.000066 OKB, with other fees additional.
- **Website:** https://policyprocessor.vercel.app/ — corrected frontend published on 2026-10-07.
- **Source:** https://github.com/hackid02/policy-processor-law — corrected implementation merged through pull request #1. Record the final submitted commit.
- **Video:** attach an updated capture of the corrected flow. The earlier 3:45 film shows the previous prototype and its threshold mismatch; it is not proof of this patch's behavior.

## Demonstration order

1. Explain the AND truth table and its distinction from numeric arithmetic.
2. Toggle SpendLimit inputs and explicitly verify a packed input against X Layer.
3. Show that Quorum's output `1` means PASS, whereas SpendLimit's `1` means DENY.
4. Open Courtroom with balance 1.00, spent 0.00, daily limit 0.10.
5. Request 0.90: DENY, unchanged balance.
6. Request 0.05 twice: ALLOW, then ALLOW; remaining daily budget becomes zero.
7. Request 0.01: DENY. Deposit more and show it does not reset the budget.
8. Show the shared policy specification, reference-contract tests, and read-only mainnet verification report.

## Circuit inventory

| ID | Circuit | NAND gates | Encoded bytes | Input cases | Meaning of output 1 |
|---|---|---:|---:|---:|---|
| 1 | SpendLimit | 2 | 14 | 4 | DENY |
| 2 | Quorum2of3 | 12 | 84 | 8 | PASS |
| 3 | MoodASIC | 12 | 84 | 16 | DENY |
| 4 | DeadMan | 6 | 42 | 8 | DENY |
| 5 | RuleMux | 18 | 126 | 32 | DENY |

Total: 50 gates, 68 input combinations. This count is not a claim of 68 different security properties.

## Evidence

`reports/mainnet-verification.json` records factory registration, issuance parameters, exact netlist matches, all 68 eval cases, and listed manufacturing receipts at a recorded block. `reports/local-tests.txt` records local netlist/model/contract regression tests. `reports/browser-tests.json` records browser behavior with explicitly mocked RPC error cases. See VERIFY.md to reproduce.

## Judging relevance

- **Application innovation:** a concrete policy-inspection workflow and an explicit boundary between numeric input derivation, circuit evaluation, and enforcement.
- **TapeOut integration:** existing processor, five taped-out circuit references, encoded netlists, bit packing, and verifiable evaluation.
- **Product completeness:** a usable circuit playground and deterministic simulator; reference-contract enforcement is locally tested, not promoted as production custody.
- **Asset issuance design:** cap and price disclosed, with demand tied to new circuit creation rather than every evaluation. See ECONOMICS.md.
- **X Layer quality:** reproducible read-only checks against actual chain data at a specified block.
- **Growth potential:** target independent policy/circuit builders and vault integrators. No fabricated adoption metrics are offered.
- **Security and economics:** documented remaining governance/upgrade risks, fail-closed behavior, and removal of unimplemented collateral/revenue claims. No independent audit is claimed.

## Before submitting

- [x] Publish and verify the corrected website and source commit.
- [ ] Re-run local, browser, and mainnet checks against the submitted revision.
- [ ] Attach the appropriate updated video or a short correction clip, clearly identifying which build is shown.
- [ ] Confirm required fields in the actual organizer's submission flow; this Markdown file is not submission confirmation.
- [ ] Submit before **2026-10-09 04:00 UTC / 05:00 Lagos** under the currently published rules.
- [ ] Do not present trading leaderboards as hackathon judging scores or manufacture transactions for eligibility.

Official rules: https://ignix.bot/x_campaign#hackathon-rules
