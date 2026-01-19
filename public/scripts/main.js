import Game from "./classes/game.js";

document.addEventListener("DOMContentLoaded", () => {
    const settings = JSON.parse(localStorage.getItem("settings"));
    document.body.classList.toggle("dark", !settings?.lightMode);
    const game = new Game(document);

    const profileButton = document.querySelector("#profile-container");
    const settingsButton = document.querySelector("#settings-container");
    const profileOverlay = document.querySelector("#profile-page");
    const profileGoBackBtn = document.querySelector("#profile-go-back-button");
    const settingsOverlay = document.querySelector("#settings-page");
    const settingsGoBackBtn = document.querySelector("#settings-go-back-button");

    const showProfileOverlay = () => {
        profileOverlay.classList.toggle("hidden", false);
    };
    const showSettingsOverlay = () => {
        settingsOverlay.classList.toggle("hidden", false);
    };
    const hideOverlays = () => {
        profileOverlay.classList.toggle("hidden", true);
        settingsOverlay.classList.toggle("hidden", true);
    };

    profileButton.addEventListener("click", showProfileOverlay);
    settingsGoBackBtn.addEventListener("click", hideOverlays);
    settingsButton.addEventListener("click", showSettingsOverlay);
    profileGoBackBtn.addEventListener("click", hideOverlays);
    profileOverlay.addEventListener("click", hideOverlays);
    settingsOverlay.addEventListener("click", hideOverlays);
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape"){
            hideOverlays();
        }
    });
})