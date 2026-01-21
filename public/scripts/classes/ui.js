import { formatNumber, toSeconds } from "../utils/formatting.js";
import SmartElement from "./smartElement.js";


export default class UI {
    constructor(document) {
        this.document = document;

        this.elements = {}
        this.#bindElements();
    }

    #bindElements(){
        this.createSmartElement("body", "body");

        this.createSmartElement("whiteFlag", "white-flag-image");
        this.createSmartElement("whiteFlagCount", "white-flag-count-display");
        this.createSmartElement("overclockBtn", "overclock-btn");
        this.createSmartElement("overclockCooldownProgress", "overclock-cooldown-progress");
        this.createSmartElement("captureProgress", "capture-progress");

        this.createSmartElement("energyCount", "energy-count-display");
        this.createSmartElement("energyTabEnergyCount", "energy-tab-energy-count-display");
        this.createSmartElement("energyGeneration", "energy-info-generation");
        this.createSmartElement("energyConsumption", "energy-info-consumption");
        this.createSmartElement("energyCCPConsumption", "energy-info-ccp-consumption");
        this.createSmartElement("wheel", "wheel");

        this.createSmartElement("componentUpgradeTab", "component-upgrades-tab");
        this.createSmartElement("energyUpgradeTab", "energy-upgrades-tab");
        this.createSmartElement("automationUpgradeTab", "automation-upgrades-tab");
        this.createSmartElement("generalUpgradeTab", "general-upgrades-tab");

        this.createSmartElement("systemInfoCP", "system-info-cp");
        this.createSmartElement("systemInfoCCPS", "system-info-ccps");
        this.createSmartElement("systemInfoUCPS", "system-info-ucps");
        this.createSmartElement("systemInfoOCDuration", "system-info-oc-duration");
        this.createSmartElement("systemInfoOCCooldown", "system-info-oc-cooldown");
    }

    createSmartElement(name, id){
        const element = this.document.querySelector(`#${id}`);
        if(!element){
            console.error(`Element with id ${id} does not exist.`);
            return;
        }
        this.elements[name] = new SmartElement(element);
    }

    addDynamicListener(elementName, event, callback){
        if(this.elements[elementName]) this.elements[elementName].addEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }

    removeDynamicListener(elementName, event, callback){
        if(this.elements[elementName]) this.elements[elementName].removeEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }

    querySelectorAll(query){
        return this.document.querySelectorAll(query);
    }

    querySelector(query){
        return this.document.querySelector(query);
    }

    render(game){
        const player = game.player;
        const timerManager = game.timerManager;
        const whiteFlag = game.whiteFlag;
        const wheel = game.wheel;

        this.elements.whiteFlagCount.text(formatNumber(player.whiteFlagCount));

        const captureRatio = whiteFlag.getCaptureRatio(timerManager);
        if(player.captureFrequency * (player.overclockBoost * whiteFlag.overclockActive ?? 0)   < player.captureFrequencyThreshold) this.elements.captureProgress.style("width", `${captureRatio * 100}%`);
        else this.elements.captureProgress.style("width", `100%`);

        const overclockRatio = whiteFlag.getOverclockRatio(timerManager);
        const overclockState = whiteFlag.getOverclockState();
        this.elements.overclockCooldownProgress.style("width", `${overclockRatio * 100}%`);
        this.elements.overclockCooldownProgress.toggle("cooldown-progress-descending", overclockState === "descending");

        this.elements.energyCount.text(formatNumber(player.energyCount));
        this.elements.energyTabEnergyCount.text(formatNumber(player.energyCount));
        this.elements.energyCount.toggle("insufficient-currency", whiteFlag.outOfEnergyIndicator);
        this.elements.energyTabEnergyCount.toggle("insufficient-currency", whiteFlag.outOfEnergyIndicator);
        this.elements.energyGeneration.text(`${formatNumber(player.energyGeneration)}/s`);
        if(player.energyGeneration > player.captureConsumption + player.energyConsumption){
            this.elements.energyGeneration.style("color", "var(--success-color)");
            this.elements.energyConsumption.style("color", "var(--foreground)")
            this.elements.energyCCPConsumption.style("color", "var(--foreground)")
        }
        else if(player.energyGeneration < player.captureConsumption + player.energyConsumption){
            this.elements.energyGeneration.style("color", "var(--foreground)")
            this.elements.energyConsumption.style("color", "var(--error)");
            this.elements.energyCCPConsumption.style("color", "var(--error)");
        }
        this.elements.energyConsumption.text(`${formatNumber(player.energyConsumption)}/s`);
        this.elements.energyCCPConsumption.text(`${formatNumber(player.captureConsumption * player.getFreqValueMultiplier() / (1 / Math.min(player.captureFrequencyThreshold, player.captureFrequency * (whiteFlag.overclockActive ? player.overclockBoost : 1))))}/s`); // Finish
        
        const wheelSpinRatio = wheel.getSpinRatio(timerManager);
        this.elements.wheel.style("rotate", `${wheelSpinRatio * 360}deg`);

        this.elements.systemInfoCP.toggle(`overclocked-info-indicator`, whiteFlag.overclockActive);
        this.elements.systemInfoCP.text(`CP: ${formatNumber(player.getCapturePower())}`);
        this.elements.systemInfoCCPS.toggle(`overclocked-info-indicator`, whiteFlag.overclockActive);
        this.elements.systemInfoCCPS.text(`CCP: ${formatNumber(player.getCapturePower() / (1 / Math.min(player.captureFrequencyThreshold, player.captureFrequency * (whiteFlag.overclockActive ? player.overclockBoost : 1))))}/s`);
        this.elements.systemInfoUCPS.text(`UCP: ${formatNumber(player.automationGeneration)}/s`);
        this.elements.systemInfoOCDuration.text(`OC Duration: ${toSeconds(player.overclockDuration)}`);
        this.elements.systemInfoOCCooldown.text(`OC Cooldown: ${toSeconds(player.overclockCooldown)}`);

        this.#renderUpgrades(game);
    }

    #renderUpgrades(game){
        const upgradeManager = game.upgradeManager;
        Object.values(upgradeManager.list).forEach(element => {
            element.view.render(game.player);
        });
    }
}