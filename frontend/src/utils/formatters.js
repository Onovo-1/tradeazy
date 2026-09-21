/**
 * Currency formatter — Nigerian Naira.
 * 1850000 → "₦1,850,000.00" (or without decimals if whole number)
 */
export function formatNaira(amount, { decimals = false } = {}) {
  if (amount === null || amount === undefined) return "";
  const num = Number(amount);
  if (Number.isNaN(num)) return "";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(num);
}

/**
 * Relative time formatting for product listings.
 * "2 hours ago", "3 days ago", "Jan 5"
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}