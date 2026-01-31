export default class VisualEffectManager {
    constructor(game, on) {
        this.game = game;
        this.effects = [];
        this.on = on;

        this.measurementNode = this.game.document.createElement("div");
        this.measurementNode.id = "measurement-node";
        Object.assign(this.measurementNode.style, {
            position: "absolute",
            visibility: "hidden",
            top: "-9999px",
            left: "-9999px",
            contain: "layout style",
        })
        this.game.document.body.appendChild(this.measurementNode);
    }

    add(effect) {
        if(!this.on) return;
        this.effects.push(effect);
        effect.start();
        return effect;
    }

    update(delta) {
        if(!this.on) return;
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const e = this.effects[i];
            e.update(delta);

            if (e.dead) {
                this.effects.splice(i, 1);
            }
        }
    }

    clear() {
        for (const e of this.effects) e.destroy();
        this.effects.length = 0;
    }
}

export class VisualEffect {
    constructor(game, {
        x = 0,
        y = 0,
        lifetime = 1000,
        useTimer = true,
    } = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.lifetime = lifetime;
        this.elapsed = 0;
        this.dead = false;

        this.useTimer = useTimer;
        this.timerId = null;

        this.el = null;
        this.measurementNode = game.document.getElementById("measurement-node");
    }

    start() {
        this.init();

        if (this.useTimer) {
            this.timerId = this.game.timerManager.addTimer(
                this.lifetime,
                () => this.destroy()
            );
        }
    }

    init() {}

    update(delta) {
        if (this.dead) return;

        this.elapsed += delta;

        if (!this.useTimer && this.elapsed >= this.lifetime) {
            this.destroy();
        }
    }

    destroy() {
        if (this.dead) return;
        this.dead = true;

        if (this.timerId !== null) {
            this.game.timerManager.removeTimer(this.timerId);
        }

        if (this.el?.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }
}


export class FloatingTextEffect extends VisualEffect {
    constructor(game, {
        text = "text",
        x = 0,
        y = 0,
        color = "white",
        lifetime = 1000,
        speed = 30,
        spread = Math.PI / 3,
        type = "normal"
    } = {}) {
        super(game, { x, y, lifetime });

        this.text = text;
        this.color = color;
        this.type = type;

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    init() {
        this.el = document.createElement("div");
        const p = document.createElement("p");
        p.textContent = this.text;
        this.el.appendChild(p);
        if(this.type === "normal"){
            this.el.className = "normal-floating-text";
        }
        else if(this.type === "energy"){
            this.el.className = "energy-floating-text";
            const span = document.createElement("span");
            span.classList.add("material-symbols-outlined");
            span.classList.add("energy-symbol-vfx");
            span.textContent = "bolt";
            this.el.appendChild(span);
        }
        else if(this.type === "flag"){
            this.el.className = "flag-floating-text";
            const img = document.createElement("img");
            img.classList.add("flag-symbol-vfx");
            img.src = "/content/flag-white.svg";
            this.el.appendChild(img);
        }
        this.measurementNode.appendChild(this.el);

        const {width, height} = this.el.getBoundingClientRect();

        this.measurementNode.removeChild(this.el);

        this.x -= Math.round(width / 2);
        this.y -= Math.round(height / 2);

        Object.assign(this.el.style, {
            position: "absolute",
            left: "0px",
            top: "0px",
            transform: `translate(${this.x}px, ${this.y}px)`,
            color: this.color,
            pointerEvents: "none",
            fontWeight: "bold",
            willChange: "transform, opacity",
        });

        document.body.appendChild(this.el);
    }

    update(delta) {
        super.update(delta);
        if (this.dead) return;

        const dt = delta / 1000;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const lifeRatio = 1 - this.elapsed / this.lifetime;

        this.el.style.transform =
            `translate(${this.x}px, ${this.y}px)`;
        this.el.style.opacity = lifeRatio.toFixed(2);
    }
}