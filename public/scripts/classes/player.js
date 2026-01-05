export default class Player {
    constructor(savedData = null){
        this.whiteFlagCount = savedData ? savedData.whiteFlagCount : 0;
        this.capturePower = savedData ? savedData.capturePower : 1;
        this.capturePowerMultiplier = savedData ? savedData.capturePowerMultiplier : 1;
        this.capturePowerAddition = savedData ? savedData.capturePowerAddition : 0;
        this.overclockBoost = savedData ? savedData.overclockBoost : 4;

        this.components = savedData ? savedData.components : {
            RAM: {
                owned: 1,
                level: 0,
                bytes: 1,
                consumption: 5e-10,
            },
            CPU: {
                owned: 1,
                level: 0,
                frequency: 0.25,
                consumption: 5e-10,
            }
        };
    }

    captureWhiteFlag(){
        this.whiteFlagCount += (this.capturePower + this.capturePowerAddition) * this.capturePowerMultiplier;
    }
}