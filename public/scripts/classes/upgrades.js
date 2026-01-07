export default class UpgradeManager {
    constructor() {
        this.list = {}
    }

    add(type, name){
        switch(type){
            case 'L1Component': this.list[type] = new L1ComponentUpgrade(name);
            default: break;
        }
    }
}

class L1ComponentUpgrade {
    constructor(name){
        this.name = name;
        bindVars();
    }

    bindVars(){
        switch(this.name){
            case "RAM": {
                this.price = 10;
                this.priceMultiplier = 1.2;
                this.bought = 1;
                this.level = 1;
                this.bytes = 1;
            }; break;
            case "CPU": {
                this.price = 50;
                this.priceMultiplier = 1.2;
                this.bought = 1;
                this.level = 1;
                this.frequency = 0.25;
            }; break;
            default: break;
        }
    }

    upgrade(game){
        
    }
}