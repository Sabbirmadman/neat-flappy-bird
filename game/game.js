import Bird from "./bird.js";
import Ground from "./ground.js";
import PipeManager from "./pipes.js";

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.bird = new Bird(canvas);
        this.ground = new Ground(canvas);
        this.pipeManager = new PipeManager(canvas, this.ground);
        this.isRunning = false;
        this.canJump = true;
        this.jumpCooldown = 300;
        this.gameOver = false;
        this.lastFrameTime = 0;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space" && this.canJump && !this.gameOver) {
                this.bird.jump();
                this.canJump = false;

                if (!this.isRunning) {
                    this.start();
                }

                setTimeout(() => {
                    this.canJump = true;
                }, this.jumpCooldown);
            }

            if (e.code === "KeyR" && this.gameOver) {
                this.restart();
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.code === "Space") {
                setTimeout(() => {
                    this.canJump = true;
                }, 50);
            }
        });
    }

    restart() {
        this.isRunning = false;
        this.bird = new Bird(this.canvas);
        this.pipeManager.reset();
        this.gameOver = false;
        this.draw();
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop(this.lastFrameTime);
    }

    update(currentTime) {
        if (this.gameOver) return;

        this.bird.update();
        this.ground.update();
        this.pipeManager.update(currentTime);

        // Check if bird collides with ground
        if (this.ground.checkCollision(this.bird)) {
            this.gameOver = true;
        }

        // Check if bird collides with pipes
        if (this.pipeManager.checkCollisions(this.bird)) {
            this.gameOver = true;
        }
    }

    draw() {
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.pipeManager.draw();
        this.bird.draw();
        this.ground.draw();

        // Draw score
        this.ctx.fillStyle = "black";
        this.ctx.font = "36px Arial";
        this.ctx.fillText(
            this.pipeManager.getScore().toString(),
            this.canvas.width / 2 - 15,
            50
        );

        if (this.gameOver) {
            this.ctx.fillStyle = "black";
            this.ctx.font = "48px Arial";
            this.ctx.fillText(
                "GAME OVER",
                this.canvas.width / 2 - 130,
                this.canvas.height / 2 - 50
            );
            this.ctx.font = "24px Arial";
            this.ctx.fillText(
                "Press R to restart",
                this.canvas.width / 2 - 100,
                this.canvas.height / 2
            );

            // Draw final score
            this.ctx.font = "36px Arial";
            this.ctx.fillText(
                "Score: " + this.pipeManager.getScore(),
                this.canvas.width / 2 - 70,
                this.canvas.height / 2 + 50
            );
        } else if (!this.isRunning) {
            // Draw instructions at game start
            this.ctx.fillStyle = "black";
            this.ctx.font = "24px Arial";
            this.ctx.fillText(
                "Press SPACE to start",
                this.canvas.width / 2 - 120,
                this.canvas.height / 2
            );
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        this.update(currentTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

export default Game;
