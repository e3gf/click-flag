export function openSaveDialogue(savePopup){
    savePopup.classList.toggle("hidden", false);
}

export function hideSaveDialogue(savePopup){
    savePopup.classList.toggle("hidden", true);
}

export function saveDialogueOpened(savePopup){
    return !savePopup.classList.contains("hidden");
}

export function handleSettingsExit(){
}

export const initialSettings = {
    musicVolume: 50,
    sfxVolume: 50,
    effectsEnabled: true,
    lightMode: false,
}

export let loadedSettings = {
    musicVolume: 50,
    sfxVolume: 50,
    effectsEnabled: true,
    lightMode: false,
}

export function setLoadedSettings(newSettings) {
    loadedSettings = newSettings;
}

export function getLoadedSettings() {
    return loadedSettings;
}

export function save(newSettings) {
    localStorage.setItem("settings", JSON.stringify(newSettings));
}