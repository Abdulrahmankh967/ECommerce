import { categoriesApi, productsApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $ } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { productCard } from "../ui/product-card.js";
import { addToCart, saveToWishlist } from "../ui/shop-actions.js";
import { emptyState, errorState, skeletonGrid } from "../ui/states.js";

await bootPage();

const actions = {
  onAdd: addToCart,
  onWish: saveToWishlist,
  root: ROOT_PATH
};

async function loadCategories() {
  const host = $("#categories-preview");
  host.replaceChildren(el("div", { class: "section-head" }, el("h2", {}, "Shop by category")));
  try {
    const categories = await categoriesApi.list();
    if (!categories?.length) {
      host.append(emptyState("No categories yet", "Check back once the catalog is published."));
      return;
    }
    host.append(el("div", { class: "grid grid-3" },
      ...categories.slice(0, 6).map((category) =>
        el("a", {
          class: "card",
          href: `${ROOT_PATH}/category.html?id=${category.id}`,
          style: "text-decoration:none"
        }, el("div", { class: "card-body" },
          el("h3", { class: "card-title" }, category.name),
          el("p", { class: "muted" }, `${category.productCount} products`)
        ))
      )
    ));
  } catch (error) {
    host.append(errorState(handleApiError(error, { redirectOnAuth: false })));
  }
}

async function loadFeatured() {
  const host = $("#featured");
  host.replaceChildren(el("div", { class: "section-head" }, el("h2", {}, "Featured products"), el("a", { href: `${ROOT_PATH}/products.html` }, "View all")));
  host.append(skeletonGrid(4));
  try {
    const products = await productsApi.list();
    const featured = (products || []).filter((p) => p.isActive !== false).slice(0, 8);
    host.querySelector(".grid")?.remove();
    if (!featured.length) {
      host.append(emptyState("No products yet", "The catalog is empty."));
      return;
    }
    host.append(el("div", { class: "grid grid-4" }, ...featured.map((p) => productCard(p, actions))));
  } catch (error) {
    host.querySelector(".grid")?.remove();
    host.append(errorState(handleApiError(error, { redirectOnAuth: false }), loadFeatured));
  }
}

loadCategories();
loadFeatured();
