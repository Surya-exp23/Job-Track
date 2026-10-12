import { authedRequest } from "./authClient";

const applyJob = (authFetch, { jobId, resumeId, notes }) =>
  authedRequest(authFetch, "/applications", {
    method: "POST",
    body: {
      jobId,
      resumeId,
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    },
  });

export const applicationsApi = { applyJob };
