import { $ , el } from "../ui/dom.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";

if (!await bootPage({ admin: true })) throw new Error("admin");

$("#main").replaceChildren(
  adminNav("index.html"),
  el("h1", {}, "Administration"),
  el("p", { class: "lede" }, "Manage catalog data, customers, coupons, suppliers, and shipments. These screens call the existing admin-only endpoints."),
  el("div", { class: "grid grid-3" },
    ...[
      ["products.html", "Products", "Create, update, and delete catalog items."],
      ["categories.html", "Categories", "Organize the product catalog."],
      ["customers.html", "Customers", "Paged customer list, create accounts, delete users."],
      ["coupons.html", "Coupons", "Percentage and fixed-amount discounts."],
      ["suppliers.html", "Suppliers", "Supplier records used by the catalog."],
      ["shipments.html", "Shipments", "Look up a shipment by order id and update status."]
    ].map(([href, title, copy]) =>
      el("a", { class: "card", href, style: "text-decoration:none" },
        el("div", { class: "card-body" },
          el("h2", { class: "card-title" }, title),
          el("p", { class: "muted" }, copy)
        )
      )
    )
  )
);
