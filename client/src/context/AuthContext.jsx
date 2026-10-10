import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE, authApi } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // On app load, try to restore the session from the refresh cookie.
  // If it fails, the user is simply logged out — no error shown.
  useEffect(() => {
    const restore = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.accessToken);
        const me = await authApi.me(data.accessToken);
        setUser(me.data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restore();
  }, []);

  const applySession = (payload) => {
    setUser(payload.user);
    setAccessToken(payload.accessToken);
  };

  const register = async (form) => {
    // 201, no session yet — the user must verify their email first
    await authApi.register(form);
  };

  const verifyEmail = async (email, otp) => {
    const { data } = await authApi.verifyEmail({ email, otp });
    applySession(data);
  };

  const resendOtp = (email) => authApi.resendOtp(email);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    applySession(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the request fails, clear the local session
    }
    setUser(null);
    setAccessToken(null);
  };

  // Authenticated fetch for future API calls (jobs, applications, ...).
  // Attaches the token, and on a 401 tries one silent refresh before
  // giving up and logging the user out.
  const authFetch = useCallback(
    async (path, options = {}) => {
      const doFetch = (token) =>
        fetch(`${API_BASE}${path}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let res = await doFetch(accessToken);

      if (res.status === 401 && accessToken) {
        try {
          const { data } = await authApi.refresh();
          setAccessToken(data.accessToken);
          res = await doFetch(data.accessToken);
        } catch {
          setUser(null);
          setAccessToken(null);
        }
      }

      return res;
    },
    [accessToken]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        authLoading,
        register,
        verifyEmail,
        resendOtp,
        login,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
