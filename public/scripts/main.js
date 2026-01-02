let layerOneFlag;
let layerOneFlagCount;

let overclockBtn;

const Player = {
    whiteFlags: 0,
    RAM: 1,
    frequency: 0.25,
    overclockBoost: 4,
    overclockDuration: 5,
    overclockCooldown: 60,
    overclocked: false,
    canClick: true,
}

function clickFlag(){
    console.log(Player.overclocked);
    if(Player.canClick){
        Player.canClick = false;
        Player.whiteFlags += Player.RAM;
        setTimeout(() => {
            Player.canClick = true;
        },
        1 / Player.frequency * 1000 / (Player.overclocked ? Player.overclockBoost : 1));
        updateGUI();
    }
}

function overclock(){
    console.log(!Player.overclocked);
    if(!Player.overclocked){
        Player.overclocked = true;
        setTimeout(() => {
            Player.overclocked = false;
        }, Player.overclockDuration * 1000);
    }
}

function updateGUI(){
    layerOneFlagCount.textContent = Player.whiteFlags;
}

document.addEventListener("DOMContentLoaded", () => {
    layerOneFlag = document.querySelector("#white-flag-image");
    layerOneFlagCount = document.querySelector("#white-flag-count");
    overclockBtn = document.querySelector("#overclock-btn");

    layerOneFlag.addEventListener("click", clickFlag);
    overclockBtn.addEventListener("click", overclock);

})