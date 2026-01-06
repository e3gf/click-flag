export default class Timer {
    constructor(){
        this.timers = {};
        this.timerIdCounter = 0;
    }

    addTimer(duration, callback, repeating = false){
        const id = this.timerIdCounter;
        this.timerIdCounter++;

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
                t.callback();
                if(t.repeating){
                    t.elapsed %= t.duration; // need to add logic for repeating timers to execute properly
                }
                else {
                    delete this.timers[id];
                }
            }
        }
    }

    editTimerDuration(id, newDuration, absolute = false){
        const timer = this.timers[id];
        console.log(id, newDuration);
        if(!timer) {
            console.error(`Nonexistent timer id: ${id}`);
            return;
        }
        if(!absolute){
            console.log("a");
            const ratio = timer.elapsed / timer.duration;
            this.timers[id].duration = newDuration;
            this.timers[id].elapsed = ratio * newDuration;
        } else {
            this.timers[id].duration = newDuration;
            if(this.timers[id].elapsed >= newDuration){
                this.timers[id].elapsed %= newDuration;
                //need to a dd logic for repeating timers to execute properly
            }
        }
    }

    getTimeRatio(id){
        const timer = this.timers[id];
        return timer ? Math.min(timer.elapsed / timer.duration, 1) : 1;
    }

    removeTimer(id){
        if(this.timers[id]) delete this.timers[id];
    }
}