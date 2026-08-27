import { categoriesApi, productsApi } from "../api/services.js";
import { el, $, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ admin: true })) throw new Error("admin");
const main = $("#main");

async function load() {
  main.replaceChildren(adminNav("products.html"), loadingState("Loading products…"));
  try {
    const [products, categories] = await Promise.all([productsApi.list(), categoriesApi.list()]);
    render(products || [], categories || []);
  } catch (error) {
    main.replaceChildren(adminNav("products.html"), errorState(handleApiError(error), load));
  }
}

function productForm(categories, product = {}) {
  return el("form", { class: "form-stack", id: "product-form" },
    el("label", {}, "Name", el("input", { class: "input", name: "name", required: true, maxlength: "200", value: product.name || "" })),
    el("label", {}, "Price", el("input", { class: "input", name: "price", type: "number", min: "0.01", step: "0.01", required: true, value: product.price ?? "" })),
    el("label", {}, "Stock", el("input", { class: "input", name: "stock", type: "number", min: "0", value: product.stock ?? 0 })),
    el("label", {}, "Image URL", el("input", { class: "input", name: "imageUrl", maxlength: "500", value: product.imageUrl || "" })),
    el("label", {}, "Category",
      el("select", { name: "categoryId", required: true },
        ...categories.map((c) => el("option", { value: String(c.id), selected: c.id === product.categoryId }, c.name))
      )
    ),
    el("label", {},
      el("input", { type: "checkbox", name: "isActive", checked: product.isActive !== false }),
      " Active"
    ),
    el("input", { type: "hidden", name: "id", value: product.id ? String(product.id) : "" }),
    el("button", { class: "btn btn-primary", type: "submit" }, product.id ? "Update product" : "Create product")
  );
}

function dtoFrom(form) {
  const data = new FormData(form);
  const imageUrl = String(data.get("imageUrl") || "").trim();
  return {
    name: String(data.get("name")),
    price: Number(data.get("price")),
    stock: Number(data.get("stock") || 0),
    isActive: data.get("isActive") === "on",
    imageUrl: imageUrl || null,
    categoryId: Number(data.get("categoryId"))
  };
}

function render(products, categories) {
  main.replaceChildren(
    adminNav("products.html"),
    el("h1", {}, "Products"),
    el("section", { class: "card card-body" }, el("h2", {}, "Create / update"), productForm(categories)),
    el("div", { class: "table-wrap", style: "margin-top:1.5rem" },
      el("table", {},
        el("thead", {}, el("tr", {}, el("th", {}, "Name"), el("th", {}, "Price"), el("th", {}, "Stock"), el("th", {}, "Category"), el("th", {}, ""))),
        el("tbody", {}, ...products.map((p) =>
          el("tr", {},
            el("td", {}, p.name, p.isActive === false ? el("span", { class: "chip-neutral chip" }, " inactive") : null),
            el("td", {}, money(p.price)),
            el("td", {}, String(p.stock)),
            el("td", {}, p.categoryName),
            el("td", {},
              el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => {
                $("#product-form").replaceWith(productForm(categories, p));
                bindForm(categories);
              } }, "Edit"),
              " ",
              el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeProduct(p) }, "Delete")
            )
          )
        ))
      )
    )
  );
  bindForm(categories);
}

function bindForm(categories) {
  $("#product-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = event.target.querySelector("[name=id]").value;
    try {
      if (id) await productsApi.update(Number(id), dtoFrom(event.target));
      else await productsApi.create(dtoFrom(event.target));
      toast.success(id ? "Product updated" : "Product created");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function removeProduct(product) {
  if (!await confirmModal({ title: "Delete product", message: `Delete ${product.name}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await productsApi.remove(product.id);
    toast.success("Product deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
