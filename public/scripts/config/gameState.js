import Game from "../classes/game.js";

export let game;

export function createGame(settings){
    game = new Game(document, settings);
}

export let gameState = {};