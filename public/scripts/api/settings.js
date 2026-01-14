import { http } from "./http.js";

export function saveSettings(settings) {
    return http("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
    });
}

export function getSettings() {
    return http("/api/user/settings", {
        method: "GET",
    });
}