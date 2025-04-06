import Population from "./population.js";
import Bird from "../game/bird.js";

class Neat {
    constructor(canvas, ground, pipeManager, populationSize = 100) {
        this.canvas = canvas;
        this.ground = ground;
        this.pipeManager = pipeManager;

        // Create population
        this.population = new Population(populationSize);

        // Create birds with brains
        this.birds = [];
        this.createBirds();

        this.isTraining = false;

        // Store the best bird for visualization
        this.bestBird = null;
        this.showNetworkVisualization = true;
    }

    // Toggle network visualization
    toggleVisualization() {
        this.showNetworkVisualization = !this.showNetworkVisualization;
    }

    // Add a method to set the population size
    setPopulationSize(size) {
        // Validate the size
        if (size < 2) size = 2; // Minimum population size
        if (size > 500) size = 500; // Maximum population size to prevent performance issues

        // Create a new population with the given size
        this.population = new Population(size);

        // Recreate birds with the new population size
        this.createBirds();

        // Reset pipes for consistency
        this.pipeManager.reset();

        return size; // Return the actual size used
    }

    createBirds() {
        this.birds = [];
        const genomes = this.population.getGenomes();

        // Find the elite genome (if exists)
        const eliteGenome = genomes.find((g) => g.isElite);
        if (eliteGenome) {
            eliteGenome.isElite = true;
        }

        for (const genome of genomes) {
            const bird = new Bird(this.canvas);
            // Reset bird position to ensure it starts in a good position
            bird.position.y = this.canvas.height / 2;
            bird.velocity = 0;

            bird.brain = genome;
            bird.isDead = false;

            // Make the elite bird a different color
            if (genome === eliteGenome) {
                bird.color = "red";
                this.bestBird = bird; // Track the best bird
            }

            this.birds.push(bird);
        }
    }

    startTraining() {
        // Only start if not already training
        if (!this.isTraining) {
            this.isTraining = true;
            // Reset birds to make sure they start properly
            this.createBirds();
            // Don't reset pipes here as it's already done in the game's restart method
        }
    }

    stopTraining() {
        this.isTraining = false;
    }

    update(currentTime) {
        if (!this.isTraining) return;

        // Get the nearest pipe for input
        let nearestPipe = this.pipeManager.getNearestPipe();

        // Check if all birds are dead
        let allDead = true;
        let activeBirds = 0;

        // Update each bird
        for (let i = 0; i < this.birds.length; i++) {
            const bird = this.birds[i];

            if (!bird.isDead) {
                allDead = false;
                activeBirds++;
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
                    // Calculate normalized horizontal distance (0 to 1)
                    const horizontalDistance = Math.max(
                        0,
                        Math.min(
                            1,
                            (nearestPipe.position.x - bird.position.x) /
                                (this.canvas.width * 0.5)
                        )
                    );

                    // Store for fitness calculation
                    bird.brain.horizontalDistanceToPipe = horizontalDistance;

                    // Normalize velocity to range -1 to 1
                    const normalizedVelocity = bird.velocity / 10;

                    // Calculate vertical distances to pipes
                    const verticalDistanceToTopPipe =
                        (bird.position.y - nearestPipe.gapPosition) /
                        this.canvas.height;
                    const verticalDistanceToBottomPipe =
                        (nearestPipe.gapPosition +
                            nearestPipe.gap -
                            bird.position.y) /
                        this.canvas.height;

                    // Calculate distance to gap center
                    const gapCenterY =
                        nearestPipe.gapPosition + nearestPipe.gap / 2;
                    const distanceToGapCenter =
                        (bird.position.y - gapCenterY) /
                        (this.canvas.height / 2);

                    const inputs = [
                        horizontalDistance,
                        normalizedVelocity,
                        verticalDistanceToTopPipe,
                        verticalDistanceToBottomPipe,
                    ];

                    // Store normalized distance to gap center (1 = perfect alignment, 0 = furthest away)
                    const verticalDistToGapCenter =
                        Math.abs(bird.position.y - gapCenterY) /
                        this.canvas.height;
                    bird.brain.distanceToNextPipeGap =
                        1 - verticalDistToGapCenter;

                    // Let the bird's brain think and decide
                    if (bird.brain.think(inputs)) {
                        bird.jump();
                    }

                    // Track how many frames this bird has lived
                    bird.brain.lifespan++;
                }

                // Update score
                bird.brain.score = this.pipeManager.getScore();

                // Update fitness in real-time for better selection
                bird.brain.calculateFitness();
            }
        }

