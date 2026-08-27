import { ROOT_PATH } from "../config.js";
import { ensureSession } from "../api/http.js";
import { authApi, cartApi } from "../api/services.js";
import { clearSession, getRefreshToken, getUser, isAdmin, isAuthenticated, requireAdmin, requireAuth } from "../auth/session.js";
import { el } from "./dom.js";

function navLink(href, label, page) {
  const current = document.body.dataset.page === page;
  return el("a", { href, "aria-current": current ? "page" : null }, label);
}

export async function logoutAndRedirect() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) await authApi.logout(refreshToken);
  } catch {
    /* still clear locally */
  }
  clearSession();
  window.location.href = `${ROOT_PATH}/index.html`;
}

export function renderNavbar() {
  const host = document.getElementById("app-header");
  if (!host) return;
  const user = getUser();
  const toggle = el("button", {
    class: "nav-toggle",
    type: "button",
    "aria-expanded": "false",
    "aria-controls": "site-nav",
    "aria-label": "Open menu"
  }, "Menu");

  const nav = el("nav", { class: "site-nav", id: "site-nav", "aria-label": "Primary" },
    navLink(`${ROOT_PATH}/index.html`, "Home", "home"),
    navLink(`${ROOT_PATH}/products.html`, "Products", "products"),
    navLink(`${ROOT_PATH}/categories.html`, "Categories", "categories"),
    isAuthenticated() ? navLink(`${ROOT_PATH}/orders.html`, "Orders", "orders") : null,
    isAdmin() ? navLink(`${ROOT_PATH}/admin/index.html`, "Admin", "admin") : null
  );

  const actions = el("div", { class: "nav-actions" },
    el("a", { class: "icon-btn", href: `${ROOT_PATH}/wishlist.html`, "aria-label": "Wishlist" }, "Wishlist"),
    el("a", { class: "icon-btn", href: `${ROOT_PATH}/cart.html`, "aria-label": "Cart", id: "cart-link" },
      "Cart",
      el("span", { class: "badge", id: "cart-count", hidden: true }, "0")
    ),
    isAuthenticated()
      ? el("a", { class: "icon-btn", href: `${ROOT_PATH}/profile.html` }, user?.email || "Account")
      : el("a", { class: "btn btn-ghost btn-sm", href: `${ROOT_PATH}/register.html` }, "Create account"),
    isAuthenticated()
      ? null
      : el("a", { class: "btn btn-primary btn-sm", href: `${ROOT_PATH}/login.html` }, "Sign in"),
    isAuthenticated()
      ? el("button", { class: "btn btn-ghost btn-sm", type: "button", onClick: logoutAndRedirect }, "Log out")
      : null
  );

  host.replaceChildren(
    el("header", { class: "site-header" },
      el("div", { class: "container header-inner" },
        el("a", { class: "brand", href: `${ROOT_PATH}/index.html` },
          el("span", { class: "brand-mark", "aria-hidden": "true" }, "N"),
          "Northline"
        ),
        nav,
        actions,
        toggle
      )
    )
  );

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  });
}

export function renderFooter() {
  const host = document.getElementById("app-footer");
  if (!host) return;
  host.replaceChildren(
    el("footer", { class: "site-footer" },
      el("div", { class: "container footer-grid" },
        el("div", {},
          el("strong", {}, "Northline Market"),
          el("p", {}, "A focused storefront for everyday essentials, crafted around a clean catalog and a reliable checkout.")
        ),
        el("nav", { "aria-label": "Footer" },
          el("p", {}, el("a", { href: `${ROOT_PATH}/products.html` }, "Shop products")),
          el("p", {}, el("a", { href: `${ROOT_PATH}/categories.html` }, "Browse categories")),
          el("p", {}, el("a", { href: `${ROOT_PATH}/login.html` }, "Customer login")),
          el("p", {}, el("a", { href: `${ROOT_PATH}/register.html` }, "Create account"))
        ),
        el("div", {},
          el("p", {}, "Create a customer account, then sign in and enter the email verification code to start shopping.")
        )
      ),
      el("p", { class: "container copyright" }, `© ${new Date().getFullYear()} Northline Market`)
    )
  );
}

export async function refreshCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge || !isAuthenticated()) return;
  try {
    const cart = await cartApi.get();
    const count = cart?.totalItems || 0;
    badge.hidden = count === 0;
    badge.textContent = String(count);
  } catch {
    badge.hidden = true;
  }
}

export async function bootPage({ protect = false, admin = false } = {}) {
  await ensureSession();
  if (admin && !requireAdmin(ROOT_PATH)) return false;
  if (protect && !requireAuth(ROOT_PATH)) return false;
  renderNavbar();
  renderFooter();
  refreshCartBadge();
  return true;
}
