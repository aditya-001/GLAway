import api, { createAuthConfig } from "./api";

export const animationService = {
  getSettings: async () => {
    const { data } = await api.get("/animation-settings");
    return data;
  },
  updateSettings: async (payload) => {
    const { data } = await api.patch(
      "/animation-settings",
      payload,
      createAuthConfig("admin")
    );
    return data;
  }
};

