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
        this.jumpStrength = -6; // Reduced strength for more control
    }

    reset() {
        // Reset bird to initial position and velocity
        this.position.y = this.canvas.height / 2;
        this.velocity = 0;
    }

    jump() {
        this.velocity = this.jumpStrength;
    }

    update() {
        // Apply gravity
        this.velocity += this.gravity;

        // Cap maximum falling velocity to prevent too fast falling
        if (this.velocity > 10) {
            this.velocity = 10;
        }

        this.position.y += this.velocity;

        // Only prevent bird from going off the top
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity = 0;
        }

        // Allow the bird to fall below the canvas for ground collision detection
    }

    draw() {
        this.ctx.fillStyle = "yellow";
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
