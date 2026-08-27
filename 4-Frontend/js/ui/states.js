import { el } from "./dom.js";

export function loadingState(message = "Loading…") {
  return el("div", { class: "state", role: "status" },
    el("div", { class: "spinner", "aria-hidden": "true" }),
    el("p", {}, message)
  );
}

export function errorState(message, onRetry) {
  const wrap = el("div", { class: "state" },
    el("h2", {}, "Something went wrong"),
    el("p", {}, message || "Please try again.")
  );
  if (onRetry) {
    wrap.append(el("button", { class: "btn btn-primary", type: "button", onClick: onRetry }, "Try again"));
  }
  return wrap;
}

export function emptyState(title, message) {
  return el("div", { class: "state" },
    el("h2", {}, title),
    el("p", {}, message)
  );
}

export function skeletonGrid(count = 8) {
  return el("div", { class: "grid grid-4", "aria-hidden": "true" },
    ...Array.from({ length: count }, () => el("div", { class: "skeleton skeleton-card" }))
  );
}
