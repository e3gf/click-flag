import { clearError } from "./utils/pass-validation";


document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    const btn = document.getElementById("sign-in-button");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    usernameInput.addEventListener("input", (e) => {
        const v = e.target.value;
        if(v === ""){
            clearError("username");
        }
    })
});