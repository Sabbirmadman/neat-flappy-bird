class Pipe {
    constructor(canvas, ground) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = ground;

        this.width = 80;
        this.gap = 180; // Gap between top and bottom pipes
        this.speed = 2;
        this.passed = false;

        // Random height for the gap position
        const minGapPosition = 120;
        const maxGapPosition =
            canvas.height - ground.height - this.gap - minGapPosition;
        this.gapPosition =
            Math.floor(Math.random() * (maxGapPosition - minGapPosition)) +
            minGapPosition;

        this.position = {
            x: canvas.width, // Start right off the screen
        };

        this.color = "#3CB043"; // Green color for pipes
    }

    update() {
        this.position.x -= this.speed;
    }

    draw() {
        // Top pipe (upside down)
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.position.x, 0, this.width, this.gapPosition);

        // Pipe cap for top pipe
        this.ctx.fillStyle = "#2A8C32";
        this.ctx.fillRect(
            this.position.x - 5,
            this.gapPosition - 20,
            this.width + 10,
            20
        );

        // Bottom pipe
        const bottomPipeTop = this.gapPosition + this.gap;
        const bottomPipeHeight =
            this.canvas.height - bottomPipeTop - this.ground.height;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.position.x,
            bottomPipeTop,
            this.width,
            bottomPipeHeight
        );

        // Pipe cap for bottom pipe
        this.ctx.fillStyle = "#2A8C32";
        this.ctx.fillRect(
            this.position.x - 5,
            bottomPipeTop,
            this.width + 10,
            20
        );
    }

    checkCollision(bird) {
        if (bird.isDead) return false;

        // Calculate bird's bounding box for easier collision detection
        const birdRight = bird.position.x + bird.radius;
        const birdLeft = bird.position.x - bird.radius;
        if (
            !(
                birdRight > this.position.x &&
                birdLeft < this.position.x + this.width
            )
        ) {
            return false;
        }
        const birdTop = bird.position.y - bird.radius;
        const birdBottom = bird.position.y + bird.radius;

        // If bird is horizontally aligned with pipe
        if (
            birdRight > this.position.x &&
            birdLeft < this.position.x + this.width
        ) {
            // Check if bird hits the top pipe
            if (birdTop < this.gapPosition) {
                return true;
            }

            // Check if bird hits the bottom pipe
            if (birdBottom > this.gapPosition + this.gap) {
                return true;
            }
        }

        return false;
    }

    isOffScreen() {
        return this.position.x < -this.width;
    }
}

class PipeManager {
    constructor(canvas, ground) {
        this.canvas = canvas;
        this.ground = ground;
        this.pipes = [];
        this.pipeSpawnInterval = 2000; // Milliseconds between pipe spawns
        this.lastSpawnTime = 0;
        this.score = 0;
    }

    reset() {
        this.pipes = [];
        this.lastSpawnTime = 0;
        this.score = 0;
    }

    update(currentTime) {
        // Spawn new pipes
        if (currentTime - this.lastSpawnTime > this.pipeSpawnInterval) {
            this.pipes.push(new Pipe(this.canvas, this.ground));
            this.lastSpawnTime = currentTime;
        }

        // Update existing pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update();

            // Remove pipes that have gone off screen
            if (this.pipes[i].isOffScreen()) {
                this.pipes.splice(i, 1);
            }
        }
    }

    draw() {
        this.pipes.forEach((pipe) => pipe.draw());
    }

    checkCollisions(bird) {
        for (const pipe of this.pipes) {
            if (pipe.checkCollision(bird)) {
                return true;
            }

            // Check if bird passed a pipe
            if (
                !pipe.passed &&
                bird.position.x > pipe.position.x + pipe.width
            ) {
                pipe.passed = true;
                this.score++;
            }
        }
        return false;
    }

    getScore() {
        return this.score;
    }

    // Get the nearest pipe in front of the bird (for AI input)
    getNearestPipe() {
        let nearestPipe = null;
        let nearestDistance = Infinity;

        for (const pipe of this.pipes) {
            // Only consider pipes in front of the bird
            if (pipe.position.x > 100) {
                // Bird's x position
                const distance = pipe.position.x - 100;
                if (distance < nearestDistance) {
                    nearestPipe = pipe;
                    nearestDistance = distance;
                }
            }
        }

        return nearestPipe;
    }
}

export default PipeManager;
