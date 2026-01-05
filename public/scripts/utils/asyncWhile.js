function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function timedWhile(fn, interval, duration){
    const end = Date.now() + duration;
    while(Date.now() < end){
        fn();
        await sleep(interval);
    }
}