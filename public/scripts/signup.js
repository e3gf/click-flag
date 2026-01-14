import { clearError, showError } from "./utils/pass-validation.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    const btn = document.querySelector("#sign-up-button");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const passwordConfirmInput = document.querySelector("#password-confirm");

    let usernameError = false;
    let passwordError = false;
    let passwordConfirmError = false;

    usernameInput.addEventListener("input", (e) => {
        const v = e.target.value;
        if(v === ""){
            clearError("username-error");
            usernameError = false; 
            return;
        }
        if(!(/^[a-zA-Z0-9_-]{1,20}$/.test(v))){
            showError("username-error", "Username should only contain alphanumeric characters and underscores, dashes.");
            usernameError = true; 
        }
        else{
            clearError("username-error");
            usernameError = false; 
        }
    })

    passwordInput.addEventListener("input", (e) => {
        const v = e.target.value;
        if(v === ""){
            clearError("password-error");
            clearError("password-confirm-error");
            passwordError = false; 
            return;
        }
        if(v.length < 6){
            showError("password-error", "Password should be at least 6 characters long.");
            if(passwordConfirmInput.value !== "") showError("password-confirm-error", "Passwords do not match.");
            else {
                clearError("password-confirm-error")
                passwordConfirmError = true;
            };
            passwordError = true; 
            return;
        }
        clearError("password-error");
        passwordError = false; 
        if(passwordConfirmInput.value !== "" && passwordConfirmInput.value !== v){
            showError("password-confirm-error", "Passwords do not match.");
            passwordConfirmError = true;
            return;
        }
        
        clearError("password-confirm-error");
        passwordConfirmError = false; 
    })

    passwordConfirmInput.addEventListener("input", (e) => {
        const v = e.target.value;
        if(v === ""){
            clearError("password-confirm-error");
            passwordConfirmError = false; 
            return;
        }
        if(passwordInput.value !== "" && v !== passwordInput.value){
            showError("password-confirm-error", "Passwords do not match.");
            passwordConfirmError = true; 
        }
        else{
            clearError("password-confirm-error");
            passwordConfirmError = false; 
        }
    })

    btn.addEventListener("click", () => {
        if(usernameInput.value === "" || passwordInput.value === "" || passwordConfirmInput.value === "" || usernameError || passwordError || passwordConfirmError) return;

        const username = usernameInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput;

        
    })

});
