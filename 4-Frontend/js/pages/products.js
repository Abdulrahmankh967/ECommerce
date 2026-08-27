import { categoriesApi, productsApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, params } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { pagination } from "../ui/pagination.js";
import { productCard } from "../ui/product-card.js";
import { addToCart, saveToWishlist } from "../ui/shop-actions.js";
import { emptyState, errorState, skeletonGrid } from "../ui/states.js";

await bootPage();

const PAGE_SIZE = 12;
const query = params();
const filters = $("#filters");
const results = $("#results");

filters.replaceChildren(
  el("label", {}, "Search",
    el("input", { class: "input", name: "q", type: "search", value: query.get("q") || "", placeholder: "Name or category" })
  ),
  el("label", {}, "Category",
    el("select", { name: "category", id: "category-filter" }, el("option", { value: "" }, "All categories"))
  ),
  el("label", {}, "Sort",
    el("select", { name: "sort" },
      el("option", { value: "name", selected: (query.get("sort") || "name") === "name" }, "Name"),
      el("option", { value: "price-asc", selected: query.get("sort") === "price-asc" }, "Price: low to high"),
      el("option", { value: "price-desc", selected: query.get("sort") === "price-desc" }, "Price: high to low")
    )
  )
);

const actions = { onAdd: addToCart, onWish: saveToWishlist, root: ROOT_PATH };

async function load() {
  results.replaceChildren(skeletonGrid());
  try {
    const [products, categories] = await Promise.all([productsApi.list(), categoriesApi.list()]);
    const select = $("#category-filter");
    if (select.options.length === 1) {
      for (const category of categories || []) {
        select.append(el("option", { value: String(category.id) }, category.name));
      }
      select.value = query.get("category") || "";
    }
    render(products || []);
  } catch (error) {
    results.replaceChildren(errorState(handleApiError(error, { redirectOnAuth: false }), load));
  }
}

function syncQuery() {
  const data = new FormData(filters);
  const url = new URL(window.location.href);
  for (const key of ["q", "category", "sort"]) {
    const value = String(data.get(key) || "").trim();
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState({}, "", url);
}

function applyFilters(products) {
  const data = new FormData(filters);
  const q = String(data.get("q") || "").trim().toLowerCase();
  const category = String(data.get("category") || "");
  const sort = String(data.get("sort") || "name");
  let list = products.filter((p) => {
    const matchesQuery = !q || p.name?.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q);
    const matchesCategory = !category || String(p.categoryId) === category;
    return matchesQuery && matchesCategory;
  });
  list.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return String(a.name).localeCompare(String(b.name));
  });
  return list;
}

let source = [];
let page = 1;

function render(products) {
  source = products;
  const filtered = applyFilters(source);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(page, totalPages);
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (!slice.length) {
    results.replaceChildren(emptyState("No matching products", "Try another search or category."));
    return;
  }
  results.replaceChildren(
    el("div", { class: "grid grid-4" }, ...slice.map((p) => productCard(p, actions))),
    pagination({ page, totalPages, onPage: (next) => { page = next; render(source); } })
  );
}

filters.addEventListener("submit", (event) => event.preventDefault());
filters.addEventListener("input", () => { page = 1; syncQuery(); render(source); });
filters.addEventListener("change", () => { page = 1; syncQuery(); render(source); });
load();
