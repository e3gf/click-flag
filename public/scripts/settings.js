import { game } from "./config/gameState.js";
import { initialSettings, setLoadedSettings, getLoadedSettings, save, applyChanges, updateSaveButtonVisibility, saveBtn, setValues, getCurrentSettings } from "./utils/settingsUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    const savedSettings = localStorage.getItem("settings");

    const settingsTab = document.querySelector("#settings-tab");

    const optionsTab = document.querySelector("#options-tab");

    const resetBtn = document.querySelector("#reset-settings-button");

    const skipTrackButton = document.querySelector("#skip-track-button");

    settingsTab.addEventListener("click", (e) => {
        e.stopPropagation();
    })

    setLoadedSettings(savedSettings ? JSON.parse(savedSettings) : initialSettings);

    optionsTab.addEventListener("input", updateSaveButtonVisibility);
    optionsTab.addEventListener("check", updateSaveButtonVisibility);

    saveBtn.addEventListener("click", () => {
        const newSettings = getCurrentSettings();
        save(newSettings);
        updateSaveButtonVisibility();
    });

    resetBtn.addEventListener("click", () => {
        setLoadedSettings(initialSettings);
        setValues(getLoadedSettings());
        updateSaveButtonVisibility();
        applyChanges(getLoadedSettings());
        save(getLoadedSettings());
    })

    skipTrackButton.addEventListener("click", () => {
        game.audio.playRandomMusic();
    })

    setValues(getLoadedSettings());
});
