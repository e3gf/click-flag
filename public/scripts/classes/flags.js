import timedWhile from "../utils/asyncWhile.js";

export default class WhiteFlag {
    constructor() {
        this.overclockDuration = 5000;
        this.overclockCooldown = 60000;

        this.ready = true;
        this.overclockActive = false;

        this.captureTimer = null;
        this.overclockActiveTimer = null;
        this.overclockCooldownTimer = null;
    }

    capture(player, timerManager){
        if(!this.ready) return;
        
        const speed = this.overclockActive ? player.overclockBoost : 1;
        const delay = 1000 / player.components["CPU"].frequency / speed;

        player.captureWhiteFlag();
        this.ready = false;

        this.captureTimer = timerManager.addTimer(delay, () => { 
            this.ready = true; 
            this.captureTimer = null; 
        });
    }

    overclock(player, timerManager){
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