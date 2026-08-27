import { cartApi, wishlistApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, formatDate, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage, refreshCartBadge } from "../ui/layout.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");

async function load() {
  main.replaceChildren(loadingState("Loading wishlist…"));
  try {
    const wishlist = await wishlistApi.get();
    render(wishlist);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function render(wishlist) {
  const items = wishlist.items || [];
  main.replaceChildren(
    el("header", { class: "section-head" },
      el("h1", {}, "Wishlist"),
      items.length ? el("button", { class: "btn btn-ghost", type: "button", onClick: clearAll }, "Clear wishlist") : null
    ),
    items.length
      ? el("div", { class: "grid grid-2" }, ...items.map((item) =>
        el("article", { class: "card card-body" },
          el("h2", { class: "card-title" },
            el("a", { href: `${ROOT_PATH}/product.html?id=${item.productId}` }, item.productName)
          ),
          el("p", { class: "price" }, money(item.unitPrice)),
          el("p", { class: "muted" }, `Saved ${formatDate(item.addedAt)}`),
          el("div", { class: "row-actions" },
            el("button", { class: "btn btn-primary btn-sm", type: "button", onClick: () => moveToCart(item) }, "Add to cart"),
            el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeItem(item) }, "Remove")
          )
        )
      ))
      : emptyState("Nothing saved yet", "Tap Save on a product to add it here.")
  );
}

async function moveToCart(item) {
  try {
    await cartApi.add({ productId: item.productId, quantity: 1 });
    toast.success("Added to cart");
    refreshCartBadge();
  } catch (error) {
    handleApiError(error);
  }
}

async function removeItem(item) {
  try {
    await wishlistApi.removeItem(item.id);
    toast.success("Removed from wishlist");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

async function clearAll() {
  if (!await confirmModal({ title: "Clear wishlist", message: "Remove every saved product?", danger: true, confirmLabel: "Clear" })) return;
  try {
    await wishlistApi.clear();
    toast.success("Wishlist cleared");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();
