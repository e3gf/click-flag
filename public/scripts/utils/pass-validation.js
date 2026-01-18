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