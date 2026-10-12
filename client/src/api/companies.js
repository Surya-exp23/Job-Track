import { request } from "./client";
import { authedRequest } from "./authClient";

const listCompanies = (params = {}) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  }

  const qs = search.toString();
  return request(`/companies${qs ? `?${qs}` : ""}`);
};

const getCompany = (id) => request(`/companies/${id}`);

const createCompany = (authFetch, data) =>
  authedRequest(authFetch, "/companies", { method: "POST", body: data });

const updateCompany = (authFetch, id, data) =>
  authedRequest(authFetch, `/companies/${id}`, { method: "PATCH", body: data });

const deleteCompany = (authFetch, id) =>
  authedRequest(authFetch, `/companies/${id}`, { method: "DELETE" });

export const companiesApi = {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
