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
    }

    createSmartElement(name, id){
        const element = this.document.querySelector(`#${id}`);
        if(element === undefined){
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

    render(game){
        const player = game.player;
        const timerManager = game.timerManager;
        const whiteFlag = game.whiteFlag;
        const wheel = game.wheel;

        this.elements.whiteFlagCount.text(player.whiteFlagCount);

        const captureRatio = whiteFlag.getCaptureRatio(timerManager);
        this.elements.captureProgress.style("width", `${captureRatio * 100}%`);

        const overclockRatio = whiteFlag.getOverclockRatio(timerManager);
        const overclockState = whiteFlag.getOverclockState();
        this.elements.overclockCooldownProgress.style("width", `${overclockRatio * 100}%`);
        this.elements.overclockCooldownProgress.style("backgroundColor", 
            overclockState === "descending" ? "red" : "green");

        this.elements.energyCount.text(player.energyCount);
        this.elements.energyTabEnergyCount.text(player.energyCount);
        if(whiteFlag.outOfEnergyIndicator){
            this.elements.energyCount.style("color", "red");
            this.elements.energyTabEnergyCount.style("color", "red");
        }
        else {
            this.elements.energyCount.style("color", "var(--foreground)");
            this.elements.energyTabEnergyCount.style("color", "var(--foreground)");
        }

        const wheelSpinRatio = wheel.getSpinRatio(timerManager);
        this.elements.wheel.style("rotate", `${wheelSpinRatio * 360}deg`);
    }
}