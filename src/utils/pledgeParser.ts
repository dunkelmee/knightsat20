/**
 * Parses pledge selection and manual input strings into accurate numerical PHP values.
 */
export function parsePledgeAmount(
  pledgeOption: string,
  customPledgeAmount?: string
): number {
  if (pledgeOption === 'I’m not able to contribute financially at this time' || pledgeOption === 'None') {
    return 0;
  }

  // Check predefined tiers
  if (pledgeOption === '₱2,000') return 2000;
  if (pledgeOption === '₱3,000') return 3000;
  if (pledgeOption === '₱5,000') return 5000;
  if (pledgeOption === '₱10,000+') {
    // If user selected 10,000+ and typed extra in custom, check custom
    if (customPledgeAmount && customPledgeAmount.trim()) {
      const parsed = parseRawAmountString(customPledgeAmount);
      if (parsed >= 10000) return parsed;
    }
    return 10000;
  }

  if (pledgeOption === 'Other' || pledgeOption === 'Custom Amount') {
    return parseRawAmountString(customPledgeAmount || '');
  }

  // Fallback: Attempt parsing any raw string passed in
  return parseRawAmountString(customPledgeAmount || pledgeOption);
}

/**
 * Extracts numbers from messy text (e.g. "Other: ₱7,500", "5k", "15,000 PHP", "P 8000", "2.5k")
 */
export function parseRawAmountString(text: string): number {
  if (!text || !text.trim()) return 0;
  
  const cleaned = text.toLowerCase().trim();

  // Handle shorthand like 5k, 7.5k, 10k
  const kMatch = cleaned.match(/([\d,.]+)\s*k\b/i);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(/,/g, ''));
    if (!isNaN(val)) {
      return Math.round(val * 1000);
    }
  }

  // Remove currency symbols (₱, P, Php, PHP), commas, and extra words
  const numbersOnly = cleaned
    .replace(/[₱p]\s*h?\s*p?/gi, '')
    .replace(/,/g, '')
    .replace(/[^0-9.]/g, ' ')
    .trim();

  const parts = numbersOnly.split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    const parsed = parseFloat(parts[0]);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
