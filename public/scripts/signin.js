import { clearError, showError, validateConfirmPassword, validatePassword } from "./utils/pass-validation.js";
import { recover, resetPassword, signIn } from "./api/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");


    // Sign in section

    const signInPart = document.querySelector("#sign-in-part");
    const signInBtn = document.querySelector("#sign-in-button");
    const usernameInput = document.querySelector("#username");
    const passwordInput = document.querySelector("#password");
    const forgotPassword = document.querySelector("#forgot-password");



    const checkBtnState = () => {
        const disable = usernameInput.value === "" || passwordInput.value === "";
        signInBtn.disabled = disable;
        signInBtn.classList.toggle("disabled", disable);
    }

    checkBtnState();

    signInPart.addEventListener("input", () => {
        clearError("main-error");
        checkBtnState();
    });

    signInBtn.addEventListener("click", async () => {
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

        signInBtn.disabled = true;

        try {
            await signIn({
                username: username,
                password: password,
            });

            window.location.href = "/";
        } catch (err) {
            showError("main-error", err.message);
        } finally {
            signInBtn.disabled = false;
        }
    });

    forgotPassword.addEventListener("click", () => {
        signInPart.classList.toggle("hidden", true);
        recoveryPart.classList.toggle("hidden", false);
        checkRecoveryBtnState();
        clearError("recovery-error");
    })

    // Recovery section

    const recoveryPart = document.querySelector("#input-recovery-part");
    const recoveryCodeInput = document.querySelector("#recovery-code");
    const recoveryBtn = document.querySelector("#recovery-code-button");
    const goBackBtn = document.querySelector("#go-back-button");

    usernameInput.value = "";
    recoveryCodeInput.value = "";

    goBackBtn.addEventListener("click", () => {
        recoveryPart.classList.toggle("hidden", true);
        signInPart.classList.toggle("hidden", false);
        clearError("main-error");
    })

    const checkRecoveryBtnState = () => {
       const disable = recoveryCodeInput.value.length !== 16;
       recoveryBtn.disabled = disable;
       recoveryBtn.classList.toggle("disabled", disable);
    }

    recoveryPart.addEventListener("input", () => {
        checkRecoveryBtnState();
        clearError("recovery-error");
    });

    recoveryBtn.addEventListener("click", async () => {
        recoveryBtn.disabled = true;
        recoveryBtn.classList.toggle("disabled", true);
        try {
            await recover({ recoveryCode: recoveryCodeInput.value });
            recoveryPart.classList.toggle("hidden", true);
            resetPasswordPart.classList.toggle("hidden", false);
        } catch (error) {
            // showError("recovery-error", error);
            recoveryPart.classList.toggle("hidden", true);
            resetPasswordPart.classList.toggle("hidden", false);
        } finally {
            recoveryBtn.disabled = false;
            recoveryBtn.classList.toggle("disabled", false);
        }
    })


    // Reset section

    const resetPasswordPart = document.querySelector("#reset-password-part");
    const newPasswordInput = document.querySelector("#new-password");
    const newPasswordConfirmInput = document.querySelector("#new-password-confirm");
    const resetPasswordBtn = document.querySelector("#reset-password-button")

    let newPasswordError = false;
    let newPasswordConfirmError = false;

    const checkResetBtnState = () => {
        const disable = newPasswordInput.value === "" || newPasswordConfirmInput.value === "" || newPasswordError || newPasswordConfirmError;
        resetPasswordBtn.disabled = disable;
        resetPasswordBtn.classList.toggle("disabled", disable);
    }

    resetPasswordPart.addEventListener("input", () => {
        checkResetBtnState();
        clearError("reset-error");
    });
    
    newPasswordInput.addEventListener("input", () => {
        const v = newPasswordInput.value;
        ({passwordError: newPasswordError, passwordConfirmError: newPasswordConfirmError} = 
            validatePassword(
                v, 
                newPasswordConfirmInput, 
                newPasswordError,
                newPasswordConfirmError,
                "new-password-error",
                "new-password-confirm-error"
            ));
        checkResetBtnState();
        console.log(newPasswordConfirmError);
    });

    newPasswordConfirmInput.addEventListener("input", () => {
        const v = newPasswordConfirmInput.value;
        newPasswordConfirmError = 
            validateConfirmPassword(
                v, 
                newPasswordInput, 
                newPasswordConfirmError, 
                "new-password-confirm-error");
        checkResetBtnState();
    });

    resetPasswordBtn.addEventListener("click", async () => {
        clearError("reset-error");

        resetPasswordBtn.disabled = true;
        resetPasswordBtn.classList.toggle("disabled", true);

        try {
           await resetPassword({ newPassword: newPasswordInput.value, newPasswordConfirm: newPasswordConfirmInput.value });

           window.location.href = "/";
        } catch (error) {
            showError("reset-error", error)
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.classList.toggle("disabled", false);
        }
    })

});
