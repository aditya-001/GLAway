import api, { createAuthConfig } from "./api";

export const paymentService = {
  getQr: async () => {
    const { data } = await api.get("/payment/qr", createAuthConfig("user"));
    return data;
  },
  createOrder: async (amount) => {
    const { data } = await api.post(
      "/payment/create-order",
      { amount },
      createAuthConfig("user")
    );
    return data;
  },
  verify: async (payload) => {
    const { data } = await api.post(
      "/payment/verify",
      payload,
      createAuthConfig("user")
    );
    return data;
  }
};
