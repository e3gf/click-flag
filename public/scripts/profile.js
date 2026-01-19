document.addEventListener('DOMContentLoaded', () => {
    const d = document;
    d.body.classList.add("dark");
    const MODE = {
        OVERVIEW: "overview",
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

    const newUsername = d.querySelector("#new-username");
    const usernamePassword = d.querySelector("#username-password");

    const currentPassword = d.querySelector("#current-password");
    const newPassword = d.querySelector("#new-password");
    const newPasswordConfirm = d.querySelector("#new-password-confirm");

    const confirmButton = d.querySelector("#btn-confirm");
    const cancelButton = d.querySelector("#btn-cancel");

    const copyRecovery = d.querySelector("#btn-copy-recovery");
    const signOutBtn = d.querySelector("#sign-out-button");

    const overviewHidden = [newUsername, usernamePassword, currentPassword, newPassword, newPasswordConfirm, confirmButton, cancelButton];
    const overviewShown = [btnChangeUsername, btnChangePassword, copyRecovery];

    const usernameModeHidden = [btnChangePassword, btnChangeUsername, currentPassword, newPassword, newPasswordConfirm, copyRecovery];
    const usernameModeShown = [newUsername, usernamePassword, confirmButton, cancelButton];

    const passwordModeHidden =  [btnChangeUsername, btnChangePassword, newUsername, usernamePassword, copyRecovery];
    const passwordModeShown = [currentPassword, newPassword, newPasswordConfirm, confirmButton, cancelButton];
    
    function setMode(mode){
        switch(mode){
            case "overview": {
                overviewHidden.forEach((el) => {
                    el.classList.toggle("hidden", true);
                })
                overviewShown.forEach((el) => {
                    el.classList.toggle("hidden", false);
                })
                return;
            }
            case "username": {
                usernameModeHidden.forEach((el) => {
                    el.classList.toggle("hidden", true);
                })
                usernameModeShown.forEach((el) => {
                    el.classList.toggle("hidden", false);
                })
                confirmButton.textContent = "Change username";
                return;
            }
            case "password": {
                passwordModeHidden.forEach((el) => {
                    el.classList.toggle("hidden", true);
                })
                passwordModeShown.forEach((el) => {
                    el.classList.toggle("hidden", false);
                })
                confirmButton.textContent = "Change password";
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

    cancelButton.addEventListener("click", () => {
        setMode(MODE.OVERVIEW);
    })

    setMode(MODE.OVERVIEW);
});