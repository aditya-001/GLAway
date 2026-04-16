import api, { createAuthConfig } from "./api";

export const authService = {
  signup: async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get("/auth/me", createAuthConfig("user"));
    return data;
  }
};
