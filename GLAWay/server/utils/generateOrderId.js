export const generateOrderId = () => {
  const dateStamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GLA-${dateStamp}-${random}`;
};

