import api, { createAuthConfig } from "./api";

export const orderService = {
  placeOrder: async (payload) => {
    const { data } = await api.post("/order", payload, createAuthConfig("user"));
    return data;
  },
  getMyOrders: async () => {
    const { data } = await api.get("/order/my-orders", createAuthConfig("user"));
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/order/${id}`, createAuthConfig("user"));
    return data;
  },
  updateStatus: async (id, status) => {
    const { data } = await api.patch(
      `/order/${id}/status`,
      { status },
      createAuthConfig("admin")
    );
    return data;
  },
  getAdminOrders: async (params = {}) => {
    const { data } = await api.get(
      "/admin/orders",
      createAuthConfig("admin", { params })
    );
    return data;
  },
  getAdminOrderById: async (id) => {
    const { data } = await api.get(
      `/admin/orders/${id}`,
      createAuthConfig("admin")
    );
    return data;
  }
};
