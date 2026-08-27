import { el, money, productImage } from "./dom.js";

export function productCard(product, { root = ".", onAdd, onWish } = {}) {
  const href = `${root}/product.html?id=${product.id}`;
  const out = product.stock <= 0 || product.isActive === false;
  return el("article", { class: "card" },
    el("a", { href, class: "card-media" },
      el("img", {
        src: productImage(product),
        alt: product.name || "Product image",
        loading: "lazy",
        decoding: "async",
        width: "400",
        height: "480"
      })
    ),
    el("div", { class: "card-body" },
      product.categoryName ? el("span", { class: "chip" }, product.categoryName) : null,
      el("h3", { class: "card-title" },
        el("a", { href, style: "text-decoration:none" }, product.name)
      ),
      el("p", { class: "price" }, money(product.price)),
      el("p", { class: "muted" }, out ? "Currently unavailable" : `${product.stock} in stock`),
      el("div", { class: "row-actions" },
        el("button", {
          class: "btn btn-primary btn-sm",
          type: "button",
          disabled: out,
          onClick: () => onAdd?.(product)
        }, "Add to cart"),
        el("button", {
          class: "btn btn-ghost btn-sm",
          type: "button",
          "aria-label": `Save ${product.name} to wishlist`,
          onClick: () => onWish?.(product)
        }, "Save")
      )
    )
  );
}
