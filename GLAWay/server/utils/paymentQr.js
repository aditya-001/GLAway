const normalizeValue = (value) => value?.trim() || "";
const DEFAULT_PAYMENT_QR_IMAGE_PATH = "/uploads/payment-qr.jpeg";

export const getPaymentQrConfig = () => {
  const upiUri = normalizeValue(process.env.PAYMENT_QR_UPI);
  const imagePath =
    normalizeValue(process.env.PAYMENT_QR_IMAGE_PATH) ||
    DEFAULT_PAYMENT_QR_IMAGE_PATH;

  return {
    enabled: Boolean(upiUri || imagePath),
    upiUri,
    label: normalizeValue(process.env.PAYMENT_QR_LABEL) || "ADITYA",
    provider: normalizeValue(process.env.PAYMENT_QR_PROVIDER) || "PhonePe",
    imagePath
  };
};
