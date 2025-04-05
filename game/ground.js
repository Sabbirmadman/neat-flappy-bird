class Ground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.height = 100; // Height of the ground from bottom of canvas
        this.position = {
            y: canvas.height - this.height,
        };
        this.speed = 2; // Speed at which ground moves left
        this.width = canvas.width;
        this.color = "#8B4513"; // Brown color for the ground
    }

    update() {
        // Ground doesn't need much updating in this implementation
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(0, this.position.y, this.width, this.height);

        // Add some texture to the ground
        this.ctx.fillStyle = "#654321";
        this.ctx.fillRect(0, this.position.y, this.width, 5);
    }

    checkCollision(bird) {
        // If bird's bottom edge touches or goes below ground's top edge
        if (bird.position.y + bird.radius >= this.position.y) {
            return true; // Collision detected
        }
        return false;
    }
}

export default Ground;
