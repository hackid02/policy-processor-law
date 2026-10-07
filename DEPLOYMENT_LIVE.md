# Existing X Layer deployment

**Read-only verification:** `VERIFIED_AT_RECORDED_BLOCK` at block **72566407** (`0x017e144f00758410aa7ec29700ef5f60aefddb494a35968841df1f39de23f6fe`), checked `2026-10-07T01:10:43.396Z`. This is a point-in-time result, not an audit or continuous monitoring.

## Addresses

- **Factory:** `0x1f09DAeFA827f02CBb40967cc91b259763760761`
- **Processor:** `0x6F74553bAe997e896AD76BaC27401602A01790E8`
- **Transistors:** `0xeDDe115d032bE238cd7AA37AEc183262C598a941`
- **Deployer:** `0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556`

## Issuance

- Supply cap: **2,300,000**.
- Unit mint price: **0.000066 OKB** plus additional fees.
- Total minted at the recorded block: **50**.
- Parameters were checked both by contract reads and creation calldata. See ECONOMICS.md for the rationale and limitations.

## Verified listed receipts

| Action | Transaction | Block |
|---|---|---:|
| create | [0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887](https://www.oklink.com/x-layer/evm/tx/0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887) | 71932071 |
| mint | [0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6](https://www.oklink.com/x-layer/evm/tx/0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6) | 71932752 |
| tape1 | [0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23](https://www.oklink.com/x-layer/evm/tx/0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23) | 71932763 |
| tape2 | [0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182](https://www.oklink.com/x-layer/evm/tx/0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182) | 71932766 |
| tape3 | [0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e](https://www.oklink.com/x-layer/evm/tx/0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e) | 71932770 |
| tape4 | [0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e](https://www.oklink.com/x-layer/evm/tx/0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e) | 71932774 |
| tape5 | [0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00](https://www.oklink.com/x-layer/evm/tx/0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00) | 71932777 |

All listed receipts were checked for successful execution, the declared sender/target, and the published hackathon date window. The factory recognises the declared processor. Five netlists and all 68 input cases matched at the recorded block.

## Not deployed by this patch

No new VaultLaw or PolicyRegistry deployment is claimed. The Courtroom is a browser simulation. These manufacturing receipts are not deposit or withdrawal receipts.

## Reproduce

```sh
npm ci
npm run verify:mainnet
```

Full machine-readable results: `reports/mainnet-verification.json`. The script exits nonzero on any failure. Historical static wallet balances and "done spending" claims are intentionally omitted.
