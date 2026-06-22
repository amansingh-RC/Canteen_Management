const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";

const MOCK_LATENCY = 350;

// ── Bearer token (set on login, sent with every authenticated request) ──────
const TOKEN_KEY = "canteen-auth-token";

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}

export function mockRequest(data, { latency = MOCK_LATENCY } = {}) {
  const resolve = typeof data === "function" ? data : () => data;
  return new Promise((res) => {
    setTimeout(() => res(structuredCloneSafe(resolve())), latency);
  });
}

/**
 *
 * @param {string} path
 * @param {object} [opts]
 * @param {string} [opts.method] 
 * @param {object} [opts.body]  
 * @param {object} [opts.query] 
 * @param {object} [opts.headers]
 * @param {AbortSignal} [opts.signal]
 */
export async function apiRequest(
  path,
  { method = "GET", body, headers, signal, query } = {},
) {
  const url = `${BASE_URL}${path}${toQueryString(query)}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let message = res.statusText;
    if (raw) {
      try {
        message = JSON.parse(raw).message || raw;
      } catch {
        message = raw;
      }
    }
    throw new ApiError(message || "Request failed", res.status);
  }
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
    }
  }
  return value;
}
