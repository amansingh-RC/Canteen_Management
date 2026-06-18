const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";

const MOCK_LATENCY = 350;

export function mockRequest(data, { latency = MOCK_LATENCY } = {}) {
  const resolve = typeof data === "function" ? data : () => data;
  return new Promise((res) => {
    setTimeout(() => res(structuredCloneSafe(resolve())), latency);
  });
}

/** Real HTTP request — used once the backend is connected. */
export async function apiRequest(
  path,
  { method = "GET", body, headers, signal } = {},
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new ApiError(message || "Request failed", res.status);
  }
  // No-content responses (204) shouldn't try to parse JSON.
  if (res.status === 204) return null;
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {}
  }
  return value;
}
