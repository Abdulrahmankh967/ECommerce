import { categoriesApi } from "../api/services.js";
import { el, $ } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ admin: true })) throw new Error("admin");
const main = $("#main");

async function load() {
  main.replaceChildren(adminNav("categories.html"), loadingState());
  try {
    render(await categoriesApi.list() || []);
  } catch (error) {
    main.replaceChildren(adminNav("categories.html"), errorState(handleApiError(error), load));
  }
}

function render(categories) {
  main.replaceChildren(
    adminNav("categories.html"),
    el("h1", {}, "Categories"),
    el("form", { class: "card card-body form-stack", id: "cat-form" },
      el("h2", {}, "Create category"),
      el("label", {}, "Name", el("input", { class: "input", name: "name", required: true, maxlength: "100" })),
      el("button", { class: "btn btn-primary", type: "submit" }, "Create")
    ),
    el("div", { class: "table-wrap", style: "margin-top:1.5rem" },
      el("table", {},
        el("thead", {}, el("tr", {}, el("th", {}, "Name"), el("th", {}, "Products"), el("th", {}, ""))),
        el("tbody", {}, ...categories.map((c) =>
          el("tr", {},
            el("td", {}, c.name),
            el("td", {}, String(c.productCount)),
            el("td", {},
              el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => rename(c) }, "Rename"),
              " ",
              el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeCat(c) }, "Delete")
            )
          )
        ))
      )
    )
  );
  $("#cat-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await categoriesApi.create({ name: new FormData(event.target).get("name") });
      toast.success("Category created");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function rename(category) {
  const name = window.prompt("New category name", category.name);
  if (!name) return;
  try {
    await categoriesApi.update(category.id, { name });
    toast.success("Category updated");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

async function removeCat(category) {
  if (!await confirmModal({ title: "Delete category", message: `Delete ${category.name}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await categoriesApi.remove(category.id);
    toast.success("Category deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
