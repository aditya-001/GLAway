import { createContext, useContext, useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import { authService } from "../services/authService";
import { ADMIN_TOKEN_KEY, USER_TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!localStorage.getItem(USER_TOKEN_KEY)) {
        setUserLoading(false);
        return;
      }

      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (error) {
        localStorage.removeItem(USER_TOKEN_KEY);
        localStorage.removeItem("glaway_token");
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const bootstrapAdmin = async () => {
      if (!localStorage.getItem(ADMIN_TOKEN_KEY)) {
        setAdminLoading(false);
        return;
      }

      try {
        const data = await adminService.getProfile();
        setAdmin(data);
      } catch (error) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdmin(null);
      } finally {
        setAdminLoading(false);
      }
    };

    bootstrapAdmin();
  }, []);

  const saveUserSession = (payload) => {
    localStorage.setItem(USER_TOKEN_KEY, payload.token);
    localStorage.removeItem("glaway_token");
    setUser(payload.user);
    setUserLoading(false);
  };

  const saveAdminSession = (payload) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, payload.token);
    setAdmin(payload.admin);
    setAdminLoading(false);
  };

  const logoutUser = () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem("glaway_token");
    setUser(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        userLoading,
        adminLoading,
        saveUserSession,
        saveAdminSession,
        logoutUser,
        logoutAdmin,
        isUserAuthenticated: Boolean(user),
        isAdminAuthenticated: Boolean(admin)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
