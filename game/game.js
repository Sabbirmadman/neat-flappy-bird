class Game {
    constructor(canvas, backgroundImage, isMobile = false) {
        this.populationSize = 500;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ground = new window.Ground(canvas);
        this.pipeManager = new window.PipeManager(canvas, this.ground);
        this.bird = new window.Bird(canvas);
        this.backgroundImage = backgroundImage;
        this.isHumanPlaying = true;
        this.neat = new window.Neat(
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
        // Store mobile status
        this.isMobile = isMobile;
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
                    this.neat = new window.Neat(
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

        // Add touch events for canvas (for mobile)
        if (this.isMobile) {
            // Touch events are handled by the mobile controls in main.js
        }
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
        this.neat = new window.Neat(
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
        this.neat = new window.Neat(
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
            this.bird = new window.Bird(this.canvas);
        } else {
            // Clean up old NEAT instance properly
            if (this.neat) {
                this.neat.dispose();
            }

            this.neat = new window.Neat(
                this.canvas,
                this.ground,
                this.pipeManager,
                this.populationSize
            );

            // Create initial pipes to give the AI birds something to respond to
            this.pipeManager.pipes.push(
                new window.Pipe(this.canvas, this.ground)
            );
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
                        new window.Pipe(this.canvas, this.ground)
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
        // Draw background image instead of solid color
        if (this.backgroundImage) {
            // Draw the image to cover the entire canvas
            this.ctx.drawImage(
                this.backgroundImage,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        } else {
            // Fallback to sky blue if image not loaded
            this.ctx.fillStyle = "skyblue";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.pipeManager.draw();

        if (this.isHumanPlaying) {
            this.bird.draw();

            // Score display
            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 5;
            this.ctx.font = "36px Arial";
            const scoreText = this.pipeManager.getScore().toString();
            const textWidth = this.ctx.measureText(scoreText).width;
            const x = this.canvas.width / 2 - textWidth / 2;

            this.ctx.strokeText(scoreText, x, 50);
            this.ctx.fillText(scoreText, x, 50);

            if (this.gameOver) {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                this.ctx.fillRect(
                    this.canvas.width / 2 - 150,
                    this.canvas.height / 2 - 100,
                    300,
                    180
                );

                this.ctx.fillStyle = "white";
                this.ctx.font = "36px Arial";
                this.ctx.fillText(
                    "GAME OVER",
                    this.canvas.width / 2 - 100,
                    this.canvas.height / 2 - 50
                );

                this.ctx.font = "30px Arial";
                this.ctx.fillText(
                    "Score: " + this.pipeManager.getScore(),
                    this.canvas.width / 2 - 60,
                    this.canvas.height / 2 + 10
                );

                // No need for restart text on mobile - we have the reload button
            } else if (!this.isRunning) {
                if (!this.isMobile) {
                    // Only show text instructions on desktop
                    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    this.ctx.fillRect(
                        this.canvas.width / 2 - 150,
                        this.canvas.height / 2 - 50,
                        300,
                        100
                    );

                    this.ctx.fillStyle = "white";
                    this.ctx.font = "24px Arial";
                    this.ctx.fillText(
                        "Press SPACE to start",
                        this.canvas.width / 2 - 110,
                        this.canvas.height / 2
                    );
                }
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

        // Only show FPS counter and controls info on desktop
        if (!this.isMobile) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Arial";
            this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 80, 30);

            if (!this.isHumanPlaying) {
                // Update controls display - desktop only
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                this.ctx.fillRect(this.canvas.width - 160, 50, 190, 190);
                this.ctx.fillStyle = "white";
                this.ctx.font = "12px Arial";
                this.ctx.fillText("Controls:", this.canvas.width - 140, 75);
                this.ctx.fillText(
                    "T: Pause/Resume AI",
                    this.canvas.width - 140,
                    100
                );
                this.ctx.fillText(
                    "H: Human mode",
                    this.canvas.width - 140,
                    125
                );
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
        } else if (!this.isHumanPlaying) {
            // Minimal mode indicator for AI on mobile
            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 2;
            this.ctx.font = "16px Arial";
            this.ctx.strokeText("AI MODE", 20, 30);
            this.ctx.fillText("AI MODE", 20, 30);
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        this.update(currentTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

window.Game = Game;
