import { ordersApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, formatDate, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");

async function load() {
  main.replaceChildren(loadingState("Loading orders…"));
  try {
    const orders = await ordersApi.list();
    render(orders || []);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function render(orders) {
  main.replaceChildren(
    el("h1", {}, "Orders"),
    orders.length
      ? el("div", { class: "table-wrap" },
        el("table", {},
          el("thead", {}, el("tr", {},
            el("th", {}, "Order"), el("th", {}, "Date"), el("th", {}, "Total"), el("th", {}, "Shipment"), el("th", {}, "")
          )),
          el("tbody", {}, ...orders.map((order) =>
            el("tr", {},
              el("td", {}, `#${order.id}`),
              el("td", {}, formatDate(order.orderDate)),
              el("td", {}, money(order.totalPrice)),
              el("td", {}, order.shipmentStatus || "—"),
              el("td", {}, el("a", { href: `${ROOT_PATH}/order.html?id=${order.id}` }, "Details"))
            )
          ))
        )
      )
      : emptyState("No orders yet", "When you place an order, it will show up here.")
  );
}

load();
