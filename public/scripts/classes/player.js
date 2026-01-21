import roundTo from "../utils/roundTo.js";

export default class Player {
    constructor(game, savedData = null){
        this.game = game;
        this.whiteFlagCount = savedData ? savedData.whiteFlagCount : 1e20;
        this.energyCount = savedData ? savedData.energyCount : 0;
        this.capturePower = savedData ? savedData.capturePower : 1;
        this.captureFrequency = savedData ? savedData.captureFrequency : 0.2;
        this.captureFrequencyThreshold = 10;
        this.captureConsumption = savedData ? savedData.captureConsumption : 1;
        this.capturePowerMultiplier = savedData ? savedData.capturePowerMultiplier : 1;
        this.capturePowerAddition = savedData ? savedData.capturePowerAddition : 0;

        this.overclockCooldown = savedData ? savedData.overclockCooldown : 60000;
        this.overclockDuration = savedData ? savedData.overclockDuration : 5000;
        this.overclockBoost = savedData ? savedData.overclockBoost : 4;

        this.energyConsumption = 0;
        this.energyGeneration = 0;

        this.automationGeneration = 0;
    }   

    captureWhiteFlag(){
        this.whiteFlagCount += this.getCapturePower();
        this.energyCount -= this.captureConsumption * this.getFreqValueMultiplier();
    }

    getCapturePower(){
        return (this.capturePower + this.capturePowerAddition) * this.capturePowerMultiplier * this.getFreqValueMultiplier();
    }

    getFreqValueMultiplier(){
        return Math.max(1, this.captureFrequency * (this.game.whiteFlag.overclockActive ? this.overclockBoost : 1) / this.captureFrequencyThreshold);
    }

    spinWheel(){
        this.energyCount += 1;
    }
}