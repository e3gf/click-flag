import Game from "./classes/game.js";

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game(document);
    document.body.classList.add("dark");
})