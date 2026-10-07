// Shared demo specification. Integer wei only; never use floating-point balances.
export const WEI = 10n ** 18n;
export const DAILY_LIMIT = WEI / 10n;
export type Bit = 0 | 1;
export type Mood = 'FOMO' | 'FEAR' | 'HOLD' | 'EXIT';
export type CircuitKey = 'spend' | 'quorum' | 'mood' | 'heartbeat' | 'hybrid';
export type Inputs = { ah: Bit; dh: Bit; signers: [Bit, Bit, Bit]; mood: Mood; alive: Bit };
export const INITIAL_INPUTS: Inputs = { ah: 0, dh: 0, signers: [1, 0, 1], mood: 'HOLD', alive: 1 };
export const CIRCUITS = [
  { key: 'spend' as const, id: 1, name: 'SpendLimit', gates: 2, bytes: 14, cases: 4, formula: 'deny = ah AND dh', description: 'Two flags. Deny only when both are high.' },
  { key: 'quorum' as const, id: 2, name: 'Quorum 2 of 3', gates: 12, bytes: 84, cases: 8, formula: 'pass = approvals ≥ 2', description: 'Approval inputs, not collected wallet signatures.' },
  { key: 'mood' as const, id: 3, name: 'Mood ASIC', gates: 12, bytes: 84, cases: 16, formula: 'deny = exit OR (nonFomo AND ah AND dh)', description: 'FOMO allows. FEAR and HOLD share the AND guard. EXIT denies.' },
  { key: 'heartbeat' as const, id: 4, name: 'Heartbeat', gates: 6, bytes: 42, cases: 8, formula: 'deny = NOT alive OR (ah AND dh)', description: 'The circuit reads a liveness bit. It does not measure time.' },
  { key: 'hybrid' as const, id: 5, name: 'RuleMux', gates: 18, bytes: 126, cases: 32, formula: 'deny = (ah AND dh) OR NOT quorum', description: 'Both the spend restriction and approval count matter.' },
];
export function packBits(bits: readonly Bit[]): `0x${string}` {
  return `0x${bits.reduce<number>((v, bit, i) => v | (bit << i), 0).toString(16).padStart(2, '0')}`;
}
export function circuitInput(key: CircuitKey, s: Inputs): Bit[] {
  if (key === 'spend') return [s.ah, s.dh];
  if (key === 'quorum') return [...s.signers];
  if (key === 'heartbeat') return [s.alive, s.ah, s.dh];
  if (key === 'hybrid') return [s.ah, s.dh, ...s.signers];
  const modes: Record<Mood, [Bit, Bit]> = { FOMO: [0, 0], FEAR: [0, 1], HOLD: [1, 0], EXIT: [1, 1] };
  return [s.ah, s.dh, ...modes[s.mood]];
}
export function evaluateCircuit(key: CircuitKey, s: Inputs): Bit {
  const guard = s.ah & s.dh;
  const quorum = s.signers.reduce<number>((a, b) => a + b, 0) >= 2;
  if (key === 'spend') return guard as Bit;
  if (key === 'quorum') return quorum ? 1 : 0; // 1 means PASS for this circuit only.
  if (key === 'heartbeat') return !s.alive || guard ? 1 : 0;
  if (key === 'hybrid') return guard || !quorum ? 1 : 0;
  return s.mood === 'EXIT' || (s.mood !== 'FOMO' && guard) ? 1 : 0;
}
export function verdictLabel(key: CircuitKey, output: Bit): string {
  return key === 'quorum' ? (output ? 'PASS' : 'FAIL') : (output ? 'DENY' : 'ALLOW');
}
export function parseOutput(output: string): Bit {
  if (output !== '0x00' && output !== '0x01') throw new Error('Invalid output: expected exactly one byte, 0x00 or 0x01.');
  return output === '0x01' ? 1 : 0;
}
export function utcDay(ms: number) { return Math.floor(ms / 86400000); }
export type VaultState = { balance: bigint; dailyOutflow: bigint; day: number };
export function initialVault(ms: number): VaultState { return { balance: WEI, dailyOutflow: 0n, day: utcDay(ms) }; }
export function currentVault(s: VaultState, ms: number): VaultState {
  return s.day === utcDay(ms) ? s : { ...s, dailyOutflow: 0n, day: utcDay(ms) };
}
export function depositDemo(s: VaultState, amount: bigint, ms: number): VaultState {
  if (amount <= 0n) throw new Error('Amount must be positive');
  return { ...currentVault(s, ms), balance: s.balance + amount };
}
export function withdrawDemo(state: VaultState, amount: bigint, ms: number) {
  const s = currentVault(state, ms);
  if (amount <= 0n) return { state: s, allowed: false, reason: 'Amount must be positive', packed: null };
  if (amount > s.balance) return { state: s, allowed: false, reason: 'Insufficient demo balance', packed: null };
  const over = amount > DAILY_LIMIT || s.dailyOutflow > DAILY_LIMIT - amount;
  // Same adapter as the reference VaultLaw contract: numeric predicate AND enabled.
  const packed = packBits([over ? 1 : 0, 1]);
  if (over) return { state: s, allowed: false, reason: 'Daily limit exceeded', packed };
  return { state: { ...s, balance: s.balance - amount, dailyOutflow: s.dailyOutflow + amount }, allowed: true, reason: 'Within daily limit', packed };
}
export function formatOKB(v: bigint) {
  const fractional = (v % WEI).toString().padStart(18, '0').replace(/0+$/, '').padEnd(2, '0');
  return `${v / WEI}.${fractional}`;
}

// Decimal text only. Never parse user balances through floating point.
export function parseScenarioAmount(text: string): bigint {
  const value = text.trim();
  if (value.length > 80 || !/^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(value)) throw new Error('Enter a positive decimal amount with up to 18 decimal places.');
  const [whole, fraction = ''] = value.split('.');
  const amount = BigInt(whole) * WEI + BigInt(fraction.padEnd(18, '0'));
  if (amount <= 0n) throw new Error('Amount must be greater than zero.');
  if (amount > (1n << 256n) - 1n) throw new Error('Amount exceeds the supported uint256 range.');
  return amount;
}
