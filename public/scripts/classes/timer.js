export default class Timer {
    constructor(){
        this.timers = {};
        this.timerIdCounter = 0;
    }

    addTimer(callback, delay){
        const id = this.timerIdCounter;
        this.timerIdCounter++;

        const timerInfo = {
            callback: callback,
            delay: delay,
            startTime: Date.now(),
            timeoutId: setTimeout(() => this.executeTimer(id), delay),
            active: true,
        }

        this.timers[id] = timerInfo;
        return id;
    }

    executeTimer(id){
        const timer = this.timers[id];
        if(timer && timer.active){
            timer.callback();
            delete this.timers[id];
        }
    }

    editTimerDelay(id, newDelay, absolute = false){
        const timer = this.timers[id];

        if(!absolute && timer){
            clearTimeout(timer.timeoutId);

            const ratio = this.getTimeRatio(id);
            const newTimeIn = ratio * newDelay;
            const newStartTime = Date.now() - newTimeIn;
            const remainingTime = newDelay - newTimeIn;

            timer.startTime = newStartTime;
            timer.delay = remainingTime;
            timer.timeoutId = setTimeout(() => this.executeTimer(id), remainingTime);

        }

        else if(absolute && timer){
            clearTimeout(timer.timeoutId);

            const timeIn = this.getTimeIn();
            const remainingTime = newDelay - timeIn;

            timer.delay = remainingTime;
            timer.timeoutId = setTimeout(() => this.executeTimer(id), remainingTime);

        }

        else {
            console.error(`This with id ${id} does not exist.`);
        }

    }

    pauseTimer(){

    }

    resumeTimer(){

    }

    getTimeIn(id){
        const timer = this.timers[id];
        return Date.now() - timer.startTime;
    }

    getRemainingTime(){

    }

    getTimeRatio(id){
        const timer = this.timers[id];
        return (Date.now() - timer.startTime) / timer.delay;
    }

    removeTimer(){

    }
    
    removeAllTimers(){

    }

}