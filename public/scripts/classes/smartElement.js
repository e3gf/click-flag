export default class SmartElement {
    constructor(element){
        this.el = element;
        this.lastText = "";
        this.lastStyles = {};
    }

    text(value){
        if(this.lastText !== value){
            this.lastText = value;
            this.el.textContent = value;
        }
    }

    style(prop, value){
        if(this.lastStyles[prop] !== value){
            this.lastStyles[prop] = value;
            this.el.style[prop] = value;
        }
    }

    add(elementString){
        this.el.innerHTML += elementString;
    }

    addEventListener(event, callback){
        this.el.addEventListener(event, callback);
    }

    removeEventListener(event, callback){
        this.el.removeEventListener(event, callback);
    }
}