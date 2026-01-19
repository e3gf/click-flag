import { saveSettings } from "./api/settings.js";

document.addEventListener("DOMContentLoaded", () => {
    const loadedSettings = localStorage.getItem("settings");
    document.body.classList.toggle("dark", !(JSON.parse(loadedSettings)?.lightMode));

    const settingsTab = document.querySelector("#settings-tab");

    const musicVolume = document.querySelector("#music-volume");
    const sfxVolume = document.querySelector("#sfx-volume");
    const effectsEnabled = document.querySelector("#effects-enabled");
    const lightMode = document.querySelector("#light-mode");
    const optionsTab = document.querySelector("#options-tab");

    const saveBtn = document.querySelector("#save-settings-button");

    settingsTab.addEventListener("click", (e) => {
        e.stopPropagation();
    })

    let initialSettings = loadedSettings ? JSON.parse(loadedSettings) : {
        musicVolume: 50,
        sfxVolume: 50,
        effectsEnabled: true,
        lightMode: false,
    };

    const getCurrentSettings = () => ({
        musicVolume: musicVolume.value,
        sfxVolume: sfxVolume.value,
        effectsEnabled: effectsEnabled.checked,
        lightMode: lightMode.checked,
    });

    const setValues = (settings) => {
        musicVolume.value = settings.musicVolume;
        sfxVolume.value = settings.sfxVolume;
        effectsEnabled.checked = settings.effectsEnabled;
        lightMode.checked = settings.lightMode;
    }

    const hasChanges = () => {
        const current = getCurrentSettings();
        return Object.keys(initialSettings).some(
            key => initialSettings[key] !== current[key]
        );
    };

    const updateSaveButtonVisibility = () => {
        saveBtn.classList.toggle("save-settings-button-changes", hasChanges());
        saveBtn.disabled = !hasChanges();
    };

    optionsTab.addEventListener("input", updateSaveButtonVisibility);
    optionsTab.addEventListener("check", updateSaveButtonVisibility);

    saveBtn.addEventListener("click", () => {
        saveBtn.disabled = true;
        saveBtn.classList.toggle("save-settings-button-changes", false);

        const newSettings = getCurrentSettings();
        document.body.classList.toggle("dark", !newSettings.lightMode);
        localStorage.setItem("settings", JSON.stringify(newSettings));
        initialSettings = newSettings;
    });

    setValues(initialSettings);
});
