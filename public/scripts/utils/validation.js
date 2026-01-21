export function showError(elementId, message) {
    const errorEl = document.querySelector(`#${elementId}`);
    errorEl.textContent = message;
    errorEl.classList.toggle("hidden", false);
}

export function clearError(elementId) {
    const errorEl = document.querySelector(`#${elementId}`);
    errorEl.textContent = "";
    errorEl.classList.toggle("hidden", true);
}

export function validatePassword
    (v,
    passwordConfirmInput, 
    passwordError, 
    passwordConfirmError,
    passwordErrorId,
    passwordConfirmErrorId){
    if(v === ""){
        clearError(passwordErrorId);
        clearError(passwordConfirmErrorId);
        passwordError = false; 
        passwordConfirmError = false;
        return {passwordError, passwordConfirmError};
    }
    if(v.length < 6){
        showError(passwordErrorId, "Password should be at least 6 characters long.");
        if(passwordConfirmInput.value !== "") showError(passwordConfirmErrorId, "Passwords do not match.");
        else {
            clearError(passwordConfirmErrorId)
            passwordConfirmError = true;
        };
        passwordError = true; 
        return {passwordError, passwordConfirmError};
    }
    clearError(passwordErrorId);
    passwordError = false; 
    if(passwordConfirmInput.value !== "" && passwordConfirmInput.value !== v){
        showError(passwordConfirmErrorId, "Passwords do not match.");
        passwordConfirmError = true;
        return {passwordError, passwordConfirmError};
    }
    
    clearError(passwordConfirmErrorId);
    passwordConfirmError = false; 
    return {passwordError, passwordConfirmError};
}

export function validateConfirmPassword
    (v,
    passwordInput, 
    passwordConfirmError, 
    passwordConfirmErrorId){
        if(v === ""){
            clearError(passwordConfirmErrorId);
            passwordConfirmError = false; 
            return passwordConfirmError;
        }
        if(passwordInput.value !== "" && v !== passwordInput.value){
            showError(passwordConfirmErrorId, "Passwords do not match.");
            passwordConfirmError = true; 
        }
        else{
            clearError(passwordConfirmErrorId);
            passwordConfirmError = false; 
        }
        return passwordConfirmError;
}

export function validateUsername
    (v,
    usernameError,
    usernameErrorId){
    if(v === ""){
        clearError(usernameErrorId);
        usernameError = false; 
        return usernameError;
    }
    if(!(/^[a-zA-Z0-9_-]{1,20}$/.test(v))){
        showError(usernameErrorId, "Username should only contain alphanumeric characters and underscores, dashes.");
        usernameError = true; 
    }
    else{
        clearError(usernameErrorId);
        usernameError = false; 
    }
    return usernameError;
}