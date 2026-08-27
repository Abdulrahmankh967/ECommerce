import { el } from "./dom.js";

const region = () => document.getElementById("toast-region");

export function toast(message, type = "info") {
  const host = region();
  if (!host) return;
  const item = el("div", {
    class: `toast toast-${type}`,
    role: "status"
  }, message);
  host.append(item);
  setTimeout(() => item.remove(), 4200);
}

toast.success = (message) => toast(message, "success");
toast.error = (message) => toast(message, "error");
toast.info = (message) => toast(message, "info");
