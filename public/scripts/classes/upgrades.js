import { game } from "../config/gameState.js";
import { UPGRADE_DEFS } from "../config/upgradeDefs.js";
import { formatNumber, toSeconds } from "../utils/formatting.js";
import { geometricSeriesSum } from "../utils/formulae.js";
import roundTo from "../utils/roundTo.js";
import { FloatingTextEffect } from "./visualEffect.js";

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

export class UpgradeScheduler {
    constructor(game){
        this.game = game;
    }

    update(){
        const player = this.game.player;
        const candidates = this.game.energyConsumers.filter(u => u.bought && u.state === "offline");
        const sortedCandidates = candidates.sort((a, b) => b.def.priority - a.def.priority);
        for(const upgrade of sortedCandidates){
            const energyNeeded = upgrade.consumption * upgrade.periodic["valueMulti"];

            if(player.energyCount >= energyNeeded){
                this.startUpgrade(upgrade, energyNeeded);
                upgrade.state = "running";
            } 
        }
    }

    startUpgrade(upgrade, consumption){
        const player = this.game.player;
        player.energyCount -= consumption;
        this.game.timerManager.resetTimer(upgrade.periodicTimer);
    }
}

class Upgrade {
    constructor(game, name, def) {
        this.game = game;
        this.player = game.player;
        this.timerManager = game.timerManager;
        this.name = name;
        this.def = def;
        this.title = def.title;

        if(this.def.energyConsumer){
            game.energyConsumers.push(this);
        }

        this.layer = def.layer;
        this.type = def.type;
        this.static = def.static; // "static" or "periodic" 

        this.cost = def.baseCost;
        this.costMultiplier = def.costMultiplier;

        this.bought = def.start.bought;
        this.level = def.start.level;

        if(this.type !== "general") {
            this.lastLevelRequirement = def.levelRequirement(this.level);
            this.nextLevelRequirement = def.levelRequirement(this.level + 1);
        }

        this.selected = "1";
        this.selectedAmount = 1;
        this.selectedCost = this.cost;

        this.boosts = {};
        this.consumption = this.bought * def.consumptionPerUnit;

        this.periodic = {};
        this.periodicTimer = null;
        this.threshold = 100; // this is when repeating timers stop showing progress but are visually instant and capped at this temporal value 
        this.thresholdReached = false;

        this.state = "offline";
        this.outOfEnergyTimer = null;

        this.recalculate();
    }

    buy() { 
        if (this.player.whiteFlagCount < this.selectedCost) return false;
        if (this.bought && this.type === "general") return false;

        this.game.audio.playSFX("buyUpgrade");
        this.player.whiteFlagCount -= this.selectedCost;
        this.bought += this.selectedAmount;

        if(this.type !== "general") this.cost *= this.costMultiplier ** this.selectedAmount;

        if (this.type !== "general" && this.bought >= this.nextLevelRequirement) {
            this.levelUp();
            this.game.audio.playSFX("levelUpUpgrade");
        }

        this.recalculate();
        return true;
    }

