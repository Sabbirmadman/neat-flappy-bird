import Bird from "./bird.js";
import Ground from "./ground.js";
import PipeManager from "./pipes.js";
import Neat from "../neat/neat.js";

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = new Ground(canvas);
        this.pipeManager = new PipeManager(canvas, this.ground);

        // Human mode
        this.bird = new Bird(canvas);
        this.isHumanPlaying = true;

        // AI mode
        this.neat = new Neat(canvas, this.ground, this.pipeManager, 50);
        this.isAITraining = false;

        // Game state
        this.isRunning = false;
        this.canJump = true;
        this.jumpCooldown = 300;
        this.gameOver = false;
        this.lastFrameTime = 0;

        // Performance monitoring
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("keydown", (e) => {
            // Human controls
            if (this.isHumanPlaying) {
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
            }

            // AI training controls
            if (e.code === "KeyT") {
                this.toggleAITraining();
            }

            // Speed controls
            if (e.code === "Digit1") {
                this.neat.setSpeed(1);
            } else if (e.code === "Digit2") {
                this.neat.setSpeed(2);
            } else if (e.code === "Digit5") {
                this.neat.setSpeed(5);
            } else if (e.code === "Digit0") {
                this.neat.setSpeed(10);
            }

            // Switch between human and AI mode
            if (e.code === "KeyH") {
                this.isHumanPlaying = true;
                this.neat.stopTraining();
                this.restart();
            } else if (e.code === "KeyA") {
                this.isHumanPlaying = false;
                this.gameOver = false;
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

        if (this.isHumanPlaying) {
            this.bird = new Bird(this.canvas);
            this.pipeManager.reset();
        } else {
            this.neat = new Neat(
                this.canvas,
                this.ground,
                this.pipeManager,
                50
            );
        }

        this.gameOver = false;
        this.draw();
    }

    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop(this.lastFrameTime);
    }

    toggleAITraining() {
        if (!this.isAITraining) {
            this.isAITraining = true;
            this.isHumanPlaying = false;
            this.gameOver = false;
            this.restart();
            this.neat.startTraining();
            this.start();
        } else {
            this.isAITraining = false;
            this.neat.stopTraining();
        }
    }

    update(currentTime) {
        if (this.isHumanPlaying) {
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
        } else {
            // AI training mode
            this.ground.update();
            this.pipeManager.update(currentTime);

            // Update NEAT
            if (this.isAITraining) {
                // Run multiple updates for speed boost
                for (let i = 0; i < this.neat.speedMultiplier; i++) {
                    this.neat.update(currentTime);
                }
            }
        }

        // Calculate FPS
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }

    draw() {
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.pipeManager.draw();

        if (this.isHumanPlaying) {
            this.bird.draw();

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
        } else {
            // Draw AI birds and training stats
            this.neat.draw(this.ctx);
        }

        this.ground.draw();

        // Display FPS and controls
        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 80, 30);

        if (!this.isHumanPlaying) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(this.canvas.width - 200, 50, 190, 160);
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Arial";
            this.ctx.fillText("Controls:", this.canvas.width - 180, 75);
            this.ctx.fillText(
                "T: Toggle training",
                this.canvas.width - 180,
                100
            );
            this.ctx.fillText(
                "1/2/5/0: Set speed",
                this.canvas.width - 180,
                125
            );
            this.ctx.fillText("H: Human mode", this.canvas.width - 180, 150);
            this.ctx.fillText("A: AI mode", this.canvas.width - 180, 175);
            this.ctx.fillText(
                `Mode: ${this.isAITraining ? "Training" : "Paused"}`,
                this.canvas.width - 180,
                200
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
