import { ensureSession } from "../api/http.js";
import { authApi } from "../api/services.js";
import { ROOT_PATH } from "../config.js";
import { getAccessToken, isAuthenticated, safeReturnPath, saveVerification } from "../auth/session.js";
import { el, $, params } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";

await ensureSession();
if (isAuthenticated() && getAccessToken()) {
  window.location.replace(safeReturnPath(params().get("next")));
} else {
  await bootPage();
  const next = safeReturnPath(params().get("next"), "");
  const main = $("#main");
  main.replaceChildren(
    el("section", { class: "card form-card" },
      el("h1", {}, "Sign in"),
      el("form", { class: "form-stack", id: "login-form" },
        el("label", {}, "Email",
          el("input", { class: "input", type: "email", name: "email", required: true, autocomplete: "email" })
        ),
        el("label", {}, "Password",
          el("input", { class: "input", type: "password", name: "password", required: true, autocomplete: "current-password" })
        ),
        el("p", { class: "form-error", id: "form-error", role: "alert" }, ""),
        el("button", { class: "btn btn-primary btn-block", type: "submit" }, "Continue"),
        el("p", { class: "muted" },
          "Need an account? ",
          el("a", { href: `${ROOT_PATH}/register.html` }, "Create account")
        )
      )
    )
  );

  $("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorEl = $("#form-error");
    errorEl.textContent = "";
    const data = new FormData(event.target);
    const button = event.target.querySelector("button");
    button.disabled = true;
    try {
      const result = await authApi.login(String(data.get("email")), String(data.get("password")));
      saveVerification(result.verificationId, String(data.get("email")));
      const verifyUrl = new URL(`${ROOT_PATH}/verify-email.html`, window.location.href);
      if (next) verifyUrl.searchParams.set("next", next);
      window.location.href = verifyUrl.pathname + verifyUrl.search;
    } catch (error) {
      errorEl.textContent = handleApiError(error, { redirectOnAuth: false });
    } finally {
      button.disabled = false;
    }
  });
}
