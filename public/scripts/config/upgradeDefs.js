import { geometricSeriesSum } from "../utils/formulae.js";

const levelRequirement = (levelFormula, n) => {
    if(n < 2) return n; // n will never be negative
    return n === 2 ? levelFormula.a : levelFormula.a * (n-1) ** 2 + levelFormula.c;
}

const getLevelBounds = (levelFormula, a) => {
    if(a === 0) return {
        levelBelow: 0,
        levelBelowRequirement: levelRequirement(levelFormula, 0),
        levelAbove: 1,
        levelAboveRequirement: levelRequirement(levelFormula, 1)
    }
    if(a < levelFormula.a) return {
        levelBelow: 1,
        levelBelowRequirement: levelRequirement(levelFormula, 1),
        levelAbove: 2,
        levelAboveRequirement: levelRequirement(levelFormula, 2)
    };
    if(a < -levelFormula.c) return { 
        levelBelow: 2, 
        levelBelowRequirement: levelRequirement(levelFormula, 2),
        levelAbove: 3,
        levelAboveRequirement: levelRequirement(levelFormula, 3)
    };
    const r = Math.sqrt((a - levelFormula.c) / levelFormula.a);
    let lB = Math.floor(r) + 1, lA = Math.ceil(r) + 1;
    lA += lB === lA;
    return { 
        levelBelow: lB,
        levelBelowRequirement: levelRequirement(levelFormula, lB),
        levelAbove: lA,
        levelAboveRequirement: levelRequirement(levelFormula, lA)
    };
}

export const UPGRADE_DEFS = {
    // LAYER 1

    // Component upgrades
    RAM: {
        title: "RAM",
        layer: 1,
        static: true, // false = periodic
        type: "component", 
        baseCost: 10,
        costMultiplier: 1.2,
        start: { bought: 1, level: 1 },

        consumptionPerUnit: 0.25,
        consumptionPerLevelMulti: 1.8,
        consumptionFunction(bought, level){
            return this.consumptionPerUnit * bought * this.consumptionPerLevelMulti ** (level - 1);
        },
        consumptionApply(player, value, prev){
            player.captureConsumption += value - prev;
        },

        boosts: {
            Bytes: {
                name: "Bytes",
                perUnit: 1,
                perLevelMultiplier: 2,
                apply(game, value) {
                    game.player.capturePower = value;
                },
                valueFunction(bought, level){
                    return this.perUnit * bought * this.perLevelMultiplier ** (level - 1); 
                }
            }
        },

        levelFormula: { a: 4, c: -6}, // quadratic without b term (a^2 + c)

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    CPU: {
        title: "CPU",
        layer: 1,
        static: true,
        type: "component",
        baseCost: 50,
        costMultiplier: 1.3,
        start: { bought: 1, level: 1 },

        consumptionPerUnit: 0.75,
        consumptionPerLevelMulti: 1.3,
        consumptionFunction(bought, level){
            return this.consumptionPerUnit * bought * this.consumptionPerLevelMulti ** (level - 1); 
        },
        consumptionApply(player, value, prev){
            player.captureConsumption += value - prev;
        },

        boosts: {
            Frequency: {
                name: "Frequency",
                perUnit: 0.2,
                perLevelMultiplier: 1.5,
                apply(game, value) {
                    game.player.captureFrequency = value;
                },
                valueFunction(bought, level){
                    return this.perUnit * bought * this.perLevelMultiplier ** (level - 1); 
                }
            }
        },

        levelFormula: { a: 4, c: -6}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    CoolingFan: {
        title: "Cooling Fan",
        layer: 1,
        static: true,
        type: "component",
        baseCost: 500,
        costMultiplier: 1.35,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0.5,
        consumptionPerLevelMulti: 1.2,
        consumptionFunction(bought, level){
            return this.consumptionPerUnit * bought * this.consumptionPerLevelMulti ** (level - 1);
        },
        consumptionApply(player, value, prev){
            player.captureConsumption += value - prev;
        },

        boosts: {
            "OCCooldownDecrease": {
                name: "OC Cooldown Decrease",
                startBoost: 4000,
                commonRatio: 0.8,
                perLevelAddition : 0.002,
                apply(game, value, prev) {
                    game.player.overclockCooldown += -value + (prev ?? 0);
                    if(game.whiteFlag.overclockCooldownTimer !== null) game.timerManager.editTimerDuration(game.whiteFlag.overclockCooldownTimer, game.player.overclockCooldown);
                },
                valueFunction(bought, level) {
                    return geometricSeriesSum(this.startBoost, this.commonRatio + level * this.perLevelAddition, bought) 
                }
            }
        },

        levelFormula: { a: 4, c: -6}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    ThermalPaste: {
        title: "Thermal Paste",
        layer: 1,
        static: true,
        type: "component",
        baseCost: 10000,
        costMultiplier: 1.4,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0,

        boosts: {
            "OCCooldownDecrease": {
                name: "OC Cooldown Decrease",
                startBoost: 3000,
                commonRatio: 0.84,
                perLevelAddition : 0.002,
                apply(game, value, prev) {
                    game.player.overclockCooldown += -value + (prev ?? 0);
                    if(game.whiteFlag.overclockCooldownTimer !== null) game.timerManager.editTimerDuration(game.whiteFlag.overclockCooldownTimer, game.player.overclockCooldown);
                },
                valueFunction(bought, level) {
                    return geometricSeriesSum(this.startBoost, this.commonRatio + level * this.perLevelAddition, bought) 
                }
            },

            "OCDurationIncrease": {
                name: "OC Duration Increase",
                startBoost: 1000,
                commonRatio: 0.98,
                perLevelAddition : 0.0002,
                apply(game, value, prev) {
                    game.player.overclockDuration += value - (prev ?? 0);
                    if(game.whiteFlag.overclockActiveTimer !== null) game.timerManager.editTimerDuration(game.whiteFlag.overclockActiveTimer, game.player.overclockDuration);
                },
                valueFunction(bought, level) {
                    return geometricSeriesSum(this.startBoost, this.commonRatio + level * this.perLevelAddition, bought) 
                }
            }
        },

        levelFormula: { a: 4, c: -6}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    }

    // Energy upgrades

    

};

/* Template
    // yank 29 lines 
    CPU: {
        title: "CPU",
        layer: 1,
        static: true,
        type: "component",
        baseCost: 50,
        costMultiplier: 1.3,
        start: { bought: 1, level: 1 },
        consumptionPerUnit: 0.5,

        boosts: {
            Frequency: {
                perUnit: 0.2,
                perLevelMultiplier: 1.5,
                apply(player, value) {
                    player.captureFrequency = value;
                }
            }
        },

        levelFormula: { a: 4, c: -6}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    }

*/