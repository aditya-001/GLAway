import api from "./api";

export const feedbackService = {
  create: async (payload) => {
    const { data } = await api.post("/feedback", payload);
    return data;
  }
};
