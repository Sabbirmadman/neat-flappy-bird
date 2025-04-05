import NeuralNetwork from "./neural-network.js";

class Genome {
    constructor(inputNodes = 4, hiddenNodes = 10, outputNodes = 1) {
        this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
        this.fitness = 0;
        this.score = 0;
        this.lifespan = 0; // How long the bird has been alive
        this.isElite = false; // Flag for the elite bird

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
        // Heavily reward scoring points
        let scoreFitness = Math.pow(2, this.score);

        // Reward staying alive
        let lifespanFitness = this.lifespan / 50;

        // Combine rewards, with much more emphasis on scoring
        this.fitness = scoreFitness + lifespanFitness;

        // Ensure positive fitness
        if (this.fitness < 0.1) this.fitness = 0.1;

        return this.fitness;
    }
}

export default Genome;
