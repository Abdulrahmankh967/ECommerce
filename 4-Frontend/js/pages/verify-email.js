import { ROOT_PATH } from "../config.js";
import { authApi } from "../api/services.js";
import { clearVerification, getVerification, safeReturnPath, saveTokens } from "../auth/session.js";
import { el, $, $all } from "../ui/dom.js";
import { handleApiError } from "../ui/errors.js";
import { bootPage } from "../ui/layout.js";
import { toast } from "../ui/toast.js";

await bootPage();

const pending = getVerification();
const next = safeReturnPath(paramsNext());
const OTP_LENGTH = 6;
const main = $("#main");

if (!pending.verificationId) {
  window.location.replace(`${ROOT_PATH}/login.html`);
  throw new Error("verification");
}

main.replaceChildren(
  el("section", { class: "card form-card" },
    el("h1", {}, "Enter verification code"),
    el("p", { class: "muted" }, pending.email
      ? `We sent a 6-digit code to ${pending.email}.`
      : "Enter the 6-digit code from your email."),
    el("form", { class: "form-stack", id: "verify-form" },
      el("input", {
        type: "text",
        name: "otp-autofill",
        class: "otp-autofill",
        inputmode: "numeric",
        autocomplete: "one-time-code",
        maxlength: String(OTP_LENGTH),
        "aria-label": "Verification code"
      }),
      el("div", { class: "otp-boxes", id: "otp-boxes", role: "group", "aria-label": "One-time passcode" },
        ...Array.from({ length: OTP_LENGTH }, (_, index) =>
          el("input", {
            class: "otp-digit",
            type: "text",
            inputmode: "numeric",
            maxlength: "1",
            pattern: "[0-9]",
            autocomplete: "off",
            "aria-label": `Digit ${index + 1} of ${OTP_LENGTH}`
          })
        )
      ),
      el("p", { class: "form-error", id: "form-error", role: "alert" }, ""),
      el("button", { class: "btn btn-primary btn-block", type: "submit" }, "Verify and continue"),
      el("p", { class: "muted" },
        el("a", { href: `${ROOT_PATH}/login.html` }, "Use a different email")
      )
    )
  )
);

const form = $("#verify-form");
const digits = $all(".otp-digit", form);
const autofill = form.querySelector(".otp-autofill");

function paramsNext() {
  return new URLSearchParams(window.location.search).get("next");
}

function otpValue() {
  return digits.map((input) => input.value.replace(/\D/g, "")).join("");
}

function fillOtp(value) {
  const chars = String(value).replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
  digits.forEach((input, index) => {
    input.value = chars[index] || "";
  });
  const nextEmpty = digits.find((input) => !input.value) || digits[OTP_LENGTH - 1];
  nextEmpty.focus();
}

digits[0].focus();

digits.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length > 1) {
      fillOtp(value);
    } else {
      event.target.value = value.slice(-1);
      if (value && digits[index + 1]) digits[index + 1].focus();
    }
    if (otpValue().length === OTP_LENGTH) form.requestSubmit();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !event.target.value && digits[index - 1]) {
      digits[index - 1].focus();
      digits[index - 1].value = "";
      event.preventDefault();
    }
    if (event.key === "ArrowLeft" && digits[index - 1]) digits[index - 1].focus();
    if (event.key === "ArrowRight" && digits[index + 1]) digits[index + 1].focus();
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    fillOtp(event.clipboardData.getData("text"));
    if (otpValue().length === OTP_LENGTH) form.requestSubmit();
  });
});

autofill.addEventListener("input", () => {
  fillOtp(autofill.value);
  if (otpValue().length === OTP_LENGTH) form.requestSubmit();
});

let submitting = false;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting) return;
  const errorEl = $("#form-error");
  errorEl.textContent = "";
  const otp = otpValue();
  if (otp.length !== OTP_LENGTH) {
    errorEl.textContent = "Enter the 6-digit code from your email.";
    digits[0].focus();
    return;
  }
  submitting = true;
  const button = form.querySelector("[type=submit]");
  button.disabled = true;
  digits.forEach((input) => { input.disabled = true; });
  try {
    const result = await authApi.verifyEmail(pending.verificationId, otp);
    saveTokens(result.accessToken, result.refreshToken);
    clearVerification();
    toast.success(result.message || "Email verified successfully.");
    window.location.href = next;
  } catch (error) {
    errorEl.textContent = handleApiError(error, { redirectOnAuth: false });
    digits.forEach((input) => { input.disabled = false; input.value = ""; });
    digits[0].focus();
  } finally {
    submitting = false;
    button.disabled = false;
  }
});
