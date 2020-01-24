export function pad(num: number, decimals = 5): string {
  return ('0'.repeat(decimals) + num).slice(-decimals);
}
