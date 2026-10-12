import { authedRequest } from "./authClient";

const listSavedJobs = (authFetch, { page, limit } = {}) => {
  const search = new URLSearchParams();

  if (page) search.append("page", page);
  if (limit) search.append("limit", limit);

  const qs = search.toString();
  return authedRequest(authFetch, `/saved-jobs${qs ? `?${qs}` : ""}`);
};

const saveJob = (authFetch, jobId) =>
  authedRequest(authFetch, "/saved-jobs", { method: "POST", body: { jobId } });

const unsaveJob = (authFetch, jobId) =>
  authedRequest(authFetch, `/saved-jobs/${jobId}`, { method: "DELETE" });

export const savedJobsApi = { listSavedJobs, saveJob, unsaveJob };
