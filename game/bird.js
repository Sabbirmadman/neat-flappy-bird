class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 20; // Increased from 15 to 25
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

        // Load bird image
        this.image = new Image();
        this.image.src = "bird.png";

        // Bird dimensions based on image size
        this.width = this.radius * 2;
        this.height = this.radius * 2;

        // Rotation properties
        this.rotation = 0;
        this.maxRotation = Math.PI / 4; // 45 degrees
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

        // Update rotation based on velocity
        if (this.velocity < 0) {
            // Bird is going up, rotate upward
            this.rotation = -this.maxRotation;
        } else {
            // Bird is falling, rotate downward (proportional to velocity)
            this.rotation = Math.min(this.maxRotation, this.velocity * 0.04);
        }
    }

    draw() {
        // Save the current context state
        this.ctx.save();

        // Move to the bird position
        this.ctx.translate(this.position.x, this.position.y);

        // Rotate the context
        this.ctx.rotate(this.rotation);

        // Draw the bird image centered
        if (this.image.complete) {
            this.ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Fallback to circle if image not loaded
            this.ctx.fillStyle = this.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Restore the context to its original state
        this.ctx.restore();
    }
}

export default Bird;
