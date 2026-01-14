export function showError(elementId, message) {
    const errorEl = document.querySelector(`#${elementId}`);
    errorEl.textContent = message;
    errorEl.style.display = message ? "block" : "none";
}

export function clearError(elementId) {
    const errorEl = document.querySelector(`#${elementId}`);
    errorEl.textContent = "";
    errorEl.style.display = "none";
}