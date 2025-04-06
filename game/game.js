import Bird from "./bird.js";
import Ground from "./ground.js";
import PipeManager, { Pipe } from "./pipes.js";
import Neat from "../neat/neat.js";

class Game {
    constructor(canvas) {
        this.populationSize = 500;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = new Ground(canvas);
        this.pipeManager = new PipeManager(canvas, this.ground);
        this.bird = new Bird(canvas);
        this.isHumanPlaying = true;
        this.neat = new Neat(
            canvas,
            this.ground,
            this.pipeManager,
            this.populationSize
        );
        this.isAITraining = false;
        this.isRunning = false;
        this.canJump = true;
        this.jumpCooldown = 300;
        this.gameOver = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        // Keep rendering options but remove game speed
        this.renderAllBirds = true;
        this.maxRenderBirds = 20;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("keydown", (e) => {
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

            if (e.code === "KeyH") {
                this.isHumanPlaying = true;
                this.isAITraining = false;
                this.neat.stopTraining();
                this.restart();
            } else if (e.code === "KeyA") {
                // Only change mode if not already in AI mode to prevent multiple starts
                if (this.isHumanPlaying || !this.isRunning) {
                    this.isHumanPlaying = false;
                    this.gameOver = false;
                    this.isAITraining = true;

                    // First start the game to ensure we have an active game loop
                    if (!this.isRunning) {
                        this.start();
                    }

                    // Clean up old NEAT instance if it exists
                    if (this.neat) {
                        this.neat.dispose();
                    }

                    // Create a new NEAT instance with fresh parameters
                    this.neat = new Neat(
                        this.canvas,
                        this.ground,
                        this.pipeManager,
                        this.populationSize
                    );

                    // Then restart to initialize the AI properly
                    this.restart();

                    // Finally start AI training
                    this.neat.startTraining();
                }
            }

            // Keep other controls but remove speed controls
            if (!this.isHumanPlaying) {
                // Toggle rendering all birds vs. only showing top birds
                if (e.code === "KeyV") {
                    this.renderAllBirds = !this.renderAllBirds;
                    console.log(
                        `Rendering ${
                            this.renderAllBirds ? "all" : "limited"
                        } birds`
                    );
                }

                // Population size controls
                if (e.code === "BracketRight") {
                    // ] key
                    this.increasePopulationSize();
                } else if (e.code === "BracketLeft") {
                    // [ key
                    this.decreasePopulationSize();
                }
            }

            if (e.code === "KeyT") {
                if (!this.isHumanPlaying) {
                    this.isAITraining = !this.isAITraining;
                    if (this.isAITraining) {
                        this.neat.startTraining();
                        if (!this.isRunning) this.start();
                    } else {
                        this.neat.stopTraining();
                    }
                }
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

    // Keep population size adjustment methods
    increasePopulationSize() {
        const newSize = this.populationSize + 10;
        if (newSize > 200) {
            console.warn(
                "Population sizes over 200 may cause significant performance issues"
            );
        }
        this.populationSize = newSize;

        // Create new population with updated size
        this.neat.dispose();
        this.neat = new Neat(
            this.canvas,
            this.ground,
            this.pipeManager,
            this.populationSize
        );
        this.restart();
        this.neat.startTraining();
        console.log(`Population size increased to ${this.populationSize}`);
    }

    decreasePopulationSize() {
        if (this.populationSize <= 10) return; // Minimum size
        this.populationSize = Math.max(10, this.populationSize - 10);

        // Create new population with updated size
        this.neat.dispose();
        this.neat = new Neat(
            this.canvas,
            this.ground,
            this.pipeManager,
            this.populationSize
        );
        this.restart();
        this.neat.startTraining();
        console.log(`Population size decreased to ${this.populationSize}`);
    }

    restart() {
        // Don't set isRunning to false in AI mode to keep the game loop going
        if (this.isHumanPlaying) {
            this.isRunning = false;
        }

        this.pipeManager.reset(); // Always reset pipes regardless of mode

        if (this.isHumanPlaying) {
            this.bird = new Bird(this.canvas);
        } else {
            // Clean up old NEAT instance properly
            if (this.neat) {
                this.neat.dispose();
            }

            this.neat = new Neat(
                this.canvas,
                this.ground,
                this.pipeManager,
                this.populationSize
            );

            // Create initial pipes to give the AI birds something to respond to
            this.pipeManager.pipes.push(new Pipe(this.canvas, this.ground));
        }

        this.gameOver = false;
        this.draw();
    }

    start() {
        // Only start if not already running
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.gameLoop(this.lastFrameTime);
        }
    }

    update(currentTime) {
        // Simplified update without game speed
        if (this.isHumanPlaying) {
            if (this.gameOver) return;

            this.bird.update();
            this.ground.update();
            this.pipeManager.update(currentTime);

            if (this.ground.checkCollision(this.bird)) {
                this.gameOver = true;
            }

            if (this.pipeManager.checkCollisions(this.bird)) {
                this.gameOver = true;
            }
        } else {
            this.ground.update();
            this.pipeManager.update(currentTime);

            if (this.isAITraining) {
                // Make sure neat is updated every frame
                this.neat.update(currentTime);

                // Force at least one pipe if none exist
                if (this.pipeManager.pipes.length === 0) {
                    this.pipeManager.pipes.push(
                        new Pipe(this.canvas, this.ground)
                    );
                }
            }
        }

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
                this.ctx.font = "36px Arial";
                this.ctx.fillText(
                    "Score: " + this.pipeManager.getScore(),
                    this.canvas.width / 2 - 70,
                    this.canvas.height / 2 + 50
                );
            } else if (!this.isRunning) {
                this.ctx.fillStyle = "black";
                this.ctx.font = "24px Arial";
                this.ctx.fillText(
                    "Press SPACE to start",
                    this.canvas.width / 2 - 120,
                    this.canvas.height / 2
                );
            }
        } else {
            // Keep rendering optimization
            if (
                this.renderAllBirds ||
                this.populationSize <= this.maxRenderBirds
            ) {
                this.neat.draw(this.ctx);
            } else {
                // Only draw best birds when population is large
                this.neat.drawBestBirds(this.ctx, this.maxRenderBirds);
            }
        }

        this.ground.draw();

        this.ctx.fillStyle = "white";
        this.ctx.font = "16px Arial";
        this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 80, 30);

        if (!this.isHumanPlaying) {
            // Update controls display - remove speed controls
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(this.canvas.width - 160, 50, 190, 190); // Smaller height
            this.ctx.fillStyle = "white";
            this.ctx.font = "12px Arial";
            this.ctx.fillText("Controls:", this.canvas.width - 140, 75);
            this.ctx.fillText(
                "T: Pause/Resume AI",
                this.canvas.width - 140,
                100
            );
            this.ctx.fillText("H: Human mode", this.canvas.width - 140, 125);
            this.ctx.fillText("A: AI mode", this.canvas.width - 140, 150);
            this.ctx.fillText(
                "V: Toggle bird rendering",
                this.canvas.width - 140,
                175
            );
            this.ctx.fillText(
                "[/]: Adjust population",
                this.canvas.width - 140,
                200
            );
            this.ctx.fillText(
                `Mode: AI ${this.isAITraining ? "Running" : "Paused"}`,
                this.canvas.width - 140,
                225
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
