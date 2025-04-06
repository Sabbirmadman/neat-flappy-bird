class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.height = 100;
        this.position = {
            y: canvas.height - this.height,
        };
        this.speed = 2;
        this.width = canvas.width;
        this.color = "#8B4513";
    }

    update() {}

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, this.position.y, this.width, this.height);

        this.ctx.fillStyle = "#654321";
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
