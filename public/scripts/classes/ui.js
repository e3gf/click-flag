export default class UI {
    constructor(document) {
        this.document = document;
        this.whiteFlag = this.document.querySelector("#white-flag-image");
        this.whiteFlagCount = this.document.querySelector("#white-flag-count");
        this.overclockBtn = this.document.querySelector("#overclock-btn");
        this.overclockCooldownBar = this.document.querySelector("#overclock-cooldown-bar");
        this.overclockCooldownProgress = this.document.querySelector("#overclock-cooldown-progress");

        // Static event listeners should be here
    }

    // Methods for listeners

    addDynamicListener(elementName, event, callback){
        if(this[elementName]) this[elementName].addEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }

    removeDynamicListener(elementName, event, callback){
        if(this[elementName]) this[elementName].removeEventListener(event, callback);
        else console.error(`Element ${elementName} not found.`);
    }



    // Element specific methods

    updateWhiteFlagCount(amount){
        this.whiteFlagCount.textContent = amount;
    }

    updateOverclockCooldownBar(ratio, state){
        this.overclockCooldownProgress.style.width = `${ratio * 100}%`;
        if(state === "ascending"){
            this.overclockCooldownProgress.style.backgroundColor = "green";
        }
        else {
            this.overclockCooldownProgress.style.backgroundColor = "red";
        }
    }
}