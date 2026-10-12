import { request } from "./client";

const parseAuthed = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

const authedRequest = (authFetch, path, { method = "GET", body } = {}) =>
  authFetch(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(parseAuthed);

export { authedRequest, parseAuthed };
