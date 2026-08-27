import { categoriesApi, productsApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, params } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { productCard } from "../ui/product-card.js";
import { addToCart, saveToWishlist } from "../ui/shop-actions.js";
import { emptyState, errorState, skeletonGrid } from "../ui/states.js";

await bootPage();

const id = Number(params().get("id"));
const results = $("#results");
const title = $("#title");

if (!id) {
  results.replaceChildren(errorState("A valid category id is required."));
} else {
  load();
}

async function load() {
  results.replaceChildren(skeletonGrid());
  try {
    const [category, products] = await Promise.all([
      categoriesApi.get(id),
      productsApi.byCategory(id)
    ]);
    title.textContent = category.name;
    document.title = `${category.name} · Northline Market`;
    if (!products?.length) {
      results.replaceChildren(emptyState("No products in this category", "Try another category."));
      return;
    }
    results.replaceChildren(el("div", { class: "grid grid-4" },
      ...products.map((p) => productCard(p, { root: ROOT_PATH, onAdd: addToCart, onWish: saveToWishlist }))
    ));
  } catch (error) {
    results.replaceChildren(errorState(handleApiError(error, { redirectOnAuth: false }), load));
  }
}
