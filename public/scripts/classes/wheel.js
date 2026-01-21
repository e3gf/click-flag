import { FloatingTextEffect } from "./visualEffect.js";

export default class Wheel {
    constructor (){ 
        this.spinReady = true;
        this.spinReadyTimer = null;
    }

    spinWheel(game){
        if(!this.spinReady) return;
        game.audio.playSFX("wheelSpin");
        this.spinReady = false;
        this.spinReadyTimer = game.timerManager.addTimer(1000, () => {
            game.player.spinWheel();
            this.spinReady = true;
            this.spinReadyTimer = null;
            game.visualEffectManager.add(
                new FloatingTextEffect(game,
                    {
                        text: "+1",
                        spread: Math.PI,
                        ...game.uiManager.getElementCenter("wheel"),
                        type: "energy",
                        speed: 60,
                    }
                )
            );
        })
    }

    getSpinRatio(timerManager){
        if(this.spinReadyTimer !== null) return timerManager.getTimeRatio(this.spinReadyTimer);
        return 1;
    }   
}