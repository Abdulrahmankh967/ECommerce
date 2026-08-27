import { customersApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, formatDate, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";
import { pagination } from "../ui/pagination.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ admin: true })) throw new Error("admin");
const main = $("#main");
let pageNumber = 1;
const pageSize = 10;

async function load() {
  main.replaceChildren(adminNav("customers.html"), loadingState());
  try {
    const result = await customersApi.getByPage(pageNumber, pageSize);
    render(result);
  } catch (error) {
    main.replaceChildren(adminNav("customers.html"), errorState(handleApiError(error), load));
  }
}

function render(result) {
  const items = result.items || [];
  main.replaceChildren(
    adminNav("customers.html"),
    el("h1", {}, "Customers"),
    el("form", { class: "card card-body form-stack", id: "create-form" },
      el("h2", {}, "Add customer"),
      el("label", {}, "Full name", el("input", { class: "input", name: "fullName", required: true, minlength: "4" })),
      el("label", {}, "Email", el("input", { class: "input", name: "email", type: "email", required: true })),
      el("label", {}, "Phone", el("input", { class: "input", name: "phone", type: "tel", required: true })),
      el("label", {}, "Password", el("input", { class: "input", name: "password", type: "password", required: true, minlength: "5" })),
      el("label", {}, "Role",
        el("select", { name: "role" },
          el("option", { value: "customer" }, "customer"),
          el("option", { value: "admin" }, "admin")
        )
      ),
      el("button", { class: "btn btn-primary", type: "submit" }, "Create")
    ),
    el("div", { class: "table-wrap", style: "margin-top:1.5rem" },
      el("table", {},
        el("thead", {}, el("tr", {}, el("th", {}, "Id"), el("th", {}, "Name"), el("th", {}, "Orders"), el("th", {}, ""))),
        el("tbody", {}, ...items.map((c) =>
          el("tr", {},
            el("td", {}, String(c.id)),
            el("td", {}, c.fullName || c.email || "—"),
            el("td", {}, String(c.orders?.length || 0)),
            el("td", {},
              el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => showOrders(c.id) }, "Orders"),
              " ",
              el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeCustomer(c) }, "Delete")
            )
          )
        ))
      )
    ),
    pagination({
      page: result.pageNumber || pageNumber,
      totalPages: result.totalPages || 1,
      onPage: (next) => { pageNumber = next; load(); }
    }),
    el("section", { id: "orders-panel" })
  );

  $("#create-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await customersApi.create(Object.fromEntries(new FormData(event.target).entries()));
      toast.success("Customer created");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function showOrders(customerId) {
  const panel = $("#orders-panel");
  panel.replaceChildren(loadingState("Loading customer orders…"));
  try {
    const customer = await customersApi.getWithOrders(customerId);
    panel.replaceChildren(
      el("h2", {}, `Orders for ${customer.fullName}`),
      el("div", { class: "table-wrap" },
        el("table", {},
          el("thead", {}, el("tr", {}, el("th", {}, "Order"), el("th", {}, "Date"), el("th", {}, "Total"), el("th", {}, "Items"))),
          el("tbody", {}, ...(customer.orders || []).map((order) =>
            el("tr", {},
              el("td", {}, el("a", { href: `${ROOT_PATH}/order.html?id=${order.id}` }, `#${order.id}`)),
              el("td", {}, formatDate(order.orderDate)),
              el("td", {}, money(order.totalPrice)),
              el("td", {}, String(order.orderItems?.length || 0))
            )
          ))
        )
      )
    );
  } catch (error) {
    panel.replaceChildren(errorState(handleApiError(error)));
  }
}

async function removeCustomer(customer) {
  if (!await confirmModal({ title: "Delete customer", message: `Delete customer #${customer.id}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await customersApi.remove(customer.id);
    toast.success("Customer deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
