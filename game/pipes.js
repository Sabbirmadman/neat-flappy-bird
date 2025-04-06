class Pipe {
    constructor(canvas, ground) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = ground;

        this.width = 60;
        this.gap = 150;
        this.speed = 1.5;
        this.passed = false;

        const minGapPosition = 120;
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

        if (
            birdRight > this.position.x &&
            birdLeft < this.position.x + this.width
        ) {
            if (birdTop < this.gapPosition) {
                return true;
            }

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
        this.pipeSpawnInterval = 2000;
        this.lastSpawnTime = 0;
        this.score = 0;
    }

    reset() {
        this.pipes = [];
        this.lastSpawnTime = 0;
        this.score = 0;
    }

    update(currentTime) {
        if (currentTime - this.lastSpawnTime > this.pipeSpawnInterval) {
            this.pipes.push(new Pipe(this.canvas, this.ground));
            this.lastSpawnTime = currentTime;
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
