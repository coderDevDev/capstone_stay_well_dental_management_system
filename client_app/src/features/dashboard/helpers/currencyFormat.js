export const formatAmount = amount => {
  return Number.parseFloat(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'PHP'
  });
};
