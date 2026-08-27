import { shipmentsApi } from "../api/services.js";
import { el, $, formatDate } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";
import { toast } from "../ui/toast.js";
import { errorState } from "../ui/states.js";

if (!await bootPage({ admin: true })) throw new Error("admin");
const main = $("#main");

function toLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

main.replaceChildren(
  adminNav("shipments.html"),
  el("h1", {}, "Shipments"),
  el("p", { class: "muted" }, "There is no list-all endpoint. Look up a shipment by order id, then update its status."),
  el("form", { class: "card card-body form-stack", id: "lookup" },
    el("label", {}, "Order id", el("input", { class: "input", name: "orderId", type: "number", min: "1", required: true })),
    el("button", { class: "btn btn-primary", type: "submit" }, "Load shipment")
  ),
  el("section", { id: "result" })
);

$("#lookup").addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderId = Number(new FormData(event.target).get("orderId"));
  const result = $("#result");
  try {
    const shipment = await shipmentsApi.byOrder(orderId);
    result.replaceChildren(
      el("article", { class: "card card-body" },
        el("h2", {}, `Shipment #${shipment.id}`),
        el("p", {}, `Order ${shipment.orderId}`),
        el("p", {}, `Status: ${shipment.status}`),
        el("p", {}, `Tracking: ${shipment.trackingNumber || "—"}`),
        el("p", {}, `Carrier: ${shipment.carrier || "—"}`),
        el("p", {}, `Shipped: ${formatDate(shipment.shipmentDate)}`),
        el("p", {}, `ETA: ${formatDate(shipment.estimatedDeliveryDate)}`),
        el("form", { class: "form-stack", id: "update-form" },
          el("label", {}, "Status",
            el("select", { name: "status", required: true },
              ...["Pending", "Shipped", "InTransit", "Delivered", "Cancelled"].map((status) =>
                el("option", { value: status, selected: shipment.status === status }, status)
              )
            )
          ),
          el("label", {}, "Tracking number", el("input", { class: "input", name: "trackingNumber", maxlength: "100", value: shipment.trackingNumber || "" })),
          el("label", {}, "Carrier", el("input", { class: "input", name: "carrier", maxlength: "100", value: shipment.carrier || "" })),
          el("label", {}, "Shipment date", el("input", { class: "input", name: "shipmentDate", type: "datetime-local", value: toLocal(shipment.shipmentDate) })),
          el("label", {}, "Estimated delivery", el("input", { class: "input", name: "estimatedDeliveryDate", type: "datetime-local", value: toLocal(shipment.estimatedDeliveryDate) })),
          el("label", {}, "Actual delivery", el("input", { class: "input", name: "actualDeliveryDate", type: "datetime-local", value: toLocal(shipment.actualDeliveryDate) })),
          el("button", { class: "btn btn-primary", type: "submit" }, "Update shipment")
        )
      )
    );
    $("#update-form").addEventListener("submit", async (submitEvent) => {
      submitEvent.preventDefault();
      const data = new FormData(submitEvent.target);
      const optionalDate = (key) => {
        const value = String(data.get(key) || "").trim();
        return value ? new Date(value).toISOString() : null;
      };
      const dto = {
        status: String(data.get("status")),
        trackingNumber: String(data.get("trackingNumber") || "").trim() || null,
        carrier: String(data.get("carrier") || "").trim() || null,
        shipmentDate: optionalDate("shipmentDate"),
        estimatedDeliveryDate: optionalDate("estimatedDeliveryDate"),
        actualDeliveryDate: optionalDate("actualDeliveryDate")
      };
      try {
        await shipmentsApi.update(shipment.id, dto);
        toast.success("Shipment updated");
      } catch (error) {
        handleApiError(error);
      }
    });
  } catch (error) {
    result.replaceChildren(errorState(handleApiError(error)));
  }
});
