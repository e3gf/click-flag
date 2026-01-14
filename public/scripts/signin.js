import { clearError, showError } from "./utils/pass-validation.js";
import { signIn } from "./api/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    const signInTab = document.querySelector("#sign-in-tab");
    const btn = document.querySelector("#sign-in-button");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");

    signInTab.addEventListener("input", () => {
        clearError("main-error");
    });

    btn.addEventListener("click", async () => {
        clearError("main-error");
        if(usernameInput.value === ""){
            showError("main-error", "Username cannot be empty.");
            return;
        }

        if(passwordInput.value === ""){
            showError("main-error", "Password cannot be empty.");
            return;
        }

        const username = usernameInput.value;
        const password = passwordInput.value;

        btn.disabled = true;

        try {
            await signIn({
                username: username,
                password: password,
            });

            window.location.href = "/";
        } catch (err) {
            showError("main-error", err.message);
        } finally {
            btn.disabled = false;
        }
    });

});
