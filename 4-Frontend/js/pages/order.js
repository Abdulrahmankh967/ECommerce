import { ordersApi, paymentsApi, shipmentsApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, formatDate, money, params } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const id = Number(params().get("id"));
const main = $("#main");

if (!id) {
  main.replaceChildren(errorState("A valid order id is required."));
} else {
  load();
}

async function load() {
  main.replaceChildren(loadingState("Loading order…"));
  try {
    const order = await ordersApi.get(id);
    let payment = null;
    let shipment = null;
    try { payment = await paymentsApi.byOrder(id); } catch { payment = null; }
    try { shipment = await shipmentsApi.byOrder(id); } catch { shipment = null; }
    document.title = `Order #${order.id} · Northline Market`;
    render(order, payment, shipment);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function render(order, payment, shipment) {
  main.replaceChildren(
    el("p", {}, el("a", { href: `${ROOT_PATH}/orders.html` }, "← Orders")),
    el("h1", {}, `Order #${order.id}`),
    el("div", { class: "checkout-layout" },
      el("section", { class: "card card-body" },
        el("h2", {}, "Items"),
        el("div", { class: "table-wrap" },
          el("table", {},
            el("thead", {}, el("tr", {}, el("th", {}, "Product"), el("th", {}, "Qty"), el("th", {}, "Unit"), el("th", {}, "Subtotal"))),
            el("tbody", {}, ...(order.items || []).map((item) =>
              el("tr", {},
                el("td", {}, el("a", { href: `${ROOT_PATH}/product.html?id=${item.productId}` }, item.productName)),
                el("td", {}, String(item.quantity)),
                el("td", {}, money(item.unitPrice)),
                el("td", {}, money(item.subtotal))
              )
            ))
          )
        ),
        el("p", { class: "price" }, `Total ${money(order.totalPrice)}`)
      ),
      el("aside", { class: "card card-body" },
        el("p", {}, `Placed ${formatDate(order.orderDate)}`),
        el("p", {}, `Payment method: ${order.paymentMethod || payment?.method || "—"}`),
        el("p", {}, `Coupon: ${order.couponCode || "None"}`),
        payment ? el("p", {}, `Paid ${money(payment.amount)} on ${formatDate(payment.paymentDate)}`) : null,
        el("h2", {}, "Shipment"),
        el("p", {}, `Status: ${shipment?.status || order.shipmentStatus || "—"}`),
        shipment?.trackingNumber ? el("p", {}, `Tracking: ${shipment.trackingNumber}`) : null,
        shipment?.carrier ? el("p", {}, `Carrier: ${shipment.carrier}`) : null,
        shipment?.estimatedDeliveryDate ? el("p", {}, `ETA: ${formatDate(shipment.estimatedDeliveryDate)}`) : null
      )
    )
  );
}
