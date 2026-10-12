import { authedRequest } from "./authClient";

const createAnalysis = (authFetch, { resumeId, jobId }) =>
  authedRequest(authFetch, "/resume-analysis", {
    method: "POST",
    body: { resumeId, ...(jobId?.trim() ? { jobId: jobId.trim() } : {}) },
  });

const listAnalyses = (authFetch, { resumeId } = {}) => {
  const qs = resumeId ? `?resumeId=${resumeId}` : "";
  return authedRequest(authFetch, `/resume-analysis${qs}`);
};

const getAnalysis = (authFetch, id) => authedRequest(authFetch, `/resume-analysis/${id}`);

const deleteAnalysis = (authFetch, id) =>
  authedRequest(authFetch, `/resume-analysis/${id}`, { method: "DELETE" });

export const resumeAnalysisApi = { createAnalysis, listAnalyses, getAnalysis, deleteAnalysis };
