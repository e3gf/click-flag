import { http } from "./http.js";

export function signUp({ username, password, passwordConfirm }) {
    return http("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username, password, passwordConfirm }),
    });
}

export function signIn({ username, password}) {
    return http("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export function recover({ recoveryCode }) {
    return http("/api/auth/recover", {
        method: "POST",
        body: JSON.stringify({ recoveryCode }),
    });
}

export function resetPassword({ newPassword, newPasswordConfirm }) {
    return http("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ newPassword, newPasswordConfirm }),
    });
}