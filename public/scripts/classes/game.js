import UI from "./ui.js";
import Player from "./player.js";
import TimerManager from "./timer.js";
import WhiteFlag from "./flags.js";
import Wheel from "./wheel.js";
import UpgradeManager from "./upgrades.js";

export default class Game {
    constructor(document){ 
        this.player = new Player();
        this.timerManager = new TimerManager();
        this.whiteFlag = new WhiteFlag();
        this.wheel = new Wheel();

        this.uiManager = new UI(document);
        this.upgradeManager = new UpgradeManager(this, this.uiManager);
        
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.uiUpdateAccumulator = 0;
        this.uiUpdateInterval = 1000 / 30; // ~ 30 fps

        this.#bindInputs();
        this.#createUpgrades();

    }

    #bindInputs(){
        this.captureFlagEvent = () => {
            this.whiteFlag.capture(this);
        };

        this.overclockEvent = () => {
            this.whiteFlag.overclock(this);
        };

        this.spinWheelEvent = () => {
            this.wheel.spinWheel(this);
        };


        this.uiManager.addDynamicListener("whiteFlag", "click", this.captureFlagEvent);
        this.uiManager.addDynamicListener("overclockBtn", "click", this.overclockEvent);

        this.uiManager.addDynamicListener("wheel", "click", this.spinWheelEvent);
    }

    #createUpgrades(){
        this.upgradeManager.add("RAM");
        this.upgradeManager.add("CPU");
        this.upgradeManager.add("CoolingFan");
        this.upgradeManager.add("ThermalPaste");
    }

    loop(now){
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.update(delta);

        this.uiUpdateAccumulator += delta;
        if(this.uiUpdateAccumulator >= this.uiUpdateInterval){
            this.uiManager.render(this);
            this.uiUpdateAccumulator %= this.uiUpdateInterval;
        }

        requestAnimationFrame(this.loop);
    }

    update(delta){
        this.timerManager.update(delta);
    }
}