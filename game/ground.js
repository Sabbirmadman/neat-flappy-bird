class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.height = 140;
        this.position = {
            y: canvas.height - this.height,
        };
        this.speed = 2;
        this.width = canvas.width;
        this.color = "rgba(139, 69, 19, 0)"; // Changed to rgba with 0.6 alpha
    }

    update() {}

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, this.position.y, this.width, this.height);

        this.ctx.fillStyle = "rgba(101, 67, 33, 0)"; // Changed to rgba with 0.8 alpha
        this.ctx.fillRect(0, this.position.y, this.width, 5);
    }

    checkCollision(bird) {
        if (bird.position.y + bird.radius >= this.position.y) {
            return true;
        }
        return false;
    }
}

export default Ground;
