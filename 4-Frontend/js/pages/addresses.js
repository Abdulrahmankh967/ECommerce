import { addressesApi } from "../api/services.js";
import { el, $ } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");

async function load() {
  main.replaceChildren(loadingState("Loading addresses…"));
  try {
    const addresses = await addressesApi.list();
    render(addresses || []);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function addressFields(address = {}) {
  return [
    ["title", "Title", address.title, true],
    ["recipientName", "Recipient name", address.recipientName, true],
    ["phone", "Phone", address.phone, true],
    ["city", "City", address.city, true],
    ["street", "Street", address.street, true],
    ["buildingNumber", "Building number", address.buildingNumber, false],
    ["postalCode", "Postal code", address.postalCode, false]
  ].map(([name, label, value, required]) =>
    el("label", {}, label,
      el("input", { class: "input", name, required, value: value || "" })
    )
  );
}

function render(addresses) {
  main.replaceChildren(
    el("header", { class: "section-head" }, el("h1", {}, "Addresses")),
    addresses.length
      ? el("div", { class: "grid grid-2" }, ...addresses.map((address) =>
        el("article", { class: "card card-body" },
          el("h2", {}, address.title),
          address.isDefault ? el("span", { class: "chip" }, "Default") : null,
          el("p", {}, address.recipientName),
          el("p", {}, address.phone),
          el("p", { class: "muted" }, `${address.street}${address.buildingNumber ? `, ${address.buildingNumber}` : ""}, ${address.city} ${address.postalCode || ""}`),
          el("div", { class: "row-actions" },
            el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => editAddress(address) }, "Edit"),
            el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeAddress(address) }, "Delete")
          )
        )
      ))
      : emptyState("No addresses yet", "Add a delivery address below."),
    el("section", { class: "card card-body form-stack", style: "margin-top:1.5rem" },
      el("h2", {}, "Add address"),
      el("form", { class: "form-stack", id: "address-form" },
        ...addressFields(),
        el("label", {},
          el("input", { type: "checkbox", name: "isDefault" }),
          " Set as default"
        ),
        el("button", { class: "btn btn-primary", type: "submit" }, "Save address")
      )
    )
  );

  $("#address-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const dto = Object.fromEntries([...data.entries()].filter(([key]) => key !== "isDefault"));
    dto.isDefault = data.get("isDefault") === "on";
    try {
      await addressesApi.create(dto);
      toast.success("Address saved");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function editAddress(address) {
  const form = el("form", { class: "form-stack", id: "edit-form" },
    ...addressFields(address),
    el("label", {},
      el("input", { type: "checkbox", name: "isDefault", checked: address.isDefault }),
      " Set as default"
    ),
    el("button", { class: "btn btn-primary", type: "submit" }, "Update")
  );
  const host = $("#main");
  host.prepend(el("section", { class: "card card-body", id: "edit-panel" }, el("h2", {}, "Edit address"), form));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const dto = Object.fromEntries([...data.entries()].filter(([key]) => key !== "isDefault"));
    dto.isDefault = data.get("isDefault") === "on";
    try {
      await addressesApi.update(address.id, dto);
      toast.success("Address updated");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function removeAddress(address) {
  if (!await confirmModal({ title: "Delete address", message: `Remove ${address.title}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await addressesApi.remove(address.id);
    toast.success("Address deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
