import api, { createAuthConfig } from "./api";

export const foodService = {
  getItems: async (params = {}) => {
    const { data } = await api.get("/food", { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/food/${id}`);
    return data;
  },
  createItem: async (payload) => {
    const { data } = await api.post("/food", payload, createAuthConfig("admin"));
    return data;
  },
  updateItem: async (id, payload) => {
    const { data } = await api.patch(
      `/food/${id}`,
      payload,
      createAuthConfig("admin")
    );
    return data;
  },
  deleteItem: async (id) => {
    const { data } = await api.delete(`/food/${id}`, createAuthConfig("admin"));
    return data;
  }
};
