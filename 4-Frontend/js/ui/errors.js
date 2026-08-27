import { ApiError } from "../api/http.js";
import { clearSession } from "../auth/session.js";
import { ROOT_PATH } from "../config.js";
import { toast } from "./toast.js";

export function handleApiError(error, { redirectOnAuth = true } = {}) {
  const message = error instanceof ApiError
    ? error.message
    : "An unexpected error occurred.";
  toast.error(message);

  if (error?.status === 401 && redirectOnAuth) {
    clearSession();
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = `${ROOT_PATH}/login.html?next=${next}`;
    }
  }

  return message;
}

export function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}
