import { authedRequest, parseAuthed } from "./authClient";

const listResumes = (authFetch) => authedRequest(authFetch, "/resumes");

const uploadResume = (authFetch, file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return authFetch("/resumes", { method: "POST", body: formData }).then(parseAuthed);
};

const setDefaultResume = (authFetch, id) =>
  authedRequest(authFetch, `/resumes/${id}/default`, { method: "PATCH" });

const deleteResume = (authFetch, id) =>
  authedRequest(authFetch, `/resumes/${id}`, { method: "DELETE" });

export const resumesApi = { listResumes, uploadResume, setDefaultResume, deleteResume };