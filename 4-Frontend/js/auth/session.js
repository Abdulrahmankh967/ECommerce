import { ROOT_PATH, TOKEN_KEYS } from "../config.js";
import { decodeJwt } from "./jwt.js";

const NAME_ID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role";

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEYS.access);
}

export function getRefreshToken() {
  return localStorage.getItem(TOKEN_KEYS.refresh);
}

export function saveTokens(accessToken, refreshToken) {
  if (accessToken) sessionStorage.setItem(TOKEN_KEYS.access, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

export function getUser() {
  const payload = decodeJwt(getAccessToken());
  if (!payload) return null;
  return {
    id: Number(payload[NAME_ID] || payload.sub || payload.nameid),
    email: payload[EMAIL] || payload.email || "",
    role: String(payload[ROLE] || payload.role || "").toLowerCase()
  };
}

export function isAuthenticated() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function isAdmin() {
  return getUser()?.role === "admin";
}

export function safeReturnPath(value, fallback = `${ROOT_PATH}/index.html`) {
  if (!value) return fallback;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    if (url.pathname.includes("\\") || url.pathname.includes("//")) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function requireAuth(root = ".") {
  if (isAuthenticated()) return true;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `${root}/login.html?next=${next}`;
  return false;
}

export function requireAdmin(root = ".") {
  if (!requireAuth(root)) return false;
  if (isAdmin()) return true;
  window.location.href = `${root}/index.html`;
  return false;
}

export function saveVerification(verificationId, email) {
  sessionStorage.setItem(TOKEN_KEYS.verificationId, verificationId);
  if (email) sessionStorage.setItem(TOKEN_KEYS.pendingEmail, email);
}

export function getVerification() {
  return {
    verificationId: sessionStorage.getItem(TOKEN_KEYS.verificationId) || "",
    email: sessionStorage.getItem(TOKEN_KEYS.pendingEmail) || ""
  };
}

export function clearVerification() {
  sessionStorage.removeItem(TOKEN_KEYS.verificationId);
  sessionStorage.removeItem(TOKEN_KEYS.pendingEmail);
}
