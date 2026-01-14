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
