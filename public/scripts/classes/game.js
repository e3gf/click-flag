import UI from "./ui.js";
import Player from "./player.js";
import Timer from "./timer.js";
import WhiteFlag from "./flags.js";

export default class Game {
    constructor(document){ 
        this.player = new Player();
        this.timerManager = new Timer();
        this.whiteFlag = new WhiteFlag();

        this.uiManager = new UI(document);
        
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.bindInputs();

    }

    bindInputs(){
        this.captureFlagEvent = () => {
            this.whiteFlag.capture(this);
        }

        this.overclockEvent = () => {
            this.whiteFlag.overclock(this);
        }


        this.uiManager.addDynamicListener("whiteFlag", "click", this.captureFlagEvent);
        this.uiManager.addDynamicListener("overclockBtn", "click", this.overclockEvent);
    }

    loop(now){
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.update(delta);
        this.uiManager.render(this);

        requestAnimationFrame(this.loop);
    }

    update(delta){
        this.timerManager.update(delta);
    }
}