        // Update best bird tracking
        const aliveBirds = this.birds.filter((b) => !b.isDead);
        if (aliveBirds.length > 0) {
            // Find the bird with the best fitness among the alive ones
            this.bestBird = aliveBirds.reduce((best, bird) => {
                return bird.brain.fitness > best.brain.fitness ? bird : best;
            }, aliveBirds[0]);
        }

        // If all birds are dead, evolve to the next generation
        if (allDead) {
            this.evolve();
        }
    }

    evolve() {
        // Calculate final fitness for all birds before evolution
        for (const bird of this.birds) {
            bird.brain.calculateFitness();
        }

        // Evolve the population
        this.population.evolve();

        // Reset pipes
        this.pipeManager.reset();

        // Create new birds with evolved brains
        this.createBirds();
    }

    draw(ctx) {
        // Only draw birds within the canvas view
        for (const bird of this.birds) {
            if (
                !bird.isDead &&
                bird.position.x > -bird.radius &&
                bird.position.x < this.canvas.width + bird.radius &&
                bird.position.y < this.canvas.height + bird.radius
            ) {
                bird.draw(ctx);
            }
        }

        // Draw stats
        const stats = this.population.getStats();

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 240, 80);

        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(`Generation: ${stats.generation}`, 20, 30);
        ctx.fillText(`Best Score: ${stats.bestScore}`, 20, 50);
        ctx.fillText(
            `Birds Alive: ${this.birds.filter((b) => !b.isDead).length}/${
                stats.populationSize
            }`,
            20,
            70
        );

        // Draw network visualization if enabled and there's a best bird
        if (
            this.showNetworkVisualization &&
            this.bestBird &&
            !this.bestBird.isDead
        ) {
            this.drawNetworkVisualization(ctx);
        }
    }

    drawNetworkVisualization(ctx) {
        if (
            !this.bestBird ||
            !this.bestBird.brain ||
            !this.bestBird.brain.lastInputs
        )
            return;

        const inputs = this.bestBird.brain.lastInputs;
        const visualX = this.canvas.width - 180;
        const visualY = this.canvas.height - 300;
        const width = 180;
        const height = 200;

        // Draw background
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(visualX, visualY, width, height);

        // Draw title
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText("Neural Network Inputs:", visualX + 10, visualY + 20);

        // Input labels
        const labels = [
            "Dis to pipe:",
            "Bird velocity:",
            "Dis to top pipe:",
            "Dis to btm pipe:",
        ];

        // Draw input values with bars
        const barWidth = 100;
        const barHeight = 10;

        for (let i = 0; i < inputs.length; i++) {
            const y = visualY + 40 + i * 30;

            // Draw label
            ctx.fillStyle = "white";
            ctx.fillText(labels[i], visualX + 10, y);

            // Draw bar background
            ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
            ctx.fillRect(visualX + 10, y + 5, barWidth, barHeight);

            // Map normalized values to colors
            let value = inputs[i];

            // Clamp value between 0 and 1 for visualization
            const clampedValue = Math.max(0, Math.min(1, value + 0.5));

            // Color based on value (red to green)
            let r, g;
            if (clampedValue < 0.5) {
                r = 255;
                g = Math.floor(clampedValue * 2 * 255);
            } else {
                r = Math.floor((1 - clampedValue) * 2 * 255);
                g = 255;
            }

            // Draw filled bar
            ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
            ctx.fillRect(
                visualX + 10,
                y + 5,
                barWidth * clampedValue,
                barHeight
            );

            // Draw value text
            ctx.fillStyle = "white";
            ctx.fillText(value.toFixed(2), visualX + barWidth + 20, y + 15);
        }

        // Draw fitness and gap distance
        ctx.fillStyle = "white";
        ctx.fillText(
            `Current Fitness: ${this.bestBird.brain.fitness.toFixed(2)}`,
            visualX + 10,
            visualY + height - 40
        );

        // Add gap distance
        if (this.bestBird.brain.distanceToNextPipeGap !== undefined) {
            ctx.fillText(
                `Gap Alignment: ${(
                    this.bestBird.brain.distanceToNextPipeGap * 100
                ).toFixed(0)}%`,
                visualX + 10,
                visualY + height - 20
            );
        }
    }

    // Get the best bird's genome for display or saving
    getBestGenome() {
        return this.population.getBestGenome();
    }
}

export default Neat;
