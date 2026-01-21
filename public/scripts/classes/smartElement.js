export default class SmartElement {
    constructor(element){
        this.el = element;
        this.lastText = "";
        this.lastStyles = {};
        this.lastValue = "";

        if(this.el.nodeName === "INPUT"){
            this.el.addEventListener("input", (e) => {
                this.lastValue = e.target.value;
            })
        }
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

    value(value){
        if(this.lastValue !== value){
            this.lastValue = value;
            this.el.value = value;
        }
    }

    toggle(className, force){
        if(this.el.classList.contains(className) !== force){
            if(force) this.el.classList.add(className);
            else this.el.classList.remove(className);
        }
    }

    add(html){
        this.el.insertAdjacentHTML("beforeend", html);
    }

    addEventListener(event, callback){
        this.el.addEventListener(event, callback);
    }

    removeEventListener(event, callback){
        this.el.removeEventListener(event, callback);
    }

    getBoundingClientRect(){
        return this.el.getBoundingClientRect();
    }
}