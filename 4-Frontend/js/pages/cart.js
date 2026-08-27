import { cartApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage, refreshCartBadge } from "../ui/layout.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");

async function load() {
  main.replaceChildren(loadingState("Loading cart…"));
  try {
    const cart = await cartApi.get();
    render(cart);
    refreshCartBadge();
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function render(cart) {
  const items = cart.items || [];
  if (!items.length) {
    main.replaceChildren(
      el("h1", {}, "Cart"),
      emptyState("Your cart is empty", "Browse products and add something you like."),
      el("p", { style: "text-align:center" }, el("a", { class: "btn btn-primary", href: `${ROOT_PATH}/products.html` }, "Shop products"))
    );
    return;
  }

  main.replaceChildren(
    el("header", { class: "section-head" },
      el("h1", {}, "Cart"),
      el("button", { class: "btn btn-ghost", type: "button", onClick: clearCart }, "Clear cart")
    ),
    el("div", { class: "table-wrap" },
      el("table", {},
        el("thead", {}, el("tr", {},
          el("th", {}, "Product"), el("th", {}, "Price"), el("th", {}, "Qty"), el("th", {}, "Subtotal"), el("th", {}, "")
        )),
        el("tbody", {}, ...items.map((item) =>
          el("tr", {},
            el("td", {}, el("a", { href: `${ROOT_PATH}/product.html?id=${item.productId}` }, item.productName)),
            el("td", {}, money(item.unitPrice)),
            el("td", {},
              el("input", {
                class: "input",
                type: "number",
                min: "1",
                value: String(item.quantity),
                style: "width:5rem",
                "aria-label": `Quantity for ${item.productName}`,
                onChange: (event) => updateQty(item.id, Number(event.target.value))
              })
            ),
            el("td", {}, money(item.subtotal)),
            el("td", {}, el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeItem(item) }, "Remove"))
          )
        ))
      )
    ),
    el("p", { class: "price" }, `Total (${cart.totalItems} items): ${money(cart.totalPrice)}`),
    el("a", { class: "btn btn-primary", href: `${ROOT_PATH}/checkout.html` }, "Checkout")
  );
}

async function updateQty(cartItemId, quantity) {
  if (!quantity || quantity < 1) return;
  try {
    await cartApi.updateItem(cartItemId, { quantity });
    load();
  } catch (error) {
    handleApiError(error);
  }
}

async function removeItem(item) {
  try {
    await cartApi.removeItem(item.id);
    toast.success("Item removed");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

async function clearCart() {
  if (!await confirmModal({ title: "Clear cart", message: "Remove all items from your cart?", danger: true, confirmLabel: "Clear" })) return;
  try {
    await cartApi.clear();
    toast.success("Cart cleared");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
