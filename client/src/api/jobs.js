import { request } from "./client";

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

export const jobsApi = { listJobs, getJob };
