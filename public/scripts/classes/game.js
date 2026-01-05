import UI from "./ui.js";
import Player from "./player.js";
import Timer from "./timer.js";
import WhiteFlag from "./flags.js";

export default class Game {
    constructor(document){ 
        this.uiManager = new UI(document);
        this.player = new Player();
        this.timerManager = new Timer();
        this.whiteFlag = new WhiteFlag();

        this.uiManager.addDynamicListener("whiteFlag", "click", () => { 
            this.whiteFlag.capture(this.player, this.timerManager); 
            this.uiManager.updateWhiteFlagCount(this.player.whiteFlagCount);
        });

        this.uiManager.addDynamicListener("overclockBtn", "click", () => {
            this.whiteFlag.overclock(this.player, this.timerManager, this.uiManager);
        })
    }
}