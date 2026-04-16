import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const USER_TOKEN_KEY = "glaway_user_token";
export const ADMIN_TOKEN_KEY = "glaway_admin_token";

export const createAuthConfig = (sessionType = "user", config = {}) => {
  const tokenKey = sessionType === "admin" ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
  const token = localStorage.getItem(tokenKey);

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
};

export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
