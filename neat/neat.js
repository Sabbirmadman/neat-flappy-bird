import Population from "./population.js";
import Bird from "../game/bird.js";

class Neat {
    constructor(canvas, ground, pipeManager, populationSize = 50) {
        this.canvas = canvas;
        this.ground = ground;
        this.pipeManager = pipeManager;

        // Create population
        this.population = new Population(populationSize);

        // Create birds with brains
        this.birds = [];
        this.createBirds();

        this.isTraining = false;
        this.speedMultiplier = 1; // For fast-forwarding training
    }

    createBirds() {
        this.birds = [];
        const genomes = this.population.getGenomes();

        for (const genome of genomes) {
            const bird = new Bird(this.canvas);
            bird.brain = genome;
            bird.isDead = false;
            this.birds.push(bird);
        }
    }

    startTraining() {
        this.isTraining = true;
    }

    stopTraining() {
        this.isTraining = false;
    }

    setSpeed(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(currentTime) {
        if (!this.isTraining) return;

        // Get the nearest pipe for input
        let nearestPipe = this.pipeManager.getNearestPipe();

        // Check if all birds are dead
        let allDead = true;

        // Update each bird
        for (let i = 0; i < this.birds.length; i++) {
            const bird = this.birds[i];

            if (!bird.isDead) {
                allDead = false;
                bird.update();

                // Update the bird's brain info
                bird.brain.lifespan++;

                // Check collision with ground
                if (this.ground.checkCollision(bird)) {
                    bird.isDead = true;
                    continue;
                }

                // Check collision with pipes
                if (this.pipeManager.checkCollisions(bird)) {
                    bird.isDead = true;
                    continue;
                }

                // Think and decide whether to jump
                if (nearestPipe) {
                    // Calculate inputs for the neural network
                    const inputs = [
                        bird.position.y / this.canvas.height, // Bird's y position (normalized)
                        bird.velocity / 10, // Bird's velocity (normalized)
                        nearestPipe.position.x / this.canvas.width, // Pipe's x position (normalized)
                        nearestPipe.gapPosition / this.canvas.height, // Pipe's gap top position (normalized)
                        (nearestPipe.gapPosition + nearestPipe.gap) /
                            this.canvas.height, // Pipe's gap bottom position (normalized)
                    ];

                    // Let the bird's brain think and decide
                    if (bird.brain.think(inputs)) {
                        bird.jump();
                    }
                }

                // Update score
                bird.brain.score = this.pipeManager.getScore();
            }
        }

        // If all birds are dead, evolve to the next generation
        if (allDead) {
            this.evolve();
        }
    }

    evolve() {
        // Evolve the population
        this.population.evolve();

        // Reset pipes
        this.pipeManager.reset();

        // Create new birds with evolved brains
        this.createBirds();
    }

    draw(ctx) {
        // Draw only living birds
        for (const bird of this.birds) {
            if (!bird.isDead) {
                bird.draw(ctx);
            }
        }

        // Draw stats
        const stats = this.population.getStats();

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 240, 100);

        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText(`Generation: ${stats.generation}`, 20, 30);
        ctx.fillText(`Best Score: ${stats.bestScore}`, 20, 50);
        ctx.fillText(
            `Birds Alive: ${this.birds.filter((b) => !b.isDead).length}/${
                stats.populationSize
            }`,
            20,
            70
        );
        ctx.fillText(`Speed: ${this.speedMultiplier}x`, 20, 90);
    }

    // Get the best bird's genome for display or saving
    getBestGenome() {
        return this.population.getBestGenome();
    }
}

export default Neat;
