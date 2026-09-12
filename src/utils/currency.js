// Single source of truth for displaying money. GreenLink only ever
// transacts in Kenyan Shillings — M-Pesa doesn't move any other currency,
// and the backend sends prices to Daraja as-is with no conversion — so
// every price in the UI must be labelled KSh, not $.
export function formatKes(value) {
  const amount = Number(value) || 0
  return `KSh ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}