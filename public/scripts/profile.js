import { validateConfirmPassword } from "./utils/validation.js";
import { validatePassword } from "./utils/validation.js";
import { validateUsername } from "./utils/validation.js";

document.addEventListener('DOMContentLoaded', () => {
    const d = document;
    d.body.classList.add("dark");
    const MODE = {
        HOME: "home",
        USERNAME: "username",
        PASSWORD: "password",
    };

    let currentMode = MODE.OVERVIEW;

    const profileTab = d.querySelector("#profile-tab");

    profileTab.addEventListener("click", (e) => {
        e.stopPropagation();
    })

    const btnChangeUsername = d.querySelector("#btn-change-username");
    const btnChangePassword = d.querySelector("#btn-change-password");

    const copyRecovery = d.querySelector("#btn-copy-recovery");
    const signOutBtn = d.querySelector("#sign-out-button");

    const homeTab = d.querySelector("#user-home");
    const usernameTab = d.querySelector("#user-username");
    const passwordTab = d.querySelector("#user-password");
    
    function setMode(mode){
        switch(mode){
            case MODE.HOME: {
                homeTab.classList.toggle("hidden", false);
                usernameTab.classList.toggle("hidden", true);
                passwordTab.classList.toggle("hidden", true);
                return;
            }
            case MODE.USERNAME: {
                homeTab.classList.toggle("hidden", true);
                usernameTab.classList.toggle("hidden", false);
                passwordTab.classList.toggle("hidden", true);
                return;
            }
            case "password": {
                homeTab.classList.toggle("hidden", true);
                usernameTab.classList.toggle("hidden", true);
                passwordTab.classList.toggle("hidden", false);
                return;
            }
        }
    }

    btnChangeUsername.addEventListener("click", () => {
        setMode(MODE.USERNAME);
    })

    btnChangePassword.addEventListener("click", () => {
        setMode(MODE.PASSWORD);
    })



    // Username

    const confirmButtonUsername = d.querySelector("#btn-confirm-username");
    const cancelButtonUsername = d.querySelector("#btn-cancel-username");

    const newUsername = d.querySelector("#new-username");
    const usernamePassword = d.querySelector("#username-password");

    let usernameError = false;

    const checkBtnUsernameState = () => {
        const disable = newUsername.value === "" || usernamePassword.value === "" || usernameError;
        confirmButtonUsername.disabled = disable;
        confirmButtonUsername.classList.toggle("disabled", disable);
    }

    usernameTab.addEventListener("input", checkBtnUsernameState);

    newUsername.addEventListener("input", (e) => {
        const v = e.target.value;
        usernameError = validateUsername(v, usernameError, "username-change-error");
        checkBtnUsernameState();
    });

    checkBtnUsernameState();

    cancelButtonUsername.addEventListener("click", () => {
        setMode(MODE.HOME);
    })

    // Password

    const confirmButtonPassword = d.querySelector("#btn-confirm-password");
    const cancelButtonPassword = d.querySelector("#btn-cancel-password");

    const currentPassword = d.querySelector("#current-password");
    const newPassword = d.querySelector("#new-password");
    const newPasswordConfirm = d.querySelector("#new-password-confirm");

    let newPasswordError = false;
    let newPasswordConfirmError = false;

    const checkBtnPasswordState = () => {
        const disable = currentPassword.value === "" || newPassword.value === "" || newPasswordConfirm.value === "" || newPasswordError || newPasswordConfirmError;
        confirmButtonPassword.disabled = disable;
        confirmButtonPassword.classList.toggle("disabled", disable);
    }

    passwordTab.addEventListener("input", checkBtnPasswordState);

    newPassword.addEventListener("input", (e) => {
        const v = e.target.value;
        ({newPasswordError, newPasswordConfirmError} = validatePassword(
            v,
            newPasswordConfirm,
            newPasswordError,
            newPasswordConfirmError,
            "password-change-new-password-error",
            "password-change-new-password-confirm-error"
        ));
        checkBtnPasswordState();
    })

    newPasswordConfirm.addEventListener("input", (e) => {
        const v = e.target.value;
        newPasswordConfirmError = validateConfirmPassword(
            v,
            newPassword,
            newPasswordConfirmError,
            "password-change-new-password-confirm-error"
        );
        checkBtnPasswordState();
    })

    cancelButtonPassword.addEventListener("click", () => {
        setMode(MODE.HOME);
    })

    checkBtnPasswordState();

    setMode(MODE.OVERVIEW);
});