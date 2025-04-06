class Pipe {
    constructor(canvas, ground) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = ground;

        this.width = 60;
        this.gap = 200;
        this.speed = 2;
        this.passed = false;

        const minGapPosition = 140;
        const maxGapPosition =
            canvas.height - ground.height - this.gap - minGapPosition;
        this.gapPosition =
            Math.floor(Math.random() * (maxGapPosition - minGapPosition)) +
            minGapPosition;

        this.position = {
            x: canvas.width,
        };

        this.color = "#3CB043";
    }

    update() {
        this.position.x -= this.speed;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.position.x, 0, this.width, this.gapPosition);

        this.ctx.fillStyle = "#2A8C32";
        this.ctx.fillRect(
            this.position.x - 5,
            this.gapPosition - 20,
            this.width + 10,
            20
        );

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

        const birdRight = bird.position.x + bird.radius;
        const birdLeft = bird.position.x - bird.radius;

        // Check if bird is horizontally aligned with pipe
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

        // Check vertical collision with top pipe
        if (birdTop < this.gapPosition) {
            return true;
        }

        // Check vertical collision with bottom pipe
        if (birdBottom > this.gapPosition + this.gap) {
            return true;
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
        this.pipeSpawnInterval = 200; // Increased from 120 to 200 for more spacing
        this.frameCount = 0;
        this.score = 0;
    }

    reset() {
        this.pipes = [];
        this.frameCount = 0;
        this.score = 0;
    }

    update(currentTime) {
        this.frameCount++;

        if (this.frameCount >= this.pipeSpawnInterval) {
            this.pipes.push(new Pipe(this.canvas, this.ground));
            this.frameCount = 0;
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update();

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

    getNearestPipe() {
        let nearestPipe = null;
        let nearestDistance = Infinity;

        for (const pipe of this.pipes) {
            if (pipe.position.x > 100) {
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
export { Pipe };
