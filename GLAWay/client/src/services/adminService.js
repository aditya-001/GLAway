import api, { createAuthConfig } from "./api";

export const adminService = {
  signup: async (payload) => {
    const { data } = await api.post("/admin/signup", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post("/admin/login", payload);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get("/admin/me", createAuthConfig("admin"));
    return data;
  }
};
