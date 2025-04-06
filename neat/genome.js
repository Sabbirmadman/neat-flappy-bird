import NeuralNetwork from "./neural-network.js";

class Genome {
    constructor(inputNodes = 4, hiddenNodes = 8, outputNodes = 1) {
        this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
        this.fitness = 0;
        this.score = 0;
        this.lifespan = 0; // How long the bird has been alive
        this.isElite = false; // Flag for the elite bird
        this.horizontalDistanceToPipe = undefined; // Track distance to pipe for penalty

        // Store the last inputs for visualization
        this.lastInputs = [];
    }

    // Create a copy of this genome
    copy() {
        let genome = new Genome();
        genome.brain = this.brain.copy();
        genome.isElite = this.isElite; // Copy elite status but reset other stats
        genome.score = 0;
        genome.lifespan = 0;
        genome.fitness = 0;
        return genome;
    }

    // Calculate the bird's decision based on inputs
    think(inputs) {
        // Store inputs for visualization
        this.lastInputs = [...inputs];

        const output = this.brain.feedForward(inputs);
        return output[0] > 0.5; // Jump if output is greater than 0.5
    }

    // Mutate the genome's brain
    mutate(rate) {
        this.brain.mutate(rate);
    }

    // Calculate fitness score based on score and lifespan
    calculateFitness() {
        let scoreFitness = this.score * 2;
        let lifespanFitness = this.lifespan * 0.2;
        let distanceFitness = (this.distanceToNextPipeGap || 0) * 3;

        // Add proximity penalty
        // This will be a negative value if the bird is too close to a pipe
        let proximityPenalty = 0;
        if (this.horizontalDistanceToPipe !== undefined) {
            // Apply penalty only when bird gets very close to pipe (less than 15% of canvas width)
            const closeThreshold = 0.15;
            if (this.horizontalDistanceToPipe < closeThreshold) {
                // Quadratic penalty that increases sharply as the bird gets closer
                // Maximum penalty at 0 distance would be -2
                proximityPenalty =
                    -2 *
                    Math.pow(
                        1 - this.horizontalDistanceToPipe / closeThreshold,
                        2
                    );
            }
        }

        this.fitness =
            scoreFitness + lifespanFitness + distanceFitness + proximityPenalty;

        // Ensure minimum fitness is positive
        if (this.fitness < 0.1) this.fitness = 0.1;

        return this.fitness;
    }
}

export default Genome;
