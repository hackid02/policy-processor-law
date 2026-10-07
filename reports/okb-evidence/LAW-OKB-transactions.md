# LAW: verified real-OKB transaction evidence

Read-only verification: 2026-10-07T02:18:36.710043+00:00. Network: **X Layer mainnet, chain 196**.

## Summary

**All seven recorded project transactions succeeded.** They show real native OKB sent to the factory, transistor contract and processor, with real network fees. This is separate from simulated Courtroom balances and withdrawals.

- Transaction value sent: **0.01706 OKB**.
- Execution fees: **0.000042449222122461 OKB** (`gasUsed × effectiveGasPrice`).
- Additional L1 fees reported in these receipts: **0 OKB**.
- Transaction value plus reported network fees: **0.017102449222122461 OKB**.
- Deployment wallet balance at block 72570480: **0.007423765182090404 OKB**.

These totals cover only these seven transactions. Transaction value is the amount sent with the call, not an independently traced net cost after any internal refunds. Incoming funding, bridges, other wallet activity and USD valuations are not included. Application fees paid to contracts are part of transaction value, not the network-fee column.

## Addresses

- **Factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761` ([OKLink](https://www.oklink.com/x-layer/evm/address/0x1f09DAeFA827f02CBb40967cc91b259763760761))
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8` ([OKLink](https://www.oklink.com/x-layer/evm/address/0x6F74553bAe997e896AD76BaC27401602A01790E8))
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941` ([OKLink](https://www.oklink.com/x-layer/evm/address/0xeDDe115d032bE238cd7AA37AEc183262C598a941))
- **Deployer:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556` ([OKLink](https://www.oklink.com/x-layer/evm/address/0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556))

## Amounts and dates

| Action | Date and time (UTC) | OKB sent | Execution fee (OKB) | Block |
|---|---|---:|---:|---:|
| Create LAW processor | 2026-09-29T16:58:27+00:00 | 0.0066 | 0.000015210880760544 | 71932071 |
| Mint transistors | 2026-09-29T17:09:48+00:00 | 0.00396 | 0.000003151980157599 | 71932752 |
| Tape SpendLimit | 2026-09-29T17:09:59+00:00 | 0.0013 | 0.000004931640246582 | 71932763 |
| Tape Quorum | 2026-09-29T17:10:02+00:00 | 0.0013 | 0.000004812660240633 | 71932766 |
| Tape Mood | 2026-09-29T17:10:06+00:00 | 0.0013 | 0.000004812660240633 | 71932770 |
| Tape Dead Man | 2026-09-29T17:10:10+00:00 | 0.0013 | 0.00000447480022374 | 71932774 |
| Tape RuleMux | 2026-09-29T17:10:13+00:00 | 0.0013 | 0.00000505460025273 | 71932777 |

All seven transactions occurred on **29 September 2026**. Lagos time is one hour ahead of the UTC times above.

## Full transaction hashes

### Create LAW processor
`0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x1f09daefa827f02cbb40967cc91b259763760761`  
Status: success · Gas used: 760,544 · Effective gas price: 20000001 wei

### Mint transistors
`0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0xedde115d032be238cd7aa37aec183262c598a941`  
Status: success · Gas used: 157,599 · Effective gas price: 20000001 wei

### Tape SpendLimit
`0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x6f74553bae997e896ad76bac27401602a01790e8`  
Status: success · Gas used: 246,582 · Effective gas price: 20000001 wei

### Tape Quorum
`0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x6f74553bae997e896ad76bac27401602a01790e8`  
Status: success · Gas used: 240,633 · Effective gas price: 20000001 wei

### Tape Mood
`0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x6f74553bae997e896ad76bac27401602a01790e8`  
Status: success · Gas used: 240,633 · Effective gas price: 20000001 wei

### Tape Dead Man
`0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x6f74553bae997e896ad76bac27401602a01790e8`  
Status: success · Gas used: 223,740 · Effective gas price: 20000001 wei

### Tape RuleMux
`0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00`

[Open transaction on OKLink](https://www.oklink.com/x-layer/evm/tx/0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00)

From: `0xb9c37b75cf53ebfec9eaf16b35e77541ab941556`  
To: `0x6f74553bae997e896ad76bac27401602a01790e8`  
Status: success · Gas used: 252,730 · Effective gas price: 20000001 wei

## Reproducibility and boundaries

Raw transaction objects and receipts, including logs and reported L1 fee fields, are saved in `verified-transactions.json`. The companion CSV contains the accounting fields. Queried via `eth_getTransactionByHash`, `eth_getTransactionReceipt`, `eth_getBlockByNumber`, `eth_chainId` and `eth_getBalance` against https://rpc.xlayer.tech. Receipt block hashes were checked against their block headers. No signing, private keys, blockchain writes or site changes were involved.

This evidence does not show a deployed reference vault or real Courtroom withdrawals. It does show real funds used for the existing processor/circuit build.
