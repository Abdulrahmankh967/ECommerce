import { cartApi, couponsApi, ordersApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { el, $, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { toast } from "../ui/toast.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");


let activeCart = null;
let validatedCoupon = null;

async function load() {
  main.replaceChildren(loadingState("Preparing checkout…"));
  try {
    activeCart = await cartApi.get();
    render(activeCart);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}


function calculateTotal(subtotal, coupon) {
  if (!coupon || !coupon.isActive) return subtotal;

  let discount = 0;
  
  if (coupon.discountType === 1 || coupon.discountType === "Percentage") {
    discount = subtotal * (coupon.discountValue / 100);
  } else if (coupon.discountType === 2 || coupon.discountType === "FixedAmount") {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, subtotal);
  return Math.max(0, subtotal - discount);
}

function render(cart) {
  const items = cart.items || [];
  if (!items.length) {
    main.replaceChildren(
      emptyState("Cart is empty", "Add items before placing an order."),
      el("p", { style: "text-align:center" }, el("a", { class: "btn btn-primary", href: `${ROOT_PATH}/products.html` }, "Continue shopping"))
    );
    return;
  }

  const subtotalPrice = cart.totalPrice || 0;

  main.replaceChildren(
    el("h1", {}, "Checkout"),
    el("div", { class: "checkout-layout" },
      el("section", { class: "card card-body" },
        el("h2", {}, "Order summary"),
        el("ul", {}, ...items.map((item) =>
          el("li", {}, `${item.productName} × ${item.quantity} — ${money(item.subtotal)}`)
        )),
        // إضافة عنصر مخصص لإظهار الخصم وعنصر للمجموع النهائي
        el("p", { class: "price", id: "checkout-total" }, `Total: ${money(subtotalPrice)}`),
        el("p", { class: "muted" }, "Addresses are stored on your account and are not sent with PlaceOrder. The API accepts paymentMethod and an optional couponCode.")
      ),
      el("section", { class: "card card-body" },
        el("form", { class: "form-stack", id: "checkout-form" },
          el("label", {}, "Payment method",
            el("select", { name: "paymentMethod", required: true },
              el("option", { value: "Cash" }, "Cash"),
              el("option", { value: "CreditCard" }, "Credit card"),
              el("option", { value: "DebitCard" }, "Debit card")
            )
          ),
          el("label", {}, "Coupon code (optional)",
            el("input", { class: "input", name: "couponCode", maxlength: "50", autocomplete: "off" })
          ),
          el("button", { class: "btn btn-secondary", type: "button", id: "check-coupon" }, "Look up coupon"),
          el("p", { id: "coupon-status", class: "muted" }, ""),
          el("p", { class: "form-error", id: "form-error", role: "alert" }, ""),
          el("button", { class: "btn btn-primary", type: "submit" }, "Place order")
        )
      )
    )
  );

  // 1. زر فحص وتطبيق الكوبون
  $("#check-coupon").addEventListener("click", async () => {
    const code = document.querySelector("[name=couponCode]").value.trim();
    const status = $("#coupon-status");
    const totalEl = $("#checkout-total");

    if (!code) {
      status.textContent = "Enter a coupon code first.";
      validatedCoupon = null;
      totalEl.textContent = `Total: ${money(subtotalPrice)}`;
      return;
    }

    try {
      const coupon = await couponsApi.getByCode(code);

      if (!coupon.isActive) {
        status.textContent = `${coupon.code} is inactive.`;
        validatedCoupon = null;
        totalEl.textContent = `Total: ${money(subtotalPrice)}`;
        return;
      }

      // حفظ الكوبون وتحديث المجموع
      validatedCoupon = coupon;
      const finalTotal = calculateTotal(subtotalPrice, coupon);

      status.textContent = `Applied: ${coupon.code}`;
      totalEl.textContent = `Total: ${money(finalTotal)} (Discount Applied)`;
    } catch (error) {
      validatedCoupon = null;
      totalEl.textContent = `Total: ${money(subtotalPrice)}`;
      status.textContent = handleApiError(error, { redirectOnAuth: false });
    }
  });

  // 2. إرسال الطلب عند الضغط على Place order
  $("#checkout-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const inputCouponCode = String(data.get("couponCode") || "").trim();

    const dto = {
      paymentMethod: String(data.get("paymentMethod"))
    };

    // إرسال الكوبون المفحوص أو المدخل بالخانة
    if (inputCouponCode) {
      dto.couponCode = inputCouponCode;
    } else if (validatedCoupon) {
      dto.couponCode = validatedCoupon.code;
    }

    const button = event.target.querySelector("[type=submit]");
    button.disabled = true;
    try {
      const order = await ordersApi.place(dto);
      toast.success("Order placed");
      window.location.href = `${ROOT_PATH}/order.html?id=${order.id}`;
    } catch (error) {
      $("#form-error").textContent = handleApiError(error);
    } finally {
      button.disabled = false;
    }
  });
}

load();