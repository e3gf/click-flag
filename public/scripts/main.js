import { createGame, game} from "./config/gameState.js";
import { getCurrentSettings, getLoadedSettings, hideSaveDialogue, openSaveDialogue, revertChanges, save, saveDialogueOpened, setLoadedSettings, updateSaveButtonVisibility } from "./utils/settingsUtils.js";
import { clearError } from "./utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
    const settings = JSON.parse(localStorage.getItem("settings"));
    document.body.classList.toggle("dark", !settings?.lightMode);
    const gameVar = createGame(settings);

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

    const savePopupSave = document.querySelector("#save-popup-save");
    const savePopupCancel = document.querySelector("#save-popup-cancel");

    function handleSettingsExit() {
        const selectedSettings = getCurrentSettings();
        const loadedSettings = getLoadedSettings()
        const hasChanges = Object.keys(loadedSettings).some(
            key => loadedSettings[key] !== selectedSettings[key]
        );
        if(hasChanges) openSaveDialogue();
        else {
            settingsOverlay.classList.toggle("hidden", true);
        }
    }

    savePopupSave.addEventListener("click", () => {
        save();
        hideSaveDialogue();
        hideOverlays();
        updateSaveButtonVisibility();
    })

    savePopupCancel.addEventListener("click", () => {
        revertChanges();
        hideSaveDialogue();  
        hideOverlays();
        updateSaveButtonVisibility();
    })

})