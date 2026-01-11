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
        layer: 1,
        static: true,
        type: "component", // static or periodic
        baseCost: 10,
        costMultiplier: 1.2,
        start: { bought: 1, level: 1 },
        consumptionPerUnit: 0.5,

        boosts: {
            Bytes: {
                perUnit: 1,
                perLevelMultiplier: 2,
                apply(player, value) {
                    player.capturePower = value;
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
};

/* Template

    Name: {
        layer: 1,
        type: "static",
        baseCost: 50,
        costMultiplier: 1.3,
        start: { bought: 0, level: 1 },
        consumptionPerUnit: 0.5,

        boosts: {
            Boost: {
                perUnit: 0.15,
                perLevelMultiplier: 1.5,
                apply(player, value) {
                    player.boostVariable = value;
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