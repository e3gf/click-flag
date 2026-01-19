import { clearError, showError, validateConfirmPassword, validatePassword } from "./utils/pass-validation.js";
import { signUp } from "./api/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");

    const signUpPart = document.querySelector("#sign-up-part");
    const signUpBtn = document.querySelector("#sign-up-button");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const passwordConfirmInput = document.querySelector("#password-confirm");

    const recoveryPart = document.querySelector("#recovery-code-part");
    const recoveryBtn = document.querySelector("#recovery-button");
    const recoveryCode = document.querySelector("#recovery-code");
    const copyIndicator = document.querySelector("#copy-indicator");

    usernameInput.value = "";

    let usernameError = false;
    let passwordError = false;
    let passwordConfirmError = false;

    const checkBtnState = () => {
        const disable = usernameInput.value === "" || passwordInput.value === "" || passwordConfirmInput.value === "" || usernameError || passwordError || passwordConfirmError;
        signUpBtn.disabled = disable;
        signUpBtn.classList.toggle("disabled", disable);
    }

    signUpPart.addEventListener("input", () => {
        clearError("server-error");
    });

    usernameInput.addEventListener("input", (e) => {
        const v = e.target.value;
        if(v === ""){
            clearError("username-error");
            usernameError = false; 
            checkBtnState();
            return;
        }
        if(!(/^[a-zA-Z0-9_-]{1,20}$/.test(v))){
            showError("username-error", "Username should only contain alphanumeric characters and underscores, dashes.");
            usernameError = true; 
            checkBtnState();
        }
        else{
            clearError("username-error");
            usernameError = false; 
            checkBtnState();
        }
    })

    passwordInput.addEventListener("input", (e) => {
        const v = e.target.value;
        ({passwordError, passwordConfirmError} = 
            validatePassword(
                v, 
                passwordConfirmInput, 
                passwordError, 
                passwordConfirmError, 
                "password-error", 
                "password-confirm-error"
            ));
        checkBtnState();
    })  
    passwordConfirmInput.addEventListener("input", (e) => {
        const v = e.target.value;
        passwordConfirmError = 
            validateConfirmPassword(
                v, 
                passwordInput, 
                passwordConfirmError, 
                "password-confirm-error"
            );
        checkBtnState();
    })

    const goToRecovery = (code) => {
        signUpPart.classList.toggle("hidden", true);
        recoveryPart.classList.toggle("hidden", false);
        recoveryCode.textContent = code;
    }

    signUpBtn.addEventListener("click", async () => {
        clearError("server-error");

        const username = usernameInput.value;
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput;

        signUpBtn.disabled = true;
        signUpBtn.classList.toggle("disabled", true);

        try {
            const res = await signUp({
                username: username,
                password: password,
                passwordConfirm: passwordConfirm
            });

            goToRecovery(res.code);
        } catch (err) {
            goToRecovery("a33cfee402ab81ec");
            // showError("server-error", err.message);
        } finally {
            signUpBtn.disabled = false;
            signUpBtn.classList.toggle("disabled", false);
        }
    })



    const showCopyStatus = (state) => {
        copyIndicator.classList.toggle("hidden", state);
    }

    recoveryBtn.addEventListener("click", () => {
        window.location.href = "/";
    })

    recoveryCode.addEventListener("click", () => {
        navigator.clipboard.writeText(recoveryCode.textContent)
            .then(() => showCopyStatus(false))
            .catch(() => showCopyStatus(true));
    })
});
