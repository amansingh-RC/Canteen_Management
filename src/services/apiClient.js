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

/**
 * Real HTTP request — used once the backend is connected.
 *
 * @param {string} path
 * @param {object} [opts]
 * @param {string} [opts.method]  HTTP method (default GET)
 * @param {object} [opts.body]    JSON body (auto-stringified)
 * @param {object} [opts.query]   query params (undefined/null/""/"All" skipped)
 * @param {object} [opts.headers]
 * @param {AbortSignal} [opts.signal]
 */
export async function apiRequest(
  path,
  { method = "GET", body, headers, signal, query } = {},
) {
  const url = `${BASE_URL}${path}${toQueryString(query)}`;
  const res = await fetch(url, {
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

/**
 * Build a "?a=1&b=2" string from an object. Skips empty values and the app's
 * "All" no-filter sentinel, so callers can pass filter state directly.
 */
function toQueryString(params) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "All") continue;
    search.append(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch {
      /* value isn't structured-cloneable — fall through and return it as-is */
    }
  }
  return value;
}
