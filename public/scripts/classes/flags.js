export default class WhiteFlag {
    constructor() {
        this.ready = true;
        this.overclockActive = false;

        this.captureSpeedThreshold = 100;
        this.captureTimer = null;
        this.overclockActiveTimer = null;
        this.overclockCooldownTimer = null;

        this.outOfEnergyIndicator = false;
    }

    capture(game){
        this.outOfEnergyIndicator = false;
        if(!this.ready) return;
        const player = game.player;
        const timerManager = game.timerManager;
        const audio = game.audio;
        const vEM = game.visualEffectManager;
        if(player.captureConsumption * player.getFreqValueMultiplier() > player.energyCount){
            this.outOfEnergyIndicator = true; 
            audio.playSFX("insufficientEnergy", 1000);
            return;
        }
        const delay = this.getCaptureDelay(player);

        player.captureWhiteFlag();
        audio.playSFX("captureFlag");
        this.ready = false;

        this.captureTimer = timerManager.addTimer(delay, () => { 
            this.ready = true; 
            this.captureTimer = null; 
        });
    }

    overclock(game){
        const player = game.player;
        const timerManager = game.timerManager;
        const audio = game.audio;
        if(this.overclockActive || this.overclockCooldownTimer){
            audio.playSFX("cooldownErrors", 1000);
            return;
        } 
        audio.playSFX("overclockStart");
        this.overclockActive = true;
        if(this.captureTimer !== null) timerManager.editTimerDuration(this.captureTimer, 1000 / player.captureFrequency / player.overclockBoost);

        this.overclockActiveTimer = timerManager.addTimer(player.overclockDuration, () => {
            this.overclockActive = false;
            this.overclockActiveTimer = null;
            audio.playSFX("overclockEnd");
            if(this.captureTimer !== null) timerManager.editTimerDuration(this.captureTimer, 1000 / player.captureFrequency);
            this.overclockCooldownTimer = timerManager.addTimer(player.overclockCooldown, () => {
                this.overclockCooldownTimer = null;
                audio.playSFX("cooldownReady");
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

    getCaptureDelay(player){
        const speed = this.overclockActive ? player.overclockBoost : 1;
        return Math.max(this.captureSpeedThreshold, 1000 / player.captureFrequency / speed);
    }
}