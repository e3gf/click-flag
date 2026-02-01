import UI from "./ui.js";
import Player from "./player.js";
import TimerManager from "./timer.js";
import WhiteFlag from "./flags.js";
import Wheel from "./wheel.js";
import UpgradeManager, { UpgradeScheduler } from "./upgrades.js";
import { AudioManager } from "./audio.js";
import VisualEffectManager from "./visualEffect.js";
import { gameState } from "../config/gameState.js";

export default class Game {
    constructor(document, settings){ 
        this.document = document;
        this.player = new Player(this);
        this.timerManager = new TimerManager();
        this.whiteFlag = new WhiteFlag();
        this.wheel = new Wheel();

        this.uiManager = new UI(document);
        this.upgradeManager = new UpgradeManager(this, this.uiManager);
        this.upgradeScheduler = new UpgradeScheduler(this);
        this.visualEffectManager = new VisualEffectManager(this, settings?.effectsEnabled ?? true);

        this.audio = new AudioManager();
        
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

        this.uiUpdateAccumulator = 0;
        this.uiUpdateInterval = 1000 / 30; // ~ 30 fps

        this.energyConsumers = [];

        this.flagHeld = false;

        this.#bindInputs();
        this.#createUpgrades();

        // to initialize audio on first interaction
        window.addEventListener("pointerdown", () => {
            this.audio.init({ musicVolume: settings?.musicVolume ?? 50, sfxVolume: settings?.sfxVolume ?? 50 });
            this.audio.setMusicPlaylist([
                "Cyberpunk Threat 1",
                "Cyberpunk Fight 1",
                "Cyberpunk Fight 2",
                "SuperSpiffy",
                "Entanglement",
                "Danger Noodle",
                "Information Regime",
                "Triangles",
                "Smilin And Vibin",
            ]);
            this.loadAudio();
        }, { once: true });


    }

    async loadAudio(){
        // sfx
        await this.audio.loadSound("captureFlag", "/audio/sfx/captureFlag.mp3");
        await this.audio.loadSound("buyUpgrade", "/audio/sfx/buyUpgrade.mp3");
        await this.audio.loadSound("cooldownErrors", "/audio/sfx/cooldownErrors.mp3");
        await this.audio.loadSound("cooldownReady", "/audio/sfx/cooldownReady.mp3");
        await this.audio.loadSound("overclockStart", "/audio/sfx/overclockStart.mp3");
        await this.audio.loadSound("overclockEnd", "/audio/sfx/overclockEnd.mp3");
        await this.audio.loadSound("insufficientEnergy", "/audio/sfx/insufficientEnergy.mp3");
        await this.audio.loadSound("levelUpUpgrade", "/audio/sfx/levelUpUpgrade.mp3");
        await this.audio.loadSound("selectBuyAmount", "/audio/sfx/selectBuyAmount.mp3");
        await this.audio.loadSound("wheelSpin", "/audio/sfx/wheelSpin.mp3");

        // music
        await this.audio.loadSound("Cyberpunk Threat 1", "/audio/music/Muchkin-CyberpunkThreat1.mp3");
        await this.audio.loadSound("SuperSpiffy", "/audio/music/SuperSpiffy_DavidFesliyan.mp3");
        await this.audio.loadSound("Entanglement", "/audio/music/Muchkin-Entangelement.mp3");
        await this.audio.loadSound("Cyberpunk Fight 2", "/audio/music/Muchkin-CyberpunkFight2.mp3");
        await this.audio.loadSound("Cyberpunk Fight 1", "/audio/music/Muchkin-CyberpunkFight1.mp3");
        await this.audio.loadSound("Cyberpunk Ambient 1", "/audio/music/Muchkin-CyberpunkAmbient1.mp3");
        await this.audio.loadSound("Danger Noodle", "/audio/music/ElectricDrama-DangerNoodle.mp3");
        await this.audio.loadSound("Information Regime", "/audio/music/Drums_and_Bass-2025-01-14_-_Information_Regime_-_www.FesliyanStudios.com.mp3");
        await this.audio.loadSound("Triangles", "/audio/music/Deem-Triangles(master).mp3");
        await this.audio.loadSound("Smilin And Vibin", "/audio/music/2020-08-18_-_Smilin__And_Vibin__-_www.FesliyanStudios.com_David_Renda.mp3");
        
        // play first music
        this.audio.playRandomMusic();
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

        this.upgradeManager.add("HandCrankDynamo");
        this.upgradeManager.add("WindmillDynamo");
        this.upgradeManager.add("SolarPanelArray");
        this.upgradeManager.add("ThermalPlant");
        this.upgradeManager.add("FissionReactor");
        this.upgradeManager.add("FusionCore");
        this.upgradeManager.add("ZeroPointModule");
        this.upgradeManager.add("QuantumFluxGenerator");
        this.upgradeManager.add("DysonSphereSegment");
        this.upgradeManager.add("BigBangReplicator");

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
            this.visualEffectManager.update(delta);
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