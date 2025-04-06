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
        return genome;
    }

    think(inputs) {
        this.lastInputs = [...inputs];
        // Run inference with TensorFlow
        const output = this.brain.feedForward(inputs);
        return output[0] > 0.5;
    }

    mutate(rate) {
        this.brain.mutate(rate);
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

        this.fitness =
            scoreFitness + lifespanFitness + alignmentFitness + distanceReward;

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
