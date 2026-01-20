import Game from "./classes/game.js";
import { getLoadedSettings, hideSaveDialogue, openSaveDialogue, saveDialogueOpened } from "./utils/settingsUtils.js";

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
    settingsGoBackBtn.addEventListener("click", handleSettingsExit);
    settingsButton.addEventListener("click", showSettingsOverlay);
    profileGoBackBtn.addEventListener("click", hideOverlays);
    profileOverlay.addEventListener("click", hideOverlays);
    settingsOverlay.addEventListener("click", handleSettingsExit);
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape"){
            if(!settingsOverlay.classList.contains("hidden")){
                handleSettingsExit();
                return;
            }
            hideOverlays();
        }
    });


    // Settings tab

    const musicVolume = document.querySelector("#music-volume");
    const sfxVolume = document.querySelector("#sfx-volume");
    const effectsEnabled = document.querySelector("#effects-enabled");
    const lightMode = document.querySelector("#light-mode");

    const savePopup = document.querySelector("#save-popup-container");
    const savePopupSave = document.querySelector("#save-popup-save");
    const savePopupCancel = document.querySelector("#save-popup-cancel");

    function handleSettingsExit() {
        const selectedSettings = {
            musicVolume: parseInt(musicVolume.value),
            sfxVolume: parseInt(sfxVolume.value),
            effectsEnabled: effectsEnabled.checked,
            lightMode: lightMode.checked,
        }
        const loadedSettings = getLoadedSettings()
        const hasChanges = Object.keys(loadedSettings).some(
            key => loadedSettings[key] !== selectedSettings[key]
        );
        if(hasChanges) openSaveDialogue(savePopup);
        else {
            settingsOverlay.classList.toggle("hidden", true);
        }
    }

    savePopupSave.addEventListener("click", () => {
        hideSaveDialogue(savePopup);
        hideOverlays();
    })

    savePopupCancel.addEventListener("click", () => {
        hideSaveDialogue(savePopup);  
        hideOverlays();
    })


})