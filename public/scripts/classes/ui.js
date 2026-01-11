import SmartElement from "./smartElement.js";


export default class UI {
    constructor(document) {
        this.document = document;

        this.elements = {}
        this.bindElements();
    }

    bindElements(){
        this.createSmartElement("whiteFlag", "white-flag-image");
        this.createSmartElement("whiteFlagCount", "white-flag-count-display");
        this.createSmartElement("overclockBtn", "overclock-btn");
        this.createSmartElement("overclockCooldownProgress", "overclock-cooldown-progress");
        this.createSmartElement("captureProgress", "capture-progress");

        this.createSmartElement("energyCount", "energy-count-display");
        this.createSmartElement("energyTabEnergyCount", "energy-tab-energy-count-display");
        this.createSmartElement("wheel", "wheel");

        this.createSmartElement("componentUpgradeTab", "component-upgrades-tab");

        this.createSmartElement("systemInfoCP", "system-info-cp");
        this.createSmartElement("systemInfoCCPS", "system-info-ccps");
        this.createSmartElement("systemInfoUCPS", "system-info-ucps");
        this.createSmartElement("systemInfoRAM", "system-info-ram");
        this.createSmartElement("systemInfoCPU", "system-info-cpu");
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
        const upgradeManager = game.upgradeManager;

        this.elements.whiteFlagCount.text(player.whiteFlagCount);

        const captureRatio = whiteFlag.getCaptureRatio(timerManager);
        this.elements.captureProgress.style("width", `${captureRatio * 100}%`);

        const overclockRatio = whiteFlag.getOverclockRatio(timerManager);
        const overclockState = whiteFlag.getOverclockState();
        this.elements.overclockCooldownProgress.style("width", `${overclockRatio * 100}%`);
        this.elements.overclockCooldownProgress.toggle("cooldown-progress-descending", overclockState === "descending");

        this.elements.energyCount.text(player.energyCount);
        this.elements.energyTabEnergyCount.text(player.energyCount);
        this.elements.energyCount.toggle("insufficient-currency", whiteFlag.outOfEnergyIndicator);
        this.elements.energyTabEnergyCount.toggle("insufficient-currency", whiteFlag.outOfEnergyIndicator);

        const wheelSpinRatio = wheel.getSpinRatio(timerManager);
        this.elements.wheel.style("rotate", `${wheelSpinRatio * 360}deg`);

        this.elements.systemInfoCP.text(`CP: ${player.capturePower}`);
        this.elements.systemInfoRAM.text(`RAM: ${upgradeManager.list["RAM"].upgrade.boosts["Bytes"]}`);
        this.elements.systemInfoCPU.text(`CPU : ${upgradeManager.list["CPU"].upgrade.boosts["Frequency"]}`);
        this.elements.systemInfoOCDuration.text(`OC Duration: ${player.overclockDuration}`);
        this.elements.systemInfoOCCooldown.text(`OC Cooldown: ${player.overclockCooldown}`);

        this.renderUpdates(game);
    }

    renderUpdates(game){
        const upgradeManager = game.upgradeManager;
        Object.values(upgradeManager.list).forEach(element => {
            element.view.render(game.player);
        });
    }
}