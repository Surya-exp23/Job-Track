

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, { method = "GET", body, token } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),

  verifyEmail: (payload) =>
    request("/auth/verify-email", { method: "POST", body: payload }),

  resendOtp: (email) =>
    request("/auth/resend-otp", { method: "POST", body: { email } }),

  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload }),

  refresh: () => request("/auth/refresh", { method: "POST" }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: (token) => request("/auth/me", { token }),
};

export { API_BASE };
