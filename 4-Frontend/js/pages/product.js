import { productsApi, reviewsApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, money, params, productImage } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { addToCart, saveToWishlist } from "../ui/shop-actions.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";
import { isAuthenticated, getUser } from "../auth/session.js";
import { toast } from "../ui/toast.js";
import { confirmModal } from "../ui/modal.js";

await bootPage();

const id = Number(params().get("id"));
const productHost = $("#product");
const reviewsHost = $("#reviews");

if (!id) {
  productHost.replaceChildren(errorState("A valid product id is required."));
} else {
  load();
}

async function load() {
  productHost.replaceChildren(loadingState("Loading product…"));
  reviewsHost.replaceChildren(loadingState("Loading reviews…"));
  try {
    const product = await productsApi.get(id);
    document.title = `${product.name} · Northline Market`;
    renderProduct(product);
  } catch (error) {
    productHost.replaceChildren(errorState(handleApiError(error, { redirectOnAuth: false }), load));
  }
  try {
    const reviews = await reviewsApi.byProduct(id);
    renderReviews(reviews || []);
  } catch (error) {
    reviewsHost.replaceChildren(errorState(handleApiError(error, { redirectOnAuth: false })));
  }
}

function renderProduct(product) {
  const unavailable = product.stock <= 0 || product.isActive === false;
  productHost.replaceChildren(
    el("div", { class: "product-detail" },
      el("div", { class: "card" },
        el("div", { class: "card-media" },
          el("img", { src: productImage(product), alt: product.name, loading: "lazy" })
        )
      ),
      el("div", { class: "product-info" },
        el("p", { class: "chip" }, product.categoryName || "Uncategorized"),
        el("h1", {}, product.name),
        el("p", { class: "price" }, money(product.price)),
        el("p", { class: "muted" }, unavailable ? "Currently unavailable" : `${product.stock} in stock`),
        el("div", { class: "qty-row" },
          el("label", { for: "qty" }, "Qty"),
          el("input", { class: "input", id: "qty", type: "number", min: "1", value: "1" })
        ),
        el("div", { class: "row-actions" },
          el("button", {
            class: "btn btn-primary",
            type: "button",
            disabled: unavailable,
            onClick: () => addToCart(product, Number($("#qty").value) || 1)
          }, "Add to cart"),
          el("button", { class: "btn btn-secondary", type: "button", onClick: () => saveToWishlist(product) }, "Save to wishlist")
        )
      )
    )
  );
}

function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function renderReviews(reviews) {
  const user = getUser();
  reviewsHost.replaceChildren(
    el("div", { class: "section-head" }, el("h2", {}, "Reviews")),
    reviews.length
      ? el("div", { class: "grid" }, ...reviews.map((review) =>
        el("article", { class: "card" }, el("div", { class: "card-body" },
          el("p", { class: "stars", "aria-label": `${review.rating} of 5` }, stars(review.rating)),
          el("p", {}, review.comment || "No comment"),
          el("p", { class: "muted" }, `${review.customerName} · ${new Date(review.createdAt).toLocaleDateString()}`),
          (user && (user.id === review.customerId || user.role === "admin"))
            ? el("button", {
              class: "btn btn-ghost btn-sm",
              type: "button",
              onClick: () => removeReview(review.id)
            }, "Delete review")
            : null
        ))
      ))
      : emptyState("No reviews yet", "Be the first to review this product."),
    isAuthenticated()
      ? el("form", { class: "card card-body form-stack", id: "review-form" },
        el("h3", {}, "Write a review"),
        el("label", {}, "Rating",
          el("select", { name: "rating", required: true },
            ...[5, 4, 3, 2, 1].map((n) => el("option", { value: String(n) }, `${n}`))
          )
        ),
        el("label", {}, "Comment",
          el("textarea", { name: "comment", maxlength: "1000", placeholder: "What did you think?" })
        ),
        el("button", { class: "btn btn-primary", type: "submit" }, "Submit review")
      )
      : el("p", {}, el("a", { href: `${ROOT_PATH}/login.html` }, "Sign in"), " to write a review.")
  );

  $("#review-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    try {
      await reviewsApi.add({
        productId: id,
        rating: Number(data.get("rating")),
        comment: String(data.get("comment") || "") || null
      });
      toast.success("Review added");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function removeReview(reviewId) {
  if (!await confirmModal({ title: "Delete review", message: "Remove this review?", danger: true, confirmLabel: "Delete" })) return;
  try {
    await reviewsApi.remove(reviewId);
    toast.success("Review deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}
