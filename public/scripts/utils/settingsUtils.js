import { game } from "../config/gameState.js";

export const initialSettings = {
    musicVolume: 50,
    sfxVolume: 50,
    effectsEnabled: true,
    lightMode: false,
}

export let loadedSettings = { ...initialSettings };

export const musicVolume = document.querySelector("#music-volume");
export const sfxVolume = document.querySelector("#sfx-volume");
export const effectsEnabled = document.querySelector("#effects-enabled");
export const lightMode = document.querySelector("#light-mode");
export const saveBtn = document.querySelector("#save-settings-button");
export const savePopup = document.querySelector("#save-popup-container");

export function openSaveDialogue(){
    savePopup.classList.toggle("hidden", false);
}

export function hideSaveDialogue(){
    savePopup.classList.toggle("hidden", true);
}

export function saveDialogueOpened(){
    return !savePopup.classList.contains("hidden");
}

export function updateSaveButtonVisibility() {
    saveBtn.classList.toggle("save-settings-button-changes", hasChanges());
    saveBtn.disabled = !hasChanges();
};

export function setLoadedSettings(newSettings) {
    loadedSettings = newSettings;
}

export function getLoadedSettings() {
    return loadedSettings;
}

export function getCurrentSettings(){
    return {
        musicVolume: parseInt(musicVolume.value),
        sfxVolume: parseInt(sfxVolume.value),
        effectsEnabled: effectsEnabled.checked,
        lightMode: lightMode.checked,
    }
};

export function setValues(settings) {
    musicVolume.value = settings.musicVolume;
    sfxVolume.value = settings.sfxVolume;
    effectsEnabled.checked = settings.effectsEnabled;
    lightMode.checked = settings.lightMode;
}

export function hasChanges() {
    const current = getCurrentSettings();
    const loadedSettings = getLoadedSettings();
    return Object.keys(loadedSettings).some(
        key => loadedSettings[key] !== current[key]
    );
};

export function save() {
    const newSettings = getCurrentSettings();
    applyChanges(newSettings);
    saveToLocalStorage(newSettings);
    setLoadedSettings(newSettings);
}

export function saveToLocalStorage(newSettings){
    localStorage.setItem("settings", JSON.stringify(newSettings));
}

export function applyChanges(newSettings) {
    document.body.classList.toggle("dark", !newSettings.lightMode);
    game.audio.setSFXVolume(newSettings.sfxVolume / 100);
    game.audio.setMusicVolume(newSettings.musicVolume / 100);
    if(newSettings.musicVolume === 0){
        game.audio.stopMusic();
    }
    else if(getLoadedSettings().musicVolume === 0){
        game.audio.playRandomMusic();
    }
}

export function revertChanges(){
    setValues(getLoadedSettings());
}