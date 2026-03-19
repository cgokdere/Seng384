const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = new Error("Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function listPeople() {
  return request("/people", { method: "GET" });
}

export function createPerson(payload) {
  return request("/people", { method: "POST", body: JSON.stringify(payload) });
}

export function updatePerson(id, payload) {
  return request(`/people/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePerson(id) {
  return request(`/people/${id}`, { method: "DELETE" });
}

