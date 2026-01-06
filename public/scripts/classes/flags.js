export default class WhiteFlag {
    constructor() {
        this.overclockDuration = 5000;
        this.overclockCooldown = 60000;

        this.ready = true;
        this.overclockActive = false;

        this.captureTimer = null;
        this.overclockActiveTimer = null;
        this.overclockCooldownTimer = null;

        this.outOfEnergyIndicator = false;
        this.outOfEnergyIndicatorTimer = null;
    }

    capture(game){
        if(!this.ready) return;
        const player = game.player;
        const timerManager = game.timerManager;
        if(player.captureConsumption > player.energyCount){
            if(this.outOfEnergyIndicatorTimer !== null) return;
            this.outOfEnergyIndicator = true; 
            this.outOfEnergyIndicatorTimer = timerManager.addTimer(300, () => {
                this.outOfEnergyIndicator = false;
                this.outOfEnergyIndicatorTimer = null;
            }) 
            return;
        }
        
        const speed = this.overclockActive ? player.overclockBoost : 1;
        const delay = 1000 / player.components["CPU"].frequency / speed;

        player.captureWhiteFlag();
        this.ready = false;

        this.captureTimer = timerManager.addTimer(delay, () => { 
            this.ready = true; 
            this.captureTimer = null; 
        });
    }

    overclock(game){
        const player = game.player;
        const timerManager = game.timerManager;
        if(this.overclockActive || this.overclockCooldownTimer) return;

        this.overclockActive = true;
        if(this.captureTimer !== null) timerManager.editTimerDuration(this.captureTimer, 1000 / player.components["CPU"].frequency / player.overclockBoost);

        this.overclockActiveTimer = timerManager.addTimer(this.overclockDuration, () => {
            this.overclockActive = false;
            this.overclockActiveTimer = null;
            if(this.captureTimer !== null) timerManager.editTimerDuration(this.captureTimer, 1000 / player.components["CPU"].frequency);
            this.overclockCooldownTimer = timerManager.addTimer(this.overclockCooldown, () => {
                this.overclockCooldownTimer = null;
            })
        })
    }

    getCaptureRatio(timerManager){
        if(this.captureTimer !== null){
            return timerManager.getTimeRatio(this.captureTimer);
        }
        
        return 1;
    }

    getOverclockRatio(timerManager){
        if(this.overclockActiveTimer !== null){
            return 1 - timerManager.getTimeRatio(this.overclockActiveTimer);
        }

        if(this.overclockCooldownTimer !== null){
            return timerManager.getTimeRatio(this.overclockCooldownTimer);
        }

        return 1;
    }

    getOverclockState(){
        if(this.overclockActive) return "descending";
        if(this.overclockCooldownTimer !== null) return "ascending";
        return "ready";
    }
}