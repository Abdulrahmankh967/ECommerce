export const API_BASE_URL = "https://localhost:7258";
import { getAccessToken, getRefreshToken, saveTokens, clearSession } from "../auth/session.js";
import { isJwtExpired } from "../auth/jwt.js";

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const STATUS_MESSAGES = {
  400: "The request could not be processed.",
  401: "Please sign in to continue.",
  403: "You do not have permission to do that.",
  404: "The requested resource was not found.",
  409: "This record already exists.",
  429: "Too many requests. Please try again later.",
  500: "An unexpected error occurred."
};

let refreshPromise = null;

function messageFromBody(status, body) {
  if (!body) return STATUS_MESSAGES[status] || STATUS_MESSAGES[500];
  if (typeof body === "string") {
    const trimmed = body.trim();
    return trimmed || STATUS_MESSAGES[status] || STATUS_MESSAGES[500];
  }
  return (
    body.message ||
    body.title ||
    (body.errors && Object.values(body.errors).flat().join(" ")) ||
    STATUS_MESSAGES[status] ||
    STATUS_MESSAGES[500]
  );
}

async function parseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/Auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  const body = await parseBody(response);
  if (!response.ok) {
    if (response.status === 401) clearSession();
    return null;
  }

  saveTokens(body.accessToken, body.refreshToken);
  return body.accessToken;
}

function ensureRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function ensureSession() {
  if (!getRefreshToken()) return null;
  const accessToken = getAccessToken();
  if (accessToken && !isJwtExpired(accessToken)) return accessToken;
  return ensureRefresh();
}

export async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    retry = true,
    headers = {}
  } = options;

  const requestHeaders = { ...headers };
  let accessToken = auth ? getAccessToken() : null;

  if (auth && (!accessToken || isJwtExpired(accessToken))) {
    accessToken = await ensureRefresh();
    if (!accessToken) {
      clearSession();
      throw new ApiError(401, STATUS_MESSAGES[401]);
    }
  }

  if (auth && accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined || body instanceof FormData ? body : JSON.stringify(body)
  });

  // 2. معالجة الـ 401 والـ Retry بأمان
  if (response.status === 401 && auth && retry) {
    const currentToken = getAccessToken();
    const nextToken = await ensureRefresh();

    if (nextToken && nextToken !== currentToken) {
      return request(path, { ...options, retry: false });
    }

    // إذا فشل الـ Refresh أو كان التوكن هو نفسه، نقوم بإنهاء الجلسة فوراً
    const errorPayload = await parseBody(response);
    clearSession();
    throw new ApiError(401, messageFromBody(401, errorPayload), errorPayload);
  }

  // 3. معالجة بقية حالات الـ Response
  const payload = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, messageFromBody(response.status, payload), payload);
  }

  return payload;
}

export const http = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" })
};
