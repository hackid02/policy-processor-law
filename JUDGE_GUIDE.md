# LAW: two-minute judge walkthrough

## One sentence
LAW helps vault developers inspect policy decisions against real circuits on X Layer before integrating them.

## Who it serves and what it proves
A circuit builder has an expected allow/deny result. LAW makes the adapter input explicit, queries the deployed processor, and records whether it agrees. The Courtroom is a useful inspection workflow, not a claim of live asset custody. Developer demand remains a hypothesis to validate with independent users.

## Walkthrough
1. **0:00–0:20 — Explain the boundary.** Five circuits and their processor are on mainnet, manufactured using real OKB. Scenario balances are local. A direct Solidity check is simpler for a lone daily cap; the toolkit explores inspectable/reusable circuit policies.
2. **0:20–0:50 — Make the problem visible.** Open Courtroom. Select 0.90 OKB and Evaluate scenario. Inspect why it is denied: 0.90 exceeds the remaining 0.10 allowance, so the adapter sends `[1, 1]` / `0x03`.
3. **0:50–1:15 — Use the actual deployment.** Click Compare this request on X Layer. Show expected versus actual output and the queried block. If RPC fails, show the error honestly rather than narrating success.
4. **1:15–1:40 — Show a useful boundary.** Evaluate 0.05 twice, then 0.01. Two allows exhaust the allowance; the final request is denied. Custom amounts support exact wei precision. All balance changes remain simulated.
5. **1:40–2:00 — Keep the proof.** Export a comparison JSON. Show exact input, output, status and block, then point to the deployment receipts and recorded 68-case verification. JSON is inspection evidence, not a signed proof or transaction receipt.

## Four claims to avoid
- All five circuits protect real Courtroom withdrawals.
- A current-input RPC response proves future execution cannot change.
- A passing test suite is an independent security audit.
- Every evaluation or withdrawal requires new transistors.

## Before submission
- Confirm the public release and exact submitted revision.
- Record a current product video; the previous long-form film shows an older prototype.
- Confirm deployment-time issuance disclosure and the organizer's submission receipt.
- Privately resolve any historical credential exposure.
- Seek genuine builder feedback; do not fabricate users, trading or endorsements.
