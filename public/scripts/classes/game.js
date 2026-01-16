import UI from "./ui.js";
import Player from "./player.js";
import TimerManager from "./timer.js";
import WhiteFlag from "./flags.js";
import Wheel from "./wheel.js";
import UpgradeManager, { UpgradeScheduler } from "./upgrades.js";

export default class Game {
    constructor(document){ 
        this.player = new Player(this);
        this.timerManager = new TimerManager();
        this.whiteFlag = new WhiteFlag();
        this.wheel = new Wheel();

        this.uiManager = new UI(document);
        this.upgradeManager = new UpgradeManager(this, this.uiManager);
        this.upgradeScheduler = new UpgradeScheduler(this);
        
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.uiUpdateAccumulator = 0;
        this.uiUpdateInterval = 1000 / 30; // ~ 30 fps

        this.energyConsumers = [];

        this.flagHeld = false;

        this.#bindInputs();
        this.#createUpgrades();

    }

    #bindInputs(){
        this.startHoldEvent = () => {
            this.flagHeld = true;
        }

        this.endHoldEvent = () => {
            this.flagHeld = false
            this.whiteFlag.outOfEnergyIndicator = false;
        }

        this.overclockEvent = () => {
            this.whiteFlag.overclock(this);
        };

        this.spinWheelEvent = () => {
            this.wheel.spinWheel(this);
        };


        this.uiManager.addDynamicListener("whiteFlag", "mousedown", this.startHoldEvent);
        this.uiManager.addDynamicListener("body", "mouseup", this.endHoldEvent);
        this.uiManager.addDynamicListener("overclockBtn", "click", this.overclockEvent);

        this.uiManager.addDynamicListener("wheel", "click", this.spinWheelEvent);
    }

    #createUpgrades(){
        this.upgradeManager.add("RAM");
        this.upgradeManager.add("CPU");
        this.upgradeManager.add("CoolingFan");
        this.upgradeManager.add("ThermalPaste");

        this.upgradeManager.add("NanoTurbine");
        this.upgradeManager.add("MicroTurbine");
        this.upgradeManager.add("MiniTurbine");

        this.upgradeManager.add("Grandpas");
        this.upgradeManager.add("SixYearOlds");
        this.upgradeManager.add("Teenagers");
        this.upgradeManager.add("ScriptKiddies");
        this.upgradeManager.add("JuniorProgrammers");
        this.upgradeManager.add("JuniorHackers");
        this.upgradeManager.add("SeniorProgrammers");
        this.upgradeManager.add("SeniorHackers");
        this.upgradeManager.add("AGI");
        this.upgradeManager.add("ElliotAlderson");

        // this.upgradeManager.add("Gen1");
    }

    loop(now){
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.events();
        this.update(delta);

        this.uiUpdateAccumulator += delta;
        if(this.uiUpdateAccumulator >= this.uiUpdateInterval){
            this.uiManager.render(this);
            this.uiUpdateAccumulator %= this.uiUpdateInterval;
        }

        requestAnimationFrame(this.loop);
    }

    events(){
        if(this.flagHeld) this.whiteFlag.capture(this);
    }

    update(delta){
        this.timerManager.update(delta);
        this.upgradeScheduler.update();
    }
}