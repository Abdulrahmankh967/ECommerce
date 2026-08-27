import { customersApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { getUser } from "../auth/session.js";
import { el, $, formatDate, money } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { toast } from "../ui/toast.js";
import { emptyState, errorState, loadingState } from "../ui/states.js";

if (!await bootPage({ protect: true })) throw new Error("auth");

const main = $("#main");
const user = getUser();

async function load() {
  main.replaceChildren(loadingState("Loading profile…"));
  try {
    const customer = await customersApi.getById(user.id);
    render(customer);
  } catch (error) {
    main.replaceChildren(errorState(handleApiError(error), load));
  }
}

function render(customer) {
  main.replaceChildren(
    el("div", { class: "account-layout" },
      el("section", { class: "card card-body" },
        el("h1", {}, "Profile"),
        el("p", { class: "muted" }, user.role ? `Signed in as ${user.role}` : ""),
        el("form", { class: "form-stack", id: "profile-form" },
          el("label", {}, "Full name", el("input", { class: "input", name: "fullName", required: true, value: customer.fullName || "" })),
          el("label", {}, "Email", el("input", { class: "input", name: "email", type: "email", required: true, value: customer.email || user.email || "" })),
          el("label", {}, "Phone", el("input", { class: "input", name: "phone", type: "tel", value: customer.phone || "", placeholder: "Optional" })),
          el("button", { class: "btn btn-primary", type: "submit" }, "Save profile")
        ),
        el("hr"),
        el("h2", {}, "Change password"),
        el("form", { class: "form-stack", id: "password-form" },
          el("label", {}, "Current password", el("input", { class: "input", name: "currentPassword", type: "password", required: true })),
          el("label", {}, "New password", el("input", { class: "input", name: "newPassword", type: "password", required: true, minlength: "5" })),
          el("button", { class: "btn btn-secondary", type: "submit" }, "Update password")
        )
      ),
      el("aside", { class: "card card-body" },
        el("h2", {}, "Account"),
        el("p", {}, el("a", { href: `${ROOT_PATH}/addresses.html` }, "Manage addresses")),
        el("p", {}, el("a", { href: `${ROOT_PATH}/orders.html` }, "Order history")),
        el("p", {}, el("a", { href: `${ROOT_PATH}/wishlist.html` }, "Wishlist")),
        el("h3", {}, "Recent orders"),
        customer.orders?.length
          ? el("ul", {}, ...customer.orders.slice(0, 5).map((order) =>
            el("li", {},
              el("a", { href: `${ROOT_PATH}/order.html?id=${order.id}` }, `Order #${order.id}`),
              ` · ${formatDate(order.orderDate)} · ${money(order.totalPrice)}`
            )
          ))
          : emptyState("No orders", "Your purchases will appear here.")
      )
    )
  );

  $("#profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const dto = {
      fullName: data.fullName,
      email: data.email,
      phone: String(data.phone || "").trim()
    };
    try {
      await customersApi.updateCurrent(dto);
      toast.success("Profile updated");
    } catch (error) {
      handleApiError(error);
    }
  });

  $("#password-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const dto = Object.fromEntries(new FormData(event.target).entries());
    try {
      await customersApi.changePassword(dto);
      toast.success("Password updated");
      event.target.reset();
    } catch (error) {
      handleApiError(error);
    }
  });
}

load();
