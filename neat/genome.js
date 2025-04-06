import NeuralNetwork from "./neural-network.js";

class Genome {
    constructor(inputNodes = 4, hiddenNodes = 8, outputNodes = 1) {
        this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
        this.fitness = 0;
        this.score = 0;
        this.lifespan = 0;
        this.isElite = false;
        this.horizontalDistanceToPipe = undefined;
        this.lastInputs = [];

        // Add jump cooldown properties
        this.lastJumpTime = 0;
        this.jumpCooldown = 15; // frames before allowing another jump
        this.verticalPosition = 0; // Track vertical position for fitness calculation
    }

    copy() {
        let genome = new Genome();
        try {
            // Dispose old brain to prevent memory leak
            genome.brain.dispose();
            genome.brain = this.brain.copy();
        } catch (error) {
            console.error("Error copying genome:", error);
            // Create a fresh brain if copying fails
            genome.brain = new NeuralNetwork(4, 8, 1);
        }
        genome.isElite = this.isElite;
        genome.score = 0;
        genome.lifespan = 0;
        genome.fitness = 0;
        genome.lastJumpTime = 0;
        genome.jumpCooldown = this.jumpCooldown;
        return genome;
    }

    think(inputs) {
        this.lastInputs = [...inputs];
        // Store the vertical position for fitness calculation
        this.verticalPosition = inputs[2]; // vertical distance to top pipe

        // Run inference with TensorFlow
        const output = this.brain.feedForward(inputs);

        // Check if cooldown has elapsed
        const shouldJump = output[0] > 0.5;
        if (shouldJump) {
            // Only allow jumping if cooldown has elapsed
            if (this.lifespan - this.lastJumpTime >= this.jumpCooldown) {
                this.lastJumpTime = this.lifespan;
                return true;
            }
            return false;
        }
        return false;
    }

    mutate(rate) {
        this.brain.mutate(rate);
        // Occasionally mutate the jump cooldown
        if (Math.random() < rate * 0.5) {
            this.jumpCooldown += Math.floor(Math.random() * 7) - 3; // +/- up to 3 frames
            // Keep cooldown within reasonable bounds
            this.jumpCooldown = Math.max(5, Math.min(30, this.jumpCooldown));
        }
    }

    calculateFitness() {
        // Significant reward for passing pipes
        let scoreFitness = this.score * 5;

        // Reward for staying alive
        let lifespanFitness = this.lifespan * 0.1;

        // Reward for positioning near the gap center (up to 3 points)
        let alignmentFitness = (this.distanceToNextPipeGap || 0) * 3;

        // Horizontal progress reward - encourages birds to move forward even if they don't pass a pipe
        let distanceReward = 0;
        if (this.horizontalDistanceToPipe !== undefined) {
            // Higher reward as bird gets closer to the pipe
            distanceReward =
                (1 - Math.max(0, Math.min(1, this.horizontalDistanceToPipe))) *
                2;

            // Bonus for being very close to passing a pipe
            if (this.horizontalDistanceToPipe < 0.1) {
                distanceReward += 1;
            }
        }

        // Penalty for staying at the top of the screen
        let topScreenPenalty = 0;
        if (this.verticalPosition < -0.4) {
            // Apply increasing penalty the closer to the top
            topScreenPenalty = Math.abs(this.verticalPosition + 0.4) * 2;
        }

        this.fitness =
            scoreFitness +
            lifespanFitness +
            alignmentFitness +
            distanceReward -
            topScreenPenalty;

        // Apply bonus multiplier for birds that pass at least one pipe
        if (this.score > 0) {
            this.fitness *= 1 + this.score * 0.1; // Bonus increases with more pipes passed
        }

        // Ensure minimum fitness
        if (this.fitness < 0.1) this.fitness = 0.1;

        return this.fitness;
    }

    // Clean up resources when genome is no longer needed
    dispose() {
        if (this.brain) {
            this.brain.dispose();
        }
    }
}

export default Genome;
