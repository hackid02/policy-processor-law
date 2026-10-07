// Existing deployment identifiers from the repository manifest. No new deployment
// is performed by this patch. Run npm run verify:mainnet at the repository root.
export const PROCESSOR = '0x6F74553bAe997e896AD76BaC27401602A01790E8' as const;
export const FACTORY = '0x1f09DAeFA827f02CBb40967cc91b259763760761' as const;
export const TRANSISTORS = '0xeDDe115d032bE238cd7AA37AEc183262C598a941' as const;
export const DEPLOYER = '0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556' as const;
export const PROCESSOR_URL = `https://www.oklink.com/x-layer/evm/address/${PROCESSOR}`;
export const REPO = 'https://github.com/hackid02/policy-processor-law';
export const EVAL_ABI = [{ type: 'function', name: 'eval', stateMutability: 'view', inputs: [{ name: 'circuitId', type: 'uint256' }, { name: 'input', type: 'bytes' }], outputs: [{ type: 'bytes' }] }] as const;
