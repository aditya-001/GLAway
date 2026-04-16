export const generatePickupToken = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GLA-${stamp}-${random}`;
};

