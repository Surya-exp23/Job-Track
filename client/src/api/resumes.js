import { authedRequest } from "./authClient";

const listResumes = (authFetch) => authedRequest(authFetch, "/resumes");

export const resumesApi = { listResumes };
