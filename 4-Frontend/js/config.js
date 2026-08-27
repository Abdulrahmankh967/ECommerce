function defaultApiBase() {
  const { protocol, hostname, port } = window.location;
  const sameHost = hostname === "localhost" || hostname === "127.0.0.1";
  const servedByApi = ["5037", "7258", "44367", "48053"].includes(port)
    || (sameHost && (port === "" || port === "80" || port === "443"));
  if (servedByApi) return "";
  return "http://localhost:5037";
}

const storedBase = window.localStorage.getItem("ecom.apiBaseUrl");

export const API_BASE_URL = (storedBase ?? defaultApiBase()).replace(/\/$/, "");

export const TOKEN_KEYS = {
  access: "ecom.accessToken",
  refresh: "ecom.refreshToken", 
  verificationId: "ecom.verificationId",
  pendingEmail: "ecom.pendingEmail"
};

export const ROOT_PATH = document.body?.dataset.root || ".";
