# Issuance design and honest demand assumptions

## Existing parameters

- Chain: X Layer mainnet, ID 196.
- Transistor contract: `0xeDDe115d032bE238cd7AA37AEc183262C598a941`.
- Supply cap: **2,300,000**.
- Unit mint price: **0.000066 OKB** (66,000,000,000,000 wei).
- The unit price is not an all-inclusive transaction cost. Factory, tapeout, and network fees are additional and should be read from current contracts before any transaction.

The read-only verifier compares current parameters with the disclosed values and the recorded creation calldata. See `reports/mainnet-verification.json`.

## Who would acquire transistors?

The intended users are builders who want to tape out new policy circuits on the LAW processor. The useful action is circuit creation/manufacturing, not speculative trading activity.

Once a circuit exists, others can evaluate it without acquiring a new transistor for every evaluation. A withdrawal does not automatically create mint demand. An `eth_call` evaluation generally requires no submitted transaction or transaction gas payment; evaluation inside another transaction still contributes to that transaction's gas use.

Potential demand therefore depends on developers choosing to manufacture additional useful circuits, supported by documentation, reusable adapters, and clear verification. That adoption has not been established by this patch. No growth, liquidity, token appreciation, or yield forecast is claimed.

## Why this cap and price?

The historical project notes chose 2.3 million as a reference to 1,000 times the Intel 4004's transistor count. That is a thematic rationale, not evidence of optimal scarcity or market demand. The unit price was selected as a low per-gate development cost; no market research proving an optimal price is supplied.

These are existing deployment parameters, not newly optimized economics. A credible submission should disclose that distinction rather than inventing demand projections after deployment.

## Incentives not implemented

This patch provides no automatic author revenue allocation, token buyback, bond escrow, slashing rewards, or bounty payout market. The older 25% author-revenue and 80/20 coin claims are not features of the revised product. Any future incentive design needs separate implementation, conservation/accounting tests, and economic review.

## Responsible growth experiment

Invite independent circuit builders or vault developers to test the actual product and record their feedback. Track genuine completed circuit-verification or integration tasks with consent. Do not fabricate users, deposits, TVL, endorsements, or transaction activity. The hackathon explicitly disqualifies fake trading behavior; token volume is not a substitute for product evidence.
