import { el } from "./dom.js";

export function pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return el("div");
  const nav = el("nav", { class: "pagination", "aria-label": "Pagination" });
  const add = (label, target, current = false, disabled = false) => {
    nav.append(el("button", {
      class: "btn btn-secondary btn-sm",
      type: "button",
      disabled,
      "aria-current": current ? "page" : null,
      onClick: () => onPage(target)
    }, label));
  };
  add("Previous", page - 1, false, page <= 1);
  for (let i = 1; i <= totalPages; i += 1) {
    if (totalPages > 7 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
      if (i === 2 || i === totalPages - 1) add("…", page, false, true);
      continue;
    }
    add(String(i), i, i === page);
  }
  add("Next", page + 1, false, page >= totalPages);
  return nav;
}
