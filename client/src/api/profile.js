import { authedRequest } from "./authClient";

const getMyProfile = (authFetch) => authedRequest(authFetch, "/profile/me");

const updateMyProfile = (authFetch, updates) =>
  authedRequest(authFetch, "/profile/me", { method: "PATCH", body: updates });

export const profileApi = { getMyProfile, updateMyProfile };
