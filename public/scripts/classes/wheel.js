export default class Wheel {
    constructor (){ 
        this.spinReady = true;
        this.spinReadyTimer = null;
    }

    spinWheel(game){
        if(!this.spinReady) return;
        this.spinReady = false;
        this.spinReadyTimer = game.timerManager.addTimer(1000, () => {
            game.player.spinWheel();
            this.spinReady = true;
            this.spinReadyTimer = null;
        })
    }

    getSpinRatio(timerManager){
        if(this.spinReadyTimer !== null) return timerManager.getTimeRatio(this.spinReadyTimer);
        return 1;
    }   
}