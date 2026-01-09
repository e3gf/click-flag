export default class UpgradeManager {
    constructor() {
        this.list = {}
    }

    add(ui, type, name){
        if(this.list[name]){
            console.error(`Upgrade with name "${name}" already exists.`);
            return;
        }
        switch(type){
            case 'L1Component': this.list[name] = new L1ComponentUpgrade(ui, name);
            default: break;
        }
    }
}

class Upgrade {
    constructor(){
        this.cost = 0;
        this.costMultiplier  = 0;
        this.bought = 0;
        this.level = 0;
        this.nextLevelRequirement = 0;
    }

    buy(quantity){

    }

    levelUp(){

    }
}

class L1ComponentUpgrade extends Upgrade {
    constructor(ui, name){
        super();
        this.name = name;
        this.ui = ui;
        this.initialize();
    }

    initialize(){
        switch(this.name){
            case "RAM": {
                this.cost = 10;
                this.costMultiplier = 1.2;
                this.bought = 1;
                this.level = 1;
                this.boostValue = 1;
                this.consumption = 0.5;
                this.build("Bytes", "B");
            }; break;
            case "CPU": {
                this.cost = 50;
                this.costMultiplier = 1.2;
                this.bought = 1;
                this.level = 1;
                this.boostValue = 0.25;
                this.consumption = 0.5;
                this.build("Frequency", "Hz");
            }; break;
            default: {
                this.cost = 100;
                this.bought = 0;
                this.level = 0;
                this.boostValue = 0;
                this.consumption = 0;
                this.build("Nothing");
            };
        }
    }

    build(boost, unit=""){
        const upgradeInformationLevel = `${this.name}-upgrade-information-level`;
        const upgradeInformationBoostValue = `${this.name}-upgrade-information-boost`;
        const upgradeInformationConsumption = `${this.name}-upgrade-information-consumption`;
        const upgradeBuyAmount = `${this.name}-upgrade-buy-amount`;
        const upgradeBuyCost = `${this.name}-upgrade-buy-cost`;
        const upgradeLevelIndicator = `${this.name}-upgrade-level-indicator`;
        const upgradeInfoButton = `${this.name}-upgrade-info-button`;
        this.ui.elements.componentUpgradeTab.add(`
            <div class="component-upgrade upgrade">
                <h3 class="component-upgrade-title upgrade-title">${this.name}</h3>
                <div class="component-upgrade-information upgrade-information">
                    <p class="component-upgrade-information-p upgrade-information-p text" id="${upgradeInformationLevel}">Level: ${this.level} (${this.bought} / ${this.nextLevelRequirement})</p>
                    <p class="component-upgrade-information-p upgrade-information-p text">${boost}: <span id="${upgradeInformationBoostValue}">${this.boostValue}</span>${unit}</p>
                    <p class="component-upgrade-information-p upgrade-information-p text">Consumption: <span id="${upgradeInformationConsumption}">${this.consumption}</span></p>
                </div>
                <div class="component-upgrade-buttons upgrade-buttons">
                    <div class="upgrade-buttons-grid">
                        <button class="component-upgrade-quantity-button upgrade-quantity-button text">1</button>
                        <button class="component-upgrade-quantity-button upgrade-quantity-button text">10</button>
                        <button class="component-upgrade-quantity-button upgrade-quantity-button text">100</button>
                        <button class="component-upgrade-quantity-button upgrade-quantity-button text">Max</button>
                    </div>
                    <div class="upgrade-buttons-2-grid">
                        <button class="component-upgrade-quantity-button-next upgrade-quantity-button-next text">Next</button>
                        <input class="component-upgrade-quantity-input upgrade-quantity-input" placeholder="Custom"></input>
                    </div>
                    <button class="component-upgrade-buy upgrade-buy">
                        <p class="upgrade-buy-indicator text">Buy <span class="upgrade-buy-amount" id="${upgradeBuyAmount}">1</span></p>
                        <div class="upgrade-buy-cost-container">
                            <img src="content/flag-white.svg" alt="" class="upgrade-buy-cost-flag">
                            <p class="upgrade-buy-cost text" id="${upgradeBuyCost}">${this.cost}</p>
                        </div>
                    </button>
                </div>
                <div class="component-upgrade-level upgrade-level">
                    <div class="component-upgrade-level-indicator upgrade-level-indicator" id="${upgradeLevelIndicator}"></div>
                </div>
                <span class="material-symbols-outlined upgrade-info-button" id="${upgradeInfoButton}">
                    info
                </span>
            </div>
        `);

        this.ui.createSmartElement("upgradeInformationLevel", upgradeInformationLevel);
        this.ui.createSmartElement("upgradeInformationBoostValue", upgradeInformationBoostValue);
        this.ui.createSmartElement("upgradeInformationConsumption", upgradeInformationBoostValue);
        this.ui.createSmartElement("upgradeBuyAmount", upgradeBuyAmount);
        this.ui.createSmartElement("upgradeBuyCost", upgradeBuyCost);
        this.ui.createSmartElement("upgradeLevelIndicator", upgradeLevelIndicator);
        this.ui.createSmartElement("upgradeInfoButton", upgradeInfoButton);
    }

    render(){

    }
}