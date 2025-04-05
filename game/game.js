import Bird from "./bird.js";
import Ground from "./ground.js";

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.bird = new Bird(canvas);
        this.ground = new Ground(canvas);
        this.isRunning = false;
        this.canJump = true;
        this.jumpCooldown = 300;
        this.gameOver = false;
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
        this.gameOver = false;
        this.draw();
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    update() {
        if (this.gameOver) return;

        this.bird.update();
        this.ground.update();

        // Check if bird collides with ground
        if (this.ground.checkCollision(this.bird)) {
            this.gameOver = true;
        }
    }

    draw() {
        this.ctx.fillStyle = "skyblue";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.bird.draw();

        this.ground.draw();

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

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }
}

export default Game;
