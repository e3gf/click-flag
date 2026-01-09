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
        this.upgradeManager = new UpgradeManager();

        this.uiManager = new UI(document);
        
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.uiUpdateAccumulator = 0;
        this.uiUpdateInterval = 1000 / 30; // ~ 30 fps

        this.bindInputs();
        this.createUpgrades();

    }

    bindInputs(){
        this.captureFlagEvent = () => {
            this.whiteFlag.capture(this);
        }

        this.overclockEvent = () => {
            this.whiteFlag.overclock(this);
        }

        this.spinWheelEvent = () => {
            this.wheel.spinWheel(this);
        }


        this.uiManager.addDynamicListener("whiteFlag", "click", this.captureFlagEvent);
        this.uiManager.addDynamicListener("overclockBtn", "click", this.overclockEvent);

        this.uiManager.addDynamicListener("wheel", "click", this.spinWheelEvent);
    }

    createUpgrades(){
        this.upgradeManager.add(this.uiManager, "L1Component", "RAM");
        this.upgradeManager.add(this.uiManager, "L1Component", "CPU");
        this.upgradeManager.add(this.uiManager, "L1Component", "GenericUpgrade1");
        this.upgradeManager.add(this.uiManager, "L1Component", "GenericUpgrade2");
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