    recalculate() {
        if (this.type === "general"){
            if(this.bought) this.def.apply(this.game);
            return;
        }

        if(this.def.boosts){
            for (const [key, boost] of Object.entries(this.def.boosts)) {
                const value = boost.valueFunction(this.bought, this.level);
                const prevValue = this.boosts[key];
                this.boosts[key] = {value: value, type: boost.type};
                boost.apply(this.game, value, prevValue?.value);
            }
        }

        if(this.def.periodic && this.bought){
            const p = this.def.periodic; 
            const value = p.valueFunction(this.bought, this.level);
            const time = p.timeFunction(this.level, this.threshold);
            const prevValue = ((this?.periodic["value"] ?? 0) * (this?.periodic["valueMulti"] ?? 0));
            const prevTime = (this?.periodic["time"] ?? this.def.periodic.time);
            this.periodic["value"] = value;
            this.periodic["time"] = time.f;
            this.periodic["valueMulti"] = 1;
            if(time.s > 1) {
                this.thresholdReached = true;
                this.periodic["time"] = this.threshold;
                this.periodic["valueMulti"] = time.s;
            }
            if(this.type === "automation"){
                this.player.automationGeneration += (this.periodic["value"] * this.periodic["valueMulti"] * 1000 / this.periodic["time"] - prevValue * 1000 / prevTime);
            }
            let callback;
            if(this.def.energyConsumer) {
                const prevConsumption = this.consumption;
                const consumption = this.def.consumptionFunction(this.bought, this.level) * this.periodic["valueMulti"];
                this.consumption = consumption;
                this.player.energyConsumption += consumption * 1000 / this.periodic["time"] - prevConsumption * 1000 / prevTime;
                callback = (times) => {
                    if(this.state !== "running") return;
                    p.apply(this.game, this.periodic["value"] * this.periodic["valueMulti"], times);
                    this.state = "offline";
                }
            }
            else {
                if(this.type === "energy"){
                    const generation = this.periodic["value"] * this.periodic["valueMulti"];
                    this.player.energyGeneration += generation * 1000 / this.periodic["time"] - prevValue * 1000 / prevTime;
                }
                callback = (times) => {
                    p.apply(this.game, this.periodic["value"] * this.periodic["valueMulti"], times);
                }
            }
            if(this.periodicTimer === null){
                this.periodicTimer = this.timerManager.addTimer(this.periodic["time"], callback, true);
            }
            else {
                this.timerManager.editTimerDuration(this.periodicTimer, this.periodic["time"]);
                this.timerManager.editTimerCallback(this.periodicTimer, callback);
            }
        }

        if (this.type === "component" && this.def.consumptionPerUnit) {
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
        const boostNames = (u.def.boosts !== undefined) ? Object.keys(u.def.boosts).map((key) => key.replaceAll(" ", "")) : [];
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

            buyButtonId: `${u.name}-upgrade-buy-button`,
            upgradeButtons: `${u.name}-upgrade-buttons`,
            upgradeQuantityInput: `${u.name}-upgrade-quantity-input`,

            upgradeProgressIndicator: `${u.name}-upgrade-progress-indicator`,
            upgradeProgressValue: `${u.name}-upgrade-progress-value`,
            upgradeProgressTime: `${u.name}-upgrade-progress-time`,
            upgradeProgressBolt: `${u.name}-upgrade-progress-bolt`,
        }

        this.radioGroupName = `${u.name}radioGroup`;

        const tab = this.pickTab(u);
        if(u.type !== "general"){
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
                    ${this.periodicCheck() ? 
                    `<div class="${u.type}-upgrade-progress upgrade-progress">
                        <div class="${u.type}-upgrade-progress-indicator upgrade-progress-indicator" id="${this.elementIds.upgradeProgressIndicator}"></div>
                        ${u.type === "energy" ? 
                        `<div class="energy-upgrade-progress-container upgrade-progress-container">
                            <span class="energy-upgrade-progress-symbol material-symbols-outlined" id="${this.elementIds.upgradeProgressBolt}"></span>
                            <span class="${u.type}-upgrade-progress-value-in upgrade-progress-value-in" id="${this.elementIds.upgradeProgressValue}"></span>
                        </div>` 
                        : 
                        `<span class="${u.type}-upgrade-progress-value upgrade-progress-value" id="${this.elementIds.upgradeProgressValue}"></span>`
                        }
                        <span class="${u.type}-upgrade-progress-time upgrade-progress-time" id="${this.elementIds.upgradeProgressTime}"></span>
                    </div>` 
                    : 
                    `` 
                    }
                    <div class="${u.type}-upgrade-level upgrade-level">
                        <div class="${u.type}-upgrade-level-indicator upgrade-level-indicator" id="${this.elementIds.upgradeLevelIndicator}"></div>
                    </div>
                </div>
            `);
        } else {
            tab.add(`
                <div class="${u.type}-upgrade upgrade">
                    <div class="${u.type}-upgrade-titledesc-wrapper upgrade-titledesc-wrapper">
                        <h3 class="${u.type}-upgrade-title upgrade-title">${u.title}</h3>
                        <p class="${u.type}-upgrade-description upgrade-description text">${u.def.desc}</p>
                    </div>
                    <button class="${u.type}-upgrade-buy upgrade-buy" id="${this.elementIds.buyButtonId}">
                        <p class="upgrade-buy-indicator text" id="${this.elementIds.upgradeBuyAmount}">Buy 1</p>
                        <div class="upgrade-buy-cost-container">
                            <img src="content/flag-white.svg" alt="" class="upgrade-buy-cost-flag">
                            <p class="upgrade-buy-cost text" id="${this.elementIds.upgradeBuyCost}">${u.cost}</p>
                        </div>
                    </button>
                </div>  
            `);
        }

        Object.entries(this.elementIds).forEach((key) => {
            if(key[0] === "upgradeInformationBoostValues"){
                key[1].forEach((ID) => {
                    this.ui.createSmartElement(ID, ID);
                });
            }
            else if(!(this.evaluateValidIds(key))) {
                this.ui.createSmartElement(key[1], key[1]);
            }
        });

        this.ui.addDynamicListener(this.elementIds.buyButtonId, "click", () => {
            const selectedAmount = u.selectedAmount;
            const bought = u.buy();
            if(bought){
                u.game.visualEffectManager.add(
                    new FloatingTextEffect(u.game,
                        {
                            ...this.ui.getElementCenter(this.elementIds.buyButtonId),
                            text: `+${selectedAmount}`,
                            speed: 60,
                            spread: Math.PI / 8,
                        }
                    ) 
                )
            }
        });

        if(u.type !== "general") {
            this.ui.addDynamicListener(this.elementIds.upgradeButtons, "click", (e) => {
                const t = e.target;
                if (t.tagName === "INPUT" && t.type === "radio") {
                    u.handleSelect(t.value);
                    this.ui.elements[this.elementIds.upgradeQuantityInput].value("");
                    this.ui.elements[this.elementIds.upgradeQuantityInput].toggle("selected-quantity", false);
                    game.audio.playSFX("selectBuyAmount");
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
        }
    }

    render(player) {
        const u = this.upgrade;

        if(u.type === "general"){
            this.ui.elements[this.elementIds.upgradeBuyAmount].text(u.bought ? `Bought` : `Buy`);
            this.ui.elements[this.elementIds.upgradeBuyCost].toggle(`insufficient-currency`, (player.whiteFlagCount < u.selectedCost) && !u.bought);
            return;
        }
        
        this.ui.elements[this.elementIds.upgradeInformationLevel].text(`Level: ${formatNumber(u.level)} (${formatNumber(u.bought)} / ${formatNumber(u.nextLevelRequirement)})`);

        this.elementIds.upgradeInformationBoostValues.forEach((value, i) => {
            this.ui.elements[value].text(`${this.formatterDecider(Object.values(u.boosts)[i])}`);
        });

        if (u.def.consumptionPerUnit) this.ui.elements[this.elementIds.upgradeInformationConsumption].text(u.thresholdReached ? `${formatNumber(u.consumption * 1000 / u.threshold * u.periodic["valueMulti"])}/s` : `${formatNumber(u.consumption)}`);

        this.ui.elements[this.elementIds.upgradeBuyAmount].text(`${formatNumber(u.selectedAmount)}`);

        this.ui.elements[this.elementIds.upgradeBuyCost].text(`${formatNumber(u.selectedCost)}`);
        this.ui.elements[this.elementIds.upgradeBuyCost].toggle(`insufficient-currency`, player.whiteFlagCount < u.selectedCost);

        this.ui.elements[this.elementIds.upgradeLevelIndicator].style("width", `${(u.bought - u.lastLevelRequirement) / (u.nextLevelRequirement - u.lastLevelRequirement) * 100}%`);

        if (this.periodicCheck() && u.bought){
            if(u.def.energyConsumer){
                this.ui.elements[this.elementIds.upgradeProgressIndicator].style("width", u.state === "running" ? `${u.thresholdReached ? 100 : u.timerManager.getTimeRatio(u.periodicTimer) * 100}%` : `100%`);
                this.ui.elements[this.elementIds.upgradeProgressIndicator].toggle("upgrade-progress-indicator-energyless", u.state !== "running");
            }
            else {
                this.ui.elements[this.elementIds.upgradeProgressIndicator].style("width", `${u.thresholdReached ? `100` : u.timerManager.getTimeRatio(u.periodicTimer) * 100}%`);
            }
            this.ui.elements[this.elementIds.upgradeProgressValue].text(
                u.thresholdReached ? `${formatNumber(u.periodic["value"]*u.periodic["valueMulti"]*(1000/u.threshold))}/s` : `${formatNumber(u.periodic["value"])}`
            );
            this.ui.elements[this.elementIds.upgradeProgressTime].text(
                u.thresholdReached ? `` : `${toSeconds(u.periodic["time"])}`
            );

            if(u.type === "energy"){
                this.ui.elements[this.elementIds.upgradeProgressBolt].text(
                    u.bought ? `bolt` : ``
                );
            }
        }
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
            case "automation": return this.ui.elements.automationUpgradeTab;
            case "general": return this.ui.elements.generalUpgradeTab;
        }
    }

    evaluateValidIds(key){ // if one of them is true, the smartElement associated with this should not be created
        const u = this.upgrade;
        return key[0] === "upgradeInformationConsumption" && !u.def.consumptionPerUnit 
                || ["upgradeProgressIndicator", "upgradeProgressValue", "upgradeProgressTime"].includes(key[0])
                    && (u.type === "component" || u.type === "general")
                || key[0] === "upgradeProgressBolt" && !(u.type === "energy")
                || !(["buyButtonId", "upgradeBuyAmount", "upgradeBuyCost"].includes(key[0])) 
                    && u.type === "general";
    }

    periodicCheck(){
        const u = this.upgrade;
        return u.type === "energy" || u.type === "automation";
    }

    formatterDecider(v){
        switch(v.type){
            case "normal": return formatNumber(v.value);
            case "temporal": return toSeconds(v.value);
        }
    }
}