import { saveSettings } from "./api/settings.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("dark");
    const musicVolume = document.querySelector("#music-volume");
    const sfxVolume = document.querySelector("#sfx-volume");
    const effectsEnabled = document.querySelector("#effects-enabled");
    const lightMode = document.querySelector("#light-mode");

    const saveBtn = document.querySelector("#save-settings-button");
    const errorEl = document.querySelector("#settings-error");

    // Initial state (would normally come from backend)
    const initialSettings = {
        musicVolume: musicVolume.value,
        sfxVolume: sfxVolume.value,
        effectsEnabled: effectsEnabled.checked,
        lightMode: lightMode.checked,
    };

    const getCurrentSettings = () => ({
        musicVolume: musicVolume.value,
        sfxVolume: sfxVolume.value,
        effectsEnabled: effectsEnabled.checked,
        lightMode: lightMode.checked,
    });

    const hasChanges = () => {
        const current = getCurrentSettings();
        return Object.keys(initialSettings).some(
            key => initialSettings[key] !== current[key]
        );
    };

    const updateSaveButtonVisibility = () => {
        saveBtn.style.display = hasChanges() ? "block" : "none";
    };

    const clearError = () => {
        errorEl.textContent = "";
    };

    const showError = (msg) => {
        errorEl.textContent = msg;
    };

    // Listen to changes
    [
        musicVolume,
        sfxVolume,
        effectsEnabled,
        lightMode
    ].forEach(el => {
        el.addEventListener("input", updateSaveButtonVisibility);
        el.addEventListener("change", updateSaveButtonVisibility);
    });

    saveBtn.addEventListener("click", async () => {
        clearError();
        saveBtn.disabled = true;

        try {
            const settings = getCurrentSettings();
            await saveSettings(settings);

            // Update baseline
            Object.assign(initialSettings, settings);
            updateSaveButtonVisibility();
        } catch (err) {
            showError(err.message || "Failed to save settings.");
        } finally {
            saveBtn.disabled = false;
        }
    });
});
