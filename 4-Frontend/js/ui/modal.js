import { el } from "./dom.js";

export function confirmModal({ title, message, confirmLabel = "Confirm", danger = false }) {
  return new Promise((resolve) => {
    const dialog = el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title" },
      el("h2", { id: "modal-title" }, title),
      el("p", {}, message),
      el("div", { class: "row-actions" },
        el("button", { class: "btn btn-secondary", type: "button", id: "modal-cancel" }, "Cancel"),
        el("button", { class: danger ? "btn btn-danger" : "btn btn-primary", type: "button", id: "modal-ok" }, confirmLabel)
      )
    );
    const backdrop = el("div", { class: "modal-backdrop" }, dialog);
    const finish = (value) => {
      backdrop.remove();
      document.removeEventListener("keydown", onKey);
      resolve(value);
    };
    const onKey = (event) => {
      if (event.key === "Escape") finish(false);
    };
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) finish(false);
    });
    dialog.querySelector("#modal-cancel").addEventListener("click", () => finish(false));
    dialog.querySelector("#modal-ok").addEventListener("click", () => finish(true));
    document.addEventListener("keydown", onKey);
    document.body.append(backdrop);
    dialog.querySelector("#modal-ok").focus();
  });
}
