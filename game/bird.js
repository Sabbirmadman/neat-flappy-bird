class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 15;
        this.position = {
            x: canvas.width / 5,
            y: canvas.height / 2,
        };
        this.velocity = 0;
        this.gravity = 0.2;
        this.jumpStrength = -6;
        this.brain = null;
        this.isDead = false;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.borderColor = `hsl(${Math.random() * 360}, 100%, 30%)`;
    }

    reset() {
        this.position.y = this.canvas.height / 2;
        this.velocity = 0;
        this.isDead = false;
    }

    jump() {
        this.velocity = Math.min(this.velocity, this.jumpStrength);
    }

    update() {
        this.velocity += this.gravity;

        if (this.velocity > 10) {
            this.velocity = 10;
        }

        this.position.y += this.velocity;

        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity = 0;
        }
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.closePath();
    }
}

export default Bird;
