export function formatPrice(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatHours(value) {
  const hours = Number(value) || 0;
  return `${hours} hr${hours === 1 ? '' : 's'}`;
}

export function classificationLabel(value) {
  return String(value || '').replace(/_/g, ' ');
}
