export type Currency = 'BDT' | 'USD';

export const BDT_TO_USD_RATE = 0.0085; // ~ 1 USD = 118 BDT

export function formatPrice(amount: number, currency: Currency = 'BDT'): string {
  if (currency === 'USD') {
    const usd = amount * BDT_TO_USD_RATE;
    return `$${usd.toFixed(2)}`;
  }
  return `৳${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
