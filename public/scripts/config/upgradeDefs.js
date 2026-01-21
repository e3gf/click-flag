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

        consumptionPerUnit: 0.5,
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
                type: "normal",
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

        consumptionPerUnit: 0.5,
        consumptionPerLevelMulti: 2.1,
        consumptionFunction(bought, level){
            return this.consumptionPerUnit * bought * this.consumptionPerLevelMulti ** (level - 1); 
        },
        consumptionApply(player, value, prev){
            player.captureConsumption += value - prev;
        },

        boosts: {
            Frequency: {
                name: "Frequency",
                type: "normal",
                perUnit: 0.2,
                perLevelMultiplier: 1.5,
                apply(game, value) {
                    game.player.captureFrequency = value;
                    if(game.whiteFlag.captureTimer !== null) game.timerManager.editTimerDuration(game.whiteFlag.captureTimer, game.whiteFlag.getCaptureDelay(game.player));
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
        consumptionPerLevelMulti: 2.4,
        consumptionFunction(bought, level){
            return this.consumptionPerUnit * bought * this.consumptionPerLevelMulti ** (level - 1);
        },
        consumptionApply(player, value, prev){
            player.captureConsumption += value - prev;
        },

        boosts: {
            "OCCooldownDecrease": {
                name: "OC Cooldown Decrease",
                type: "temporal",
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
                type: "temporal",
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
                type: "temporal",
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
    },

    // Energy upgrades


    NanoTurbine: {
        title: "Nano turbine",
        layer: 1,
        static: false,
        type: "energy",
        baseCost: 20,
        costMultiplier: 1.15,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0,
        periodic: {
            perUnit: 0.5,
            perLevelMultiplier: 2.1,
            time: 1000,
            timePerLevelDecrease: 1.8,
            apply(game, value, times){
                game.player.energyCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 8, c: -12}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    MicroTurbine: {
        title: "Micro Turbine",
        layer: 1,
        static: false,
        type: "energy",
        baseCost: 500,
        costMultiplier: 1.2,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0,
        periodic: {
            perUnit: 5,
            perLevelMultiplier: 2.5,
            time: 2000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.energyCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 8, c: -12}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    MiniTurbine: {
        title: "Mini Turbine",
        layer: 1,
        static: false,
        type: "energy",
        baseCost: 7500,
        costMultiplier: 1.225,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0,
        periodic: {
            perUnit: 50,
            perLevelMultiplier: 3,
            time: 4000,
            timePerLevelDecrease: 2.5,
            apply(game, value, times){
                game.player.energyCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 8, c: -12}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

        GasGenerator: {
        title: "Gas generator",
        layer: 1,
        static: false,
        type: "energy",
        baseCost: 7500,
        costMultiplier: 1.225,
        start: { bought: 0, level: 0 },

        consumptionPerUnit: 0,
        periodic: {
            perUnit: 50,
            perLevelMultiplier: 3,
            time: 4000,
            timePerLevelDecrease: 2.5,
            apply(game, value, times){
                game.player.energyCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 8, c: -12}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    // Automation upgrades

    Grandpas: {
        title: "Grandpas",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 50,
        costMultiplier: 1.2,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 1,

        consumptionPerUnit: 1,
        consumptionPolynomial: 1.4,
        consumptionPerLevelMulti: 1.5,
        consumptionFunction(bought, level){
            return (this.consumptionPerUnit * bought) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 1,
            perLevelMultiplier: 1.5,
            time: 4000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    SixYearOlds: {
        title: "6-Year olds",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 1000,
        costMultiplier: 1.24,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 2,

        consumptionPerUnit: 6,
        consumptionPolynomial: 1.45,
        consumptionPerLevelMulti: 1.55,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 8,
            perLevelMultiplier: 1.75,
            time: 10000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    Teenagers: {
        title: "Teenagers",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 15000,
        costMultiplier: 1.28,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 3,

        consumptionPerUnit: 10,
        consumptionPolynomial: 1.5,
        consumptionPerLevelMulti: 1.60,
        consumptionFunction(bought, level){
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 50,
            perLevelMultiplier: 2.1,
            time: 15000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    ScriptKiddies: {
        title: "Script kiddies",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 100000,
        costMultiplier: 1.32,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 4,

        consumptionPerUnit: 30,
        consumptionPolynomial: 1.55,
        consumptionPerLevelMulti: 1.65,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 250,
            perLevelMultiplier: 2.5,
            time: 25000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },
    
    JuniorProgrammers: {
        title: "Junior Programmers",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 1000000,
        costMultiplier: 1.36,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 5,

        consumptionPerUnit: 100,
        consumptionPolynomial: 1.6,
        consumptionPerLevelMulti: 1.70,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 1500,
            perLevelMultiplier: 3,
            time: 40000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    JuniorHackers: {
        title: "Junior Hackers",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 15000000,
        costMultiplier: 1.4,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 6,

        consumptionPerUnit: 400,
        consumptionPolynomial: 1.65,
        consumptionPerLevelMulti: 1.75,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 20000,
            perLevelMultiplier: 3.5,
            time: 60000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    SeniorProgrammers: {
        title: "Senior programmers",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 250000000,
        costMultiplier: 1.44,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 7,

        consumptionPerUnit: 1300,
        consumptionPolynomial: 1.7,
        consumptionPerLevelMulti: 1.8,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 150000,
            perLevelMultiplier: 4,
            time: 90000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    SeniorHackers: {
        title: "Senior Hackers",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 5000000000,
        costMultiplier: 1.48,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 8,

        consumptionPerUnit: 3600,
        consumptionPolynomial: 1.75,
        consumptionPerLevelMulti: 1.85,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 2500000,
            perLevelMultiplier: 4,
            time: 120000,
            timePerLevelDecrease: 2,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    AGI: {
        title: "AGI",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 1.5e11,
        costMultiplier: 1.52,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 9,

        consumptionPerUnit: 12000,
        consumptionPolynomial: 1.8,
        consumptionPerLevelMulti: 1.9,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 8e7,
            perLevelMultiplier: 4.5,
            time: 180000,
            timePerLevelDecrease: 2.5,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    ElliotAlderson: {
        title: "Elliot Alderson",
        layer: 1,
        static: false,
        type: "automation",
        baseCost: 9e12,
        costMultiplier: 1.56,
        start: { bought: 0, level: 0 },

        energyConsumer: true,
        priority: 10,

        consumptionPerUnit: 40000,
        consumptionPolynomial: 1.85,
        consumptionPerLevelMulti: 1.95,
        consumptionFunction(bought, level){
            console.log(bought);
            if(bought > 1) return (this.consumptionPerUnit * (bought - 1)) ** this.consumptionPolynomial * this.consumptionPerLevelMulti ** (level - 1);
            return this.consumptionPerUnit * this.consumptionPerLevelMulti ** (level - 1);
        },

        periodic: {
            perUnit: 1e9,
            perLevelMultiplier: 5.25,
            time: 240000,
            timePerLevelDecrease: 3,
            apply(game, value, times){
                game.player.whiteFlagCount += times * value;
            },
            valueFunction(bought, level){
                return bought * this.perUnit * this.perLevelMultiplier ** (level - 1);
            },
            timeFunction(level, threshold){
                return {
                    f: this.time / this.timePerLevelDecrease ** (level - 1),
                    s: Math.max(1, threshold / this.time * this.timePerLevelDecrease ** (level - 1))
                };
            }
        },
        levelFormula: { a: 2, c: 0}, 

        levelRequirement(n) {
            return levelRequirement(this.levelFormula, n);
        },

        getLevelBounds(a){
            return getLevelBounds(this.levelFormula, a);
        }
    },

    // general

    Gen1: {
        title: "General",
        desc: "Triple automation upgrade production!",
        layer: 1,
        static: true,
        type: "general",
        baseCost: 500,
        start: { bought: 0},

        energyConsumer: false,

        consumptionPerUnit: 0,

        apply(game){
            console.log("Successfully bought!");
        }
    },
};