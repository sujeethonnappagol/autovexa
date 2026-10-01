export function normalizeUpiId(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidUpiId(value) {
  return /^[a-z0-9][a-z0-9._-]{1,254}@[a-z0-9][a-z0-9.-]{1,254}$/.test(value);
}