export default class TimerManager {
    #timerIdCounter;

    constructor(){
        this.timers = {};
        this.#timerIdCounter = 0;
    }

    addTimer(duration, callback, repeating = false){
        const id = this.#timerIdCounter;
        this.#timerIdCounter++;

        this.timers[id] = {
            callback,
            duration,
            elapsed: 0,
            repeating,
        }

        return id;
    }

    update(delta){
        for(const id in this.timers){
            const t = this.timers[id];
            t.elapsed += delta;

            if(t.elapsed >= t.duration){
                if(t.repeating){
                    const times = t.elapsed / t.duration;
                    const timesFloored = Math.floor(times);
                    const remainder = times - timesFloored;
                    t.elapsed = remainder * t.duration;
                    t.callback(timesFloored);
                }
                else {
                    t.callback();
                    delete this.timers[id];
                }
            }
        }
    }

    editTimerDuration(id, newDuration, absolute = false){
        const timer = this.timers[id];
        if(!timer) {
            console.error(`Nonexistent timer id: ${id}`);
            return;
        }
        if(!absolute){
            const ratio = timer.elapsed / timer.duration;
            timer.duration = newDuration;
            timer.elapsed = ratio * newDuration;
        } else {
            timer.duration = newDuration;
            if(timer.elapsed >= newDuration){
                const times = timer.elapsed / newDuration;
                const timesFloored = Math.floor(times);
                const remainder = times - timesFloored;
                t.elapsed = remainder * newDuration;
                t.callback(timesFloored);
            }
        }
    }

    editTimerCallback(id, newCallback){
        const timer = this.timers[id];
        if(!timer){
            console.error(`Nonexistent timer id: ${id}`);
            return;
        }
        timer.callback = newCallback;
    }

    getTimeRatio(id){
        const timer = this.timers[id];
        if(!timer){
            console.error(`Nonexistent timer id: ${id}`);
            return;
        }
        return timer ? Math.min(timer.elapsed / timer.duration, 1) : 1;
    }

    resetTimer(id){
        const timer = this.timers[id];
        if(!timer){
            console.error(`Nonexistent timer id: ${id}`);
            return;
        }
        timer.elapsed = 0;
    }

    removeTimer(id){
        if(this.timers[id]) delete this.timers[id];
    }
}