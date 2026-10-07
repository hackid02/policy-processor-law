# Threat model and limitations

**Not independently audited. Do not invite public deposits into the reference vault.** This patch replaces unsafe prototype mechanisms but does not certify a production system.

## Boundaries

### Existing processor
The TapeOut processor and transistor contracts are an existing deployment. The application queries the processor read-only. The patch does not upgrade, replace, or administer those contracts. Upstream proxy/beacon authority and implementation behavior remain external trust assumptions.

### Revised registry
`PolicyRegistry` is a curated reference registry. Its immutable owner can register policies and permanently disable them. The owner cannot change an existing policy's circuit ID or stored hash, but disabling a pinned policy stops its vault's withdrawals. This is an explicit administrative denial-of-service/trust boundary, not a permissionless or no-admin guarantee. No reactivation or emergency user exit is implemented.

`reportTamper(policyId)` compares the live netlist with the hash captured at registration. It does not accept a caller-supplied expected hash. A changed netlist can be reported by anyone. Unchanged bytecode metadata cannot prove that an upgraded processor still executes identically.

No collateral is accepted or accounted for. There is no `slashPolicy`, token escrow, reward splitter, or automatic 25% revenue share. These were unimplemented or unsafe in the earlier prototype and are removed rather than represented as protection.

### Revised reference vault
The vault pins its registry, processor, policy ID, circuit ID, expected netlist hash, and fixed global daily limit at construction. It checks the complete two-input AND truth table at construction, then checks active policy status and the netlist hash before each evaluation.

The only withdrawal argument is the amount. Users cannot choose another policy or supply favorable circuit flags. Only the caller's own deposited balance can be withdrawn. The vault derives `overLimit` itself and sends `[overLimit, 1]` to the pinned AND circuit.

A numeric budget guard remains independent of processor permission. An always-ALLOW processor cannot approve an over-budget request. An always-DENY or reverting processor can still prevent withdrawal; the patch does not solve upstream availability or governance risk.

Empty, multi-byte, and out-of-range verdicts are rejected. Reverting eval/netlist calls propagate; there is no success fallback. Only `0x00` and `0x01` are valid for the pinned deny circuit. Quorum's `1=PASS` convention is not interchangeable with this circuit's `1=DENY` convention.

State updates precede external transfers and deposit/withdraw functions have a reentrancy guard. Failed transfers roll back accounting. A denied transaction reverts, so a Blocked event inside it would not persist; no such event receipt is promised.

The limit is global across depositors and resets at a UTC calendar-day boundary, not after a rolling 24-hour interval. Depositors can consume a shared daily budget and delay other users' access; this is a disclosed consequence of this example policy, not production allocation fairness. Per-user quotas and priority rules are not implemented.

Forced native-token transfers are not credited as deposits; only accounted balances are withdrawable. There is no administrative sweep function.

### Frontend
Courtroom accounting is an in-memory browser simulation using integer wei. Reset/reload discards it. It never signs a transaction or moves funds. Its log is not a blockchain receipt.

Law Card predictions are labelled LOCAL MODEL. An explicit verification button separately reads the current packed input from an X Layer RPC. Previous checks are invalidated on changes, stale responses are ignored, and mismatches/errors are visible. RPCs remain trusted data providers, not cryptographic proofs presented by the browser.

Other circuit controls are input flags. They are not multisig signatures, authenticated risk-oracle values, or trusted liveness timestamps. They do not enforce additional restrictions in the daily-limit reference vault.

## Before any new real-fund deployment

- Obtain independent review of contracts, upstream upgrade powers, and integration semantics.
- Decide and document governance, pause/exit design, and recovery behavior.
- Define user fairness, oracle/authentication requirements, and malicious-recipient handling.
- Test the exact deployed bytecode against a pinned X Layer fork, including failures and upgrades.
- Verify constructor arguments, deployment ownership, and contract source.
- Start only with explicitly approved, tightly limited funds after review; no public safety claim follows from local tests.

## Reporting

Use the repository maintainer's security contact for sensitive reports. Do not publish private keys, exploit credentials, or live-user data in an issue. The removed historical prototype contracts must not be deployed as production alternatives.

## Historical credential hygiene

The repository history contains credential-redaction commits. If any signing key was ever committed, deleting/redacting the file does not make that key safe again. Review this privately, rotate affected credentials where possible, and use a fresh reviewed deployment account for future contracts. This patch does not rotate wallets or remove past Git history. Never send private keys in chat.
