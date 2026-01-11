import { UPGRADE_DEFS } from "../config/upgradeDefs.js";
import { geometricSeriesSum } from "../utils/formulae.js";
import roundTo from "../utils/roundTo.js";

export default class UpgradeManager {
    #game;
    #ui;

    constructor(game, ui) {
        this.#game = game;
        this.#ui = ui;
        this.list = {};
    }

    add(name) {
        if (this.list[name]) return;

        const def = UPGRADE_DEFS[name];
        if (!def) throw new Error(`Unknown upgrade: ${name}`);

        const upgrade = new Upgrade(this.#game, name, def);
        const view = new UpgradeView(this.#ui, upgrade);

        this.list[name] = { upgrade, view };
    }
}


class Upgrade {
    constructor(game, name, def) {
        this.game = game;
        this.player = game.player;
        this.name = name;
        this.def = def;
        this.title = def.title;

        this.layer = def.layer;
        this.type = def.type;
        this.static = def.static; // "static" or "periodic" 

        this.cost = def.baseCost;
        this.costMultiplier = def.costMultiplier;

        this.bought = def.start.bought;
        this.level = def.start.level;

        this.lastLevelRequirement = def.levelRequirement(this.level);
        this.nextLevelRequirement = def.levelRequirement(this.level + 1);

        this.selected = "1";
        this.selectedAmount = 1;
        this.selectedCost = this.cost;

        this.boosts = {};
        this.consumption = this.bought * def.consumptionPerUnit;

        this.recalculate();
    }

    buy() { 
        if (this.player.whiteFlagCount < this.selectedCost) return;

        this.player.whiteFlagCount -= this.selectedCost;
        this.bought += this.selectedAmount;

        this.cost *= this.costMultiplier ** this.selectedAmount;

        if (this.bought >= this.nextLevelRequirement) {
            this.levelUp();
        }

        this.recalculate();
    }

    recalculate() {
        for (const [key, boost] of Object.entries(this.def.boosts)) {
            const value = boost.valueFunction(this.bought, this.level);
            const prevValue = this.boosts[key];
            this.boosts[key] = value;
            boost.apply(this.game, value, prevValue);
        }

        if (this.def.consumptionPerUnit) {
            const prev = this.consumption;
            this.consumption = this.def.consumptionFunction(this.bought, this.level);
            this.def.consumptionApply(this.player, this.consumption, prev);
        }

        if(this.selected === "max") this.select(this.getMaxAffordable());
        else if(this.selected === "next") this.select(this.nextLevelRequirement - this.bought);
        this.selectedCost = this.calculateCost(this.selectedAmount);
    }

    levelUp() { 
        const bounds = this.def.getLevelBounds(this.bought);
        this.level = bounds.levelBelow;
        this.lastLevelRequirement = bounds.levelBelowRequirement;
        this.nextLevelRequirement = bounds.levelAboveRequirement;
    }

    calculateCost(amount) {
        return Math.floor(geometricSeriesSum(this.cost, this.costMultiplier, amount));
    }

    getMaxAffordable() {
        return Math.max(
            Math.floor(
                Math.log(
                    -this.player.whiteFlagCount / this.cost *
                    (1 - this.costMultiplier) +
                    1
                ) / Math.log(this.costMultiplier)
            ),
            1
        );
    }

    handleSelect(v){
        switch (v) {
            case "1": {
                this.select(1);
                this.selected = "1";
            }; break;
            case "10": {
                this.select(10);
                this.selected = "10";
            }; break;
            case "100": {
                this.select(100);
                this.selected = "100";
            }; break;
            case "max": {
                this.select(this.getMaxAffordable());
                this.selected = "max";
            }; break;
            case "next": {
                this.select(this.nextLevelRequirement - this.bought);
                this.selected = "next";
            }; break;
        }
    }

    select(amount) {
        this.selectedAmount = amount;
        this.selectedCost = this.calculateCost(amount);
    }

}

class UpgradeView {
    constructor(ui, upgrade) {
        this.ui = ui;
        this.upgrade = upgrade;
        this.build();
    }

    build() {
        const u = this.upgrade;
        const boostNames = Object.keys(u.def.boosts).map((key) => key.replaceAll(" ", ""));
        const boostValues = Object.values(u.boosts);

        this.elementIds = {
            upgradeInformationLevel: `${u.name}-upgrade-information-level`,
            upgradeInformationBoostValues: boostNames.map(key => {
                return `${u.name}-upgrade-information-${key}`;
            }),
            upgradeInformationConsumption: `${u.name}-upgrade-information-consumption`,

            upgradeBuyAmount:  `${u.name}-upgrade-buy-amount`,
            upgradeBuyCost: `${u.name}-upgrade-buy-cost`,
            upgradeLevelIndicator: `${u.name}-upgrade-level-indicator`,
            upgradeInfoButton: `${u.name}-upgrade-info-button`,

            buyButtonId: `${u.name}-upgrade-buy-button`,
            upgradeButtons: `${u.name}-upgrade-buttons`,
            upgradeQuantityInput: `${u.name}-upgrade-quantity-input`,
        }

        this.radioGroupName = `${u.name}radioGroup`;

        const tab = this.pickTab(u);
        tab.add(`
            <div class="${u.type}-upgrade upgrade">
                <h3 class="${u.type}-upgrade-title upgrade-title">${u.title}</h3>
                <div class="${u.type}-upgrade-information upgrade-information">
                    <p class="${u.type}-upgrade-information-p upgrade-information-p text" id="${this.elementIds.upgradeInformationLevel}">Level: ${u.level} (${u.bought} / ${u.nextLevelRequirement})</p>
                    ${this.elementIds.upgradeInformationBoostValues.map((key, i) => {
                        return `<p class="${u.type}-upgrade-information-p upgrade-information-p text">${Object.values(u.def.boosts)[i].name}: <span id="${key}">${boostValues[i]}</span></p>`
                    }).join("")}
                    ${u.def.consumptionPerUnit ? `<p class="${u.type}-upgrade-information-p upgrade-information-p text">Consumption: <span id="${this.elementIds.upgradeInformationConsumption}">${u.consumption}</span></p>` : ``}
                </div>
                <div class="${u.type}-upgrade-buttons upgrade-buttons" id=${this.elementIds.upgradeButtons}>
                    <div class="upgrade-buttons-grid">
                        <label class="radio-card">
                            <input type="radio" name="${this.radioGroupName}" value="1" hidden checked>
                            <div class="${u.type}-upgrade-quantity-button upgrade-quantity-button text">1</div>
                        </label>
                        <label class="radio-card">
                            <input type="radio" name="${this.radioGroupName}" value="10" hidden>
                            <div class="${u.type}-upgrade-quantity-button upgrade-quantity-button text">10</div>
                        </label>
                        <label class="radio-card">
                            <input type="radio" name="${this.radioGroupName}" value="100" hidden>
                            <div class="${u.type}-upgrade-quantity-button upgrade-quantity-button text">100</div>
                        </label>
                        <label class="radio-card">
                            <input type="radio" name="${this.radioGroupName}" value="max" hidden>
                            <div class="${u.type}-upgrade-quantity-button upgrade-quantity-button text">Max</div>
                        </label>
                    </div>
                    <div class="upgrade-buttons-2-grid">
                        <label class="radio-card">
                            <input type="radio" name="${this.radioGroupName}" value="next" hidden>
                            <div class="${u.type}-upgrade-quantity-button-next upgrade-quantity-button-next text">Next</div>
                        </label>
                        <input class="${u.type}-upgrade-quantity-input upgrade-quantity-input" id="${this.elementIds.upgradeQuantityInput}" placeholder="Custom">
                    </div>
                    <button class="${u.type}-upgrade-buy upgrade-buy" id="${this.elementIds.buyButtonId}">
                        <p class="upgrade-buy-indicator text">Buy <span class="upgrade-buy-amount" id="${this.elementIds.upgradeBuyAmount}">1</span></p>
                        <div class="upgrade-buy-cost-container">
                            <img src="content/flag-white.svg" alt="" class="upgrade-buy-cost-flag">
                            <p class="upgrade-buy-cost text" id="${this.elementIds.upgradeBuyCost}">${u.cost}</p>
                        </div>
                    </button>
                </div>
                <div class="${u.type}-upgrade-level upgrade-level">
                    <div class="${u.type}-upgrade-level-indicator upgrade-level-indicator" id="${this.elementIds.upgradeLevelIndicator}"></div>
                </div>
                <span class="material-symbols-outlined upgrade-info-button" id="${this.elementIds.upgradeInfoButton}">
                    info
                </span>
            </div>
        `);

        Object.entries(this.elementIds).forEach((key) => {
            if(key[0] === "upgradeInformationBoostValues"){
                key[1].forEach((ID) => {
                    this.ui.createSmartElement(ID, ID);
                });
            }
            else if(!(key[0] === "upgradeInformationConsumption" && !u.def.consumptionPerUnit)) {
                this.ui.createSmartElement(key[1], key[1]);
            }
        });

        this.ui.addDynamicListener(this.elementIds.buyButtonId, "click", () => {
            u.buy();
        });

        this.ui.addDynamicListener(this.elementIds.upgradeButtons, "click", (e) => {
            const t = e.target;
            if (t.tagName === "INPUT" && t.type === "radio") {
                u.handleSelect(t.value);
                this.ui.elements[this.elementIds.upgradeQuantityInput].value("");
                this.ui.elements[this.elementIds.upgradeQuantityInput].toggle("selected-quantity", false);
            }
        });

        this.ui.addDynamicListener(this.elementIds.upgradeQuantityInput, "input", (e) => {
            const t = e.target;
            this.ui.elements[this.elementIds.upgradeQuantityInput].toggle("selected-quantity", t.value !== "");
            if (t.value !== "") {
                u.select(parseInt(t.value));
                this.clearBtnSelection();
            }
            else {
                u.select(1);
                this.selectBtn(0);
            }
        });

//        this.ui.addDynamicListener(this.elementIds.upgradeInfoButton, "click", () => { 
  //          this.ui.openUpgradeInfo(u.def.info);
    //    })
    }

    render(player) {
        const u = this.upgrade;
        this.ui.elements[this.elementIds.upgradeInformationLevel].text(`Level: ${u.level} (${u.bought} / ${u.nextLevelRequirement})`);

        this.elementIds.upgradeInformationBoostValues.forEach((value, i) => {
            this.ui.elements[value].text(`${roundTo(Object.values(u.boosts)[i], 3)}`);
        });

        if (u.def.consumptionPerUnit) this.ui.elements[this.elementIds.upgradeInformationConsumption].text(`${roundTo(u.consumption, 3)}`);

        this.ui.elements[this.elementIds.upgradeBuyAmount].text(`${u.selectedAmount}`);

        this.ui.elements[this.elementIds.upgradeBuyCost].text(`${u.selectedCost}`);
        this.ui.elements[this.elementIds.upgradeBuyCost].toggle(`insufficient-currency`, player.whiteFlagCount < u.selectedCost);

        this.ui.elements[this.elementIds.upgradeLevelIndicator].style("width", `${(u.bought - u.lastLevelRequirement) / (u.nextLevelRequirement - u.lastLevelRequirement) * 100}%`);
    }

    clearBtnSelection(){
        const btn = this.ui.querySelector(`input[type="radio"][name="${this.radioGroupName}"]:checked`);
        if(btn) btn.checked = false;
    }

    selectBtn(i){
        const btns = this.ui.querySelectorAll(`input[type="radio"][name="${this.radioGroupName}"]`);
        btns[i].checked = true;
    }

    pickTab(u){
        switch(u.type){
            case "component": return this.ui.elements.componentUpgradeTab; 
            case "energy": return this.ui.elements.energyUpgradeTab;
        }
    }
}