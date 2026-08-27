import { suppliersApi } from "../api/services.js";
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
  main.replaceChildren(adminNav("suppliers.html"), loadingState());
  try {
    render(await suppliersApi.list() || []);
  } catch (error) {
    main.replaceChildren(adminNav("suppliers.html"), errorState(handleApiError(error), load));
  }
}

function supplierForm(supplier = {}) {
  return el("form", { class: "form-stack", id: "supplier-form" },
    el("label", {}, "Name", el("input", { class: "input", name: "name", required: true, maxlength: "150", value: supplier.name || "" })),
    el("label", {}, "Email", el("input", { class: "input", name: "email", type: "email", maxlength: "150", value: supplier.email || "" })),
    el("label", {}, "Phone", el("input", { class: "input", name: "phone", maxlength: "50", value: supplier.phone || "" })),
    el("label", {}, "Address", el("input", { class: "input", name: "address", maxlength: "250", value: supplier.address || "" })),
    el("label", {}, el("input", { type: "checkbox", name: "isActive", checked: supplier.isActive !== false }), " Active"),
    el("input", { type: "hidden", name: "id", value: supplier.id ? String(supplier.id) : "" }),
    el("button", { class: "btn btn-primary", type: "submit" }, supplier.id ? "Update supplier" : "Create supplier")
  );
}

function dtoFrom(form) {
  const data = new FormData(form);
  const optional = (key) => String(data.get(key) || "").trim() || null;
  return {
    name: String(data.get("name")),
    email: optional("email"),
    phone: optional("phone"),
    address: optional("address"),
    isActive: data.get("isActive") === "on"
  };
}

function render(suppliers) {
  main.replaceChildren(
    adminNav("suppliers.html"),
    el("h1", {}, "Suppliers"),
    el("section", { class: "card card-body" }, supplierForm()),
    el("div", { class: "table-wrap", style: "margin-top:1.5rem" },
      el("table", {},
        el("thead", {}, el("tr", {}, el("th", {}, "Name"), el("th", {}, "Email"), el("th", {}, "Phone"), el("th", {}, "Active"), el("th", {}, ""))),
        el("tbody", {}, ...suppliers.map((s) =>
          el("tr", {},
            el("td", {}, s.name),
            el("td", {}, s.email || "—"),
            el("td", {}, s.phone || "—"),
            el("td", {}, s.isActive ? "Yes" : "No"),
            el("td", {},
              el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => {
                $("#supplier-form").replaceWith(supplierForm(s));
                bind();
              } }, "Edit"),
              " ",
              el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeSupplier(s) }, "Delete")
            )
          )
        ))
      )
    )
  );
  bind();
}

function bind() {
  $("#supplier-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = event.target.querySelector("[name=id]").value;
    try {
      if (id) await suppliersApi.update(Number(id), dtoFrom(event.target));
      else await suppliersApi.create(dtoFrom(event.target));
      toast.success(id ? "Supplier updated" : "Supplier created");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function removeSupplier(supplier) {
  if (!await confirmModal({ title: "Delete supplier", message: `Delete ${supplier.name}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await suppliersApi.remove(supplier.id);
    toast.success("Supplier deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
