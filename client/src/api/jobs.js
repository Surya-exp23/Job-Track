import { request } from "./client";
import { authedRequest } from "./authClient";


const listJobs = (params = {}) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  }

  const qs = search.toString();
  return request(`/jobs${qs ? `?${qs}` : ""}`);
};

const getJob = (id) => request(`/jobs/${id}`);



const createJob = (authFetch, data) =>
  authedRequest(authFetch, "/jobs", { method: "POST", body: data });

const updateJob = (authFetch, id, data) =>
  authedRequest(authFetch, `/jobs/${id}`, { method: "PATCH", body: data });

const deleteJob = (authFetch, id) =>
  authedRequest(authFetch, `/jobs/${id}`, { method: "DELETE" });

// Recruiter's own jobs (any status, not just ACTIVE)
const listMyJobs = (authFetch, { page, limit } = {}) => {
  const search = new URLSearchParams();

  if (page) search.append("page", page);
  if (limit) search.append("limit", limit);

  const qs = search.toString();
  return authedRequest(authFetch, `/jobs/mine${qs ? `?${qs}` : ""}`);
};

const getMyJob = (authFetch, id) => authedRequest(authFetch, `/jobs/mine/${id}`);

export const jobsApi = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  listMyJobs,
  getMyJob,
};


