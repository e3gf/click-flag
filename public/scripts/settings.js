import { saveSettings } from "./api/settings.js";
import { initialSettings, setLoadedSettings, getLoadedSettings, save } from "./utils/settingsUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    const savedSettings = localStorage.getItem("settings");
    document.body.classList.toggle("dark", !(JSON.parse(savedSettings)?.lightMode));

    const settingsTab = document.querySelector("#settings-tab");

    const musicVolume = document.querySelector("#music-volume");
    const sfxVolume = document.querySelector("#sfx-volume");
    const effectsEnabled = document.querySelector("#effects-enabled");
    const lightMode = document.querySelector("#light-mode");
    const optionsTab = document.querySelector("#options-tab");

    const saveBtn = document.querySelector("#save-settings-button");
    const resetBtn = document.querySelector("#reset-settings-button");

    settingsTab.addEventListener("click", (e) => {
        e.stopPropagation();
    })

    setLoadedSettings(savedSettings ? JSON.parse(savedSettings) : initialSettings);

    const getCurrentSettings = () => ({
        musicVolume: parseInt(musicVolume.value),
        sfxVolume: parseInt(sfxVolume.value),
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
        const loadedSettings = getLoadedSettings();
        return Object.keys(loadedSettings).some(
            key => loadedSettings[key] !== current[key]
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
        applyChanges(newSettings);
        save(newSettings);
        setLoadedSettings(newSettings);
    });

    resetBtn.addEventListener("click", () => {
        setLoadedSettings(initialSettings);
        setValues(getLoadedSettings());
        updateSaveButtonVisibility();
        applyChanges(getLoadedSettings());
        save(getLoadedSettings());
    })

    setValues(getLoadedSettings());

    const applyChanges = (newSettings) => {
        document.body.classList.toggle("dark", !newSettings.lightMode);
    }

});
