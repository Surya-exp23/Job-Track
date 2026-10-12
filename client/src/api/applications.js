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


const listMyApplications = (authFetch, { status, page, limit } = {}) => {
  const search = new URLSearchParams();

  if (status) search.append("status", status);
  if (page) search.append("page", page);
  if (limit) search.append("limit", limit);

  const qs = search.toString();
  return authedRequest(authFetch, `/applications/mine${qs ? `?${qs}` : ""}`);
};

const withdrawApplication = (authFetch, id) =>
  authedRequest(authFetch, `/applications/${id}`, { method: "DELETE" });

export const applicationsApi = { applyJob, listMyApplications, withdrawApplication };


