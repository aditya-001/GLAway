const normalizeValue = (value) => value?.trim() || "";

export const getPaymentQrConfig = () => {
  const upiUri = normalizeValue(process.env.PAYMENT_QR_UPI);

  return {
    enabled: Boolean(upiUri),
    upiUri,
    label: normalizeValue(process.env.PAYMENT_QR_LABEL) || "Campus Canteen",
    provider: normalizeValue(process.env.PAYMENT_QR_PROVIDER) || "UPI",
    imagePath:
      normalizeValue(process.env.PAYMENT_QR_IMAGE_PATH) || "/uploads/payment-qr.jpeg"
  };
};
