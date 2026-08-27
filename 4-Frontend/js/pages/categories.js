import { categoriesApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $ } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { emptyState, errorState, skeletonGrid } from "../ui/states.js";

await bootPage();
const results = $("#results");

async function load() {
  results.replaceChildren(skeletonGrid(6));
  try {
    const categories = await categoriesApi.list();
    if (!categories?.length) {
      results.replaceChildren(emptyState("No categories", "Categories will appear here once they are created."));
      return;
    }
    results.replaceChildren(el("div", { class: "grid grid-3" },
      ...categories.map((category) =>
        el("a", {
          class: "card",
          href: `${ROOT_PATH}/category.html?id=${category.id}`,
          style: "text-decoration:none"
        }, el("div", { class: "card-body" },
          el("h2", { class: "card-title" }, category.name),
          el("p", { class: "muted" }, `${category.productCount} products`)
        ))
      )
    ));
  } catch (error) {
    results.replaceChildren(errorState(handleApiError(error, { redirectOnAuth: false }), load));
  }
}

load();
