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


// Recruiter: applications for one job
const listJobApplications = (authFetch, jobId, { status, page, limit } = {}) => {
  const search = new URLSearchParams();

  if (status) search.append("status", status);
  if (page) search.append("page", page);
  if (limit) search.append("limit", limit);

  const qs = search.toString();
  return authedRequest(authFetch, `/applications/job/${jobId}${qs ? `?${qs}` : ""}`);
};

// Recruiter: move an application through the pipeline
const updateApplicationStatus = (authFetch, id, { status, note }) =>
  authedRequest(authFetch, `/applications/${id}`, {
    method: "PATCH",
    body: { status, ...(note?.trim() ? { note: note.trim() } : {}) },
  });

export const applicationsApi = {
  applyJob,
  listMyApplications,
  withdrawApplication,
  listJobApplications,
  updateApplicationStatus,
};


