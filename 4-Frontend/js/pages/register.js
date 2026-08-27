import { authApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { getAccessToken, isAuthenticated } from "../auth/session.js";
import { ensureSession } from "../api/http.js";
import { el, $ } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { toast } from "../ui/toast.js";

await ensureSession();
if (isAuthenticated() && getAccessToken()) {
  window.location.replace(`${ROOT_PATH}/index.html`);
} else {
  await bootPage();
  const main = $("#main");

  main.replaceChildren(
    el("section", { class: "card form-card" },
      el("h1", {}, "Create account"),
      el("p", { class: "muted" }, "Register as a customer, then sign in and enter the code we email you."),
      el("form", { class: "form-stack", id: "register-form" },
        el("label", {}, "Full name",
          el("input", { class: "input", name: "fullName", required: true, minlength: "4", maxlength: "100", autocomplete: "name" })
        ),
        el("label", {}, "Email",
          el("input", { class: "input", name: "email", type: "email", required: true, autocomplete: "email" })
        ),
        el("label", {}, "Phone",
          el("input", { class: "input", name: "phone", type: "tel", required: true, autocomplete: "tel" })
        ),
        el("label", {}, "Password",
          el("input", { class: "input", name: "password", type: "password", required: true, minlength: "5", autocomplete: "new-password" })
        ),
        el("p", { class: "form-error", id: "form-error", role: "alert" }, ""),
        el("button", { class: "btn btn-primary btn-block", type: "submit" }, "Create account"),
        el("p", { class: "muted" },
          "Already have an account? ",
          el("a", { href: `${ROOT_PATH}/login.html` }, "Sign in")
        )
      )
    )
  );

  $("#register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorEl = $("#form-error");
    errorEl.textContent = "";
    const data = Object.fromEntries(new FormData(event.target).entries());
    const button = event.target.querySelector("[type=submit]");
    button.disabled = true;
    try {
      await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password
      });
      toast.success("Account created. Sign in to verify your email.");
      window.location.href = `${ROOT_PATH}/login.html`;
    } catch (error) {
      errorEl.textContent = handleApiError(error, { redirectOnAuth: false });
    } finally {
      button.disabled = false;
    }
  });
}
