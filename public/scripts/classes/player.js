import { formatNumber } from "../utils/formatting.js";
import roundTo from "../utils/roundTo.js";
import { FloatingTextEffect } from "./visualEffect.js";

export default class Player {
    constructor(game, savedData = null){
        this.game = game;
        this.whiteFlagCount = savedData ? savedData.whiteFlagCount : 50;
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
        this.game.visualEffectManager.add(
            new FloatingTextEffect(this.game,
                {
                    text: `+${formatNumber(this.getCapturePower())}`,
                    ...this.game.uiManager.getElementCenter("whiteFlag"),
                    speed: 60,
                    type: "flag",
                    spread: 2 * Math.PI
                }
            )
        );
        this.energyCount -= this.getCaptureConsumption();
    }

    getCapturePower(){
        return (this.capturePower + this.capturePowerAddition) * this.capturePowerMultiplier * this.getFreqValueMultiplier();
    }

    getCaptureConsumption(){
        return this.captureConsumption * this.getFreqValueMultiplier();
    }

    getFreqValueMultiplier(){
        return Math.max(1, this.captureFrequency * (this.game.whiteFlag.overclockActive ? this.overclockBoost : 1) / this.captureFrequencyThreshold);
    }

    spinWheel(){
        this.energyCount += 1;
        this.game.visualEffectManager.add(
            new FloatingTextEffect(this.game,
                {
                    text: "+1",
                    spread: 2 * Math.PI,
                    ...this.game.uiManager.getElementCenter("wheel"),
                    type: "energy",
                    speed: 60,
                }
            )
        );
    }
}