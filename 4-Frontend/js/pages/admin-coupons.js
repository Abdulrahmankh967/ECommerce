import { couponsApi } from "../api/services.js";
import { el, $, formatDate } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { adminNav } from "../ui/admin-nav.js";
import { confirmModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ admin: true })) throw new Error("admin");
const main = $("#main");

async function load() {
  main.replaceChildren(adminNav("coupons.html"), loadingState());
  try {
    render(await couponsApi.list() || []);
  } catch (error) {
    main.replaceChildren(adminNav("coupons.html"), errorState(handleApiError(error), load));
  }
}

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// دالة مساعدة لتحويل الرقم إلى اسم النوع للعرض بالجدول
function getDiscountTypeName(type) {
  if (type === 1 || type === "Percentage") return "Percentage";
  if (type === 2 || type === "FixedAmount") return "Fixed Amount";
  return type || "Unknown";
}

function couponForm(coupon = {}) {
  // مطابقة النوع سواء إجا من الباك إند كـ رقم أو كـ نص
  const currentType = coupon.discountType === 1 || coupon.discountType === "Percentage" ? 1 : 2;

  return el("form", { class: "form-stack", id: "coupon-form" },
    el("label", {}, "Code", el("input", { class: "input", name: "code", required: true, maxlength: "50", value: coupon.code || "" })),
    el("label", {}, "Discount type",
      el("select", { name: "discountType" },
        // ⚡ القيم أصبحت 1 و 2 لتطابق الـ DB والـ C# Enum
        el("option", { value: "1", selected: currentType === 1 }, "Percentage"),
        el("option", { value: "2", selected: currentType === 2 }, "Fixed Amount")
      )
    ),
    el("label", {}, "Discount value", el("input", { class: "input", name: "discountValue", type: "number", min: "0.01", step: "0.01", required: true, value: coupon.discountValue ?? "" })),
    el("label", {}, "Start date", el("input", { class: "input", name: "startDate", type: "datetime-local", required: true, value: toLocalInput(coupon.startDate) })),
    el("label", {}, "End date", el("input", { class: "input", name: "endDate", type: "datetime-local", required: true, value: toLocalInput(coupon.endDate) })),
    el("label", {}, "Usage limit", el("input", { class: "input", name: "usageLimit", type: "number", min: "1", value: coupon.usageLimit ?? "" })),
    el("label", {}, el("input", { type: "checkbox", name: "isActive", checked: coupon.isActive !== false }), " Active"),
    el("input", { type: "hidden", name: "id", value: coupon.id ? String(coupon.id) : "" }),
    el("button", { class: "btn btn-primary", type: "submit" }, coupon.id ? "Update coupon" : "Create coupon")
  );
}

function dtoFrom(form) {
  const data = new FormData(form);
  const usageLimit = String(data.get("usageLimit") || "").trim();
  return {
    code: String(data.get("code")),
    discountType: Number(data.get("discountType")), // ⚡ إرسال رقم (1 أو 2) للباك إند
    discountValue: Number(data.get("discountValue")),
    startDate: new Date(data.get("startDate")).toISOString(),
    endDate: new Date(data.get("endDate")).toISOString(),
    usageLimit: usageLimit ? Number(usageLimit) : null,
    isActive: data.get("isActive") === "on"
  };
}

function render(coupons) {
  main.replaceChildren(
    adminNav("coupons.html"),
    el("h1", {}, "Coupons"),
    el("section", { class: "card card-body" }, couponForm()),
    el("div", { class: "table-wrap", style: "margin-top:1.5rem" },
      el("table", {},
        el("thead", {}, el("tr", {}, el("th", {}, "Code"), el("th", {}, "Type"), el("th", {}, "Value"), el("th", {}, "Window"), el("th", {}, "Used"), el("th", {}, ""))),
        el("tbody", {}, ...coupons.map((c) =>
          el("tr", {},
            el("td", {}, c.code, c.isActive ? null : el("span", { class: "chip" }, " inactive")),
            el("td", {}, getDiscountTypeName(c.discountType)), // ⚡ عرض اسم النوع بدلاً من الرقم
            el("td", {}, String(c.discountValue)),
            el("td", {}, `${formatDate(c.startDate)} → ${formatDate(c.endDate)}`),
            el("td", {}, `${c.timesUsed ?? 0}${c.usageLimit ? ` / ${c.usageLimit}` : ""}`),
            el("td", {},
              el("button", { class: "btn btn-secondary btn-sm", type: "button", onClick: () => {
                $("#coupon-form").replaceWith(couponForm(c));
                bind();
              } }, "Edit"),
              " ",
              el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: () => removeCoupon(c) }, "Delete")
            )
          )
        ))
      )
    )
  );
  bind();
}

function bind() {
  $("#coupon-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = event.target.querySelector("[name=id]").value;
    try {
      if (id) await couponsApi.update(Number(id), dtoFrom(event.target));
      else await couponsApi.create(dtoFrom(event.target));
      toast.success(id ? "Coupon updated" : "Coupon created");
      load();
    } catch (error) {
      handleApiError(error);
    }
  });
}

async function removeCoupon(coupon) {
  if (!await confirmModal({ title: "Delete coupon", message: `Delete ${coupon.code}?`, danger: true, confirmLabel: "Delete" })) return;
  try {
    await couponsApi.remove(coupon.id);
    toast.success("Coupon deleted");
    load();
  } catch (error) {
    handleApiError(error);
  }
}

load();