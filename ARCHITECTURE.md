# Current architecture

## Existing on-chain manufacturing layer
TapeOut factory → LAW processor → five encoded combinational NAND netlists. Existing deployment identifiers are in DEPLOYMENT_LIVE.md. `verify-mainnet.mjs` validates the chain, association, issuance parameters, netlists, truth tables and listed receipts without a signer.

## Law Card playground
`web/lib/policy.ts` is the independent Boolean model. Each card displays the model's result explicitly. The optional verification button packs the current bits LSB-first, checks chain 196, calls the existing processor, strictly decodes one output byte, and compares the actual result with the model. A request counter prevents stale responses from validating changed inputs. No RPC error is converted into a successful verification.

SpendLimit, Mood, DeadMan and RuleMux use 1=DENY. Quorum uses 1=PASS. Mode meanings follow the encoded circuit, not the earlier marketing formula. FEAR and HOLD share an AND guard. Liveness is an input bit, not a timer implemented by the circuit.

## Courtroom simulation
The same TypeScript module supplies integer-wei accounting and a fixed global 0.10 OKB UTC-day budget. Its state is stored only in React memory. The initial balance is 1.00 OKB with zero spent. The decision log has no explorer receipt links because it does not represent transactions.

The five playground controls do not silently govern this separate numerical-limit simulator. This boundary is shown in the interface.

## Revised reference contracts
PolicyRegistry stores curated policy references and netlist hashes. Only its owner registers or disables policies; actual tampering can be reported permissionlessly. There is no collateral, slashing, or revenue-distribution implementation.

VaultLaw pins the policy and derives the numeric over-limit predicate from its own state. It supplies `[overLimit, 1]` to a validated AND circuit. It checks the policy/hash on each request, strictly validates output, and enforces the numeric guard independently. It uses a fixed global daily limit, checks-effects-interactions, and a reentrancy guard.

These contracts are compiled and exercised on an isolated EVM in tests. They have not been deployed by this patch. A valid processor deployment is not evidence that a vault adapter has been deployed.

## Retained limitations
Registry administration can stop withdrawals. Upstream execution can change despite an unchanged netlist. No authenticated multisig inputs, oracle integrity mechanism, automatic liveness source, emergency exit, or production governance design is supplied. See SECURITY.md before any use with funds.
