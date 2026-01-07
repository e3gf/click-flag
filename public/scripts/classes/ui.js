export default class UI {
    constructor(document) {
        this.document = document;

        this.whiteFlag = this.document.querySelector("#white-flag-image");
        this.whiteFlagCount = this.document.querySelector("#white-flag-count-display");
        this.overclockBtn = this.document.querySelector("#overclock-btn");
        this.overclockCooldownProgress = this.document.querySelector("#overclock-cooldown-progress");
        this.captureProgress = this.document.querySelector("#capture-progress");

        this.energyCount = this.document.querySelector("#energy-count-display");
        this.energyTabEnergyCount = this.document.querySelector("#energy-tab-energy-count-display");
        this.wheel = this.document.querySelector("#wheel");

    }

    addDynamicListener(elementName, event, callback){
        if(this[elementName]) this[elementName].addEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }

    removeDynamicListener(elementName, event, callback){
        if(this[elementName]) this[elementName].removeEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }

    render(game){
        this.whiteFlagCount.textContent = game.player.whiteFlagCount;

        const captureRatio = game.whiteFlag.getCaptureRatio(game.timerManager);
        this.captureProgress.style.width = `${captureRatio * 100}%`;

        const overclockRatio = game.whiteFlag.getOverclockRatio(game.timerManager);
        const overclockState = game.whiteFlag.getOverclockState();
        this.overclockCooldownProgress.style.width = `${overclockRatio * 100}%`;
        this.overclockCooldownProgress.style.backgroundColor = 
            overclockState === "descending" ? "red" : "green";

        this.energyCount.textContent = game.player.energyCount;
        this.energyTabEnergyCount.textContent = game.player.energyCount;
        if(game.whiteFlag.outOfEnergyIndicator){
            this.energyCount.style.color = "red";
            this.energyTabEnergyCount.style.color = "red";
        }
        else {
            this.energyCount.style.color = "var(--foreground)";
            this.energyTabEnergyCount.style.color = "var(--foreground)";
        }

        const wheelSpinRatio = game.wheel.getSpinRatio(game.timerManager);
        this.wheel.style.rotate = `${wheelSpinRatio * 360}deg`;
    }
}