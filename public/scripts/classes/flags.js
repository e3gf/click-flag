import timedWhile from "../utils/asyncWhile.js";

export default class WhiteFlag {
    constructor() {
        this.overclockDuration = 5000;
        this.overclockCooldown = 60000;

        this.ready = true;
        this.overclockActive = false;
        this.overclockReady = true;

        this.currentReadyTimer = null;
        this.currentOverclockActiveTimer = null;
        this.currentOverclockCooldownTimer = null;
    }

    capture(player, timerManager){
        if(this.ready){
            player.captureWhiteFlag();
            this.ready = false;
            this.currentReadyTimer = timerManager.addTimer(() => { this.ready = true; this.currentReadyTimer = null; },
                1000 / player.components["CPU"].frequency / (this.overclockActive ? player.overclockBoost : 1) 
            );
        }
    }

    overclock(player, timerManager, uiManager){
        if(this.overclockReady){
            this.overclockActive = true;
            this.overclockReady = false;
            if(this.currentReadyTimer) timerManager.editTimerDelay(this.currentReadyTimer, 1000 / player.components["CPU"].frequency / player.overclockBoost);
            this.currentOverclockActiveTimer = timerManager.addTimer(() => { 
                this.overclockActive = false;
                uiManager.updateOverclockCooldownBar(0, "descending");
                this.currentOverclockCooldownTimer = timerManager.addTimer(() => {
                    this.overclockReady = true;
                    uiManager.updateOverclockCooldownBar(1, "ascending");
                }, this.overclockCooldown);
                timedWhile(() => {
                    uiManager.updateOverclockCooldownBar(timerManager.getTimeRatio(this.currentOverclockCooldownTimer), "ascending");
                }, 50, this.overclockCooldown);
            }, this.overclockDuration);
            timedWhile(() => {
                uiManager.updateOverclockCooldownBar(1 - timerManager.getTimeRatio(this.currentOverclockActiveTimer), "descending");
            }, 50, this.overclockDuration);
        }
    }

}