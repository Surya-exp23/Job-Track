import { authedRequest } from "./authClient";

const listNotifications = (authFetch, { page, limit, unread } = {}) => {
  const search = new URLSearchParams();

  if (page) search.append("page", page);
  if (limit) search.append("limit", limit);
  if (unread) search.append("unread", "true");

  const qs = search.toString();
  return authedRequest(authFetch, `/notifications${qs ? `?${qs}` : ""}`);
};

const markAsRead = (authFetch, id) =>
  authedRequest(authFetch, `/notifications/${id}/read`, { method: "PATCH" });

const markAllAsRead = (authFetch) =>
  authedRequest(authFetch, "/notifications/read-all", { method: "PATCH" });

export const notificationsApi = {
  listNotifications,
  markAsRead,
  markAllAsRead,
};
