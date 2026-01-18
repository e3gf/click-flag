import Game from "./classes/game.js";

document.addEventListener("DOMContentLoaded", () => {
    const settings = JSON.parse(localStorage.getItem("settings"));
    document.body.classList.toggle("dark", !settings?.lightMode);
    const game = new Game(document);
})