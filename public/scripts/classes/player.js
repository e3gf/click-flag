import roundTo from "../utils/roundTo.js";

export default class Player {
    constructor(savedData = null){
        this.whiteFlagCount = savedData ? savedData.whiteFlagCount : 1e55;
        this.energyCount = savedData ? savedData.energyCount : 0;
        this.capturePower = savedData ? savedData.capturePower : 1;
        this.captureFrequency = savedData ? savedData.captureFrequency : 0.2;
        this.captureConsumption = savedData ? savedData.captureConsumption : 1;
        this.capturePowerMultiplier = savedData ? savedData.capturePowerMultiplier : 1;
        this.capturePowerAddition = savedData ? savedData.capturePowerAddition : 0;

        this.upgradeConsumption = savedData ? savedData.upgradeConsumption : 0;

        this.overclockCooldown = savedData ? savedData.overclockCooldown : 60000;
        this.overclockDuration = savedData ? savedData.overclockDuration : 5000;
        this.overclockBoost = savedData ? savedData.overclockBoost : 4;

        this.energyConsumption = 0;
        this.energyGeneration = 0;
    }   

    captureWhiteFlag(){
        this.whiteFlagCount += (this.capturePower + this.capturePowerAddition) * this.capturePowerMultiplier;
        this.energyCount -= this.captureConsumption;
        this.energyCount = roundTo(this.energyCount, 3);
    }

    spinWheel(){
        this.energyCount += 1;
        this.energyCount = roundTo(this.energyCount, 3);
    }
}