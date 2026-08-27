import { ROOT_PATH } from "../config.js";
import { el } from "./dom.js";

export function adminNav(current) {
  const links = [
    ["index.html", "Overview"],
    ["products.html", "Products"],
    ["categories.html", "Categories"],
    ["customers.html", "Customers"],
    ["coupons.html", "Coupons"],
    ["suppliers.html", "Suppliers"],
    ["shipments.html", "Shipments"]
  ];
  return el("nav", { class: "admin-nav", "aria-label": "Admin" },
    ...links.map(([href, label]) =>
      el("a", {
        class: current === href ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm",
        href: `${ROOT_PATH}/admin/${href}`
      }, label)
    )
  );
}
