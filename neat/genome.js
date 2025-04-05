import NeuralNetwork from "./neural-network.js";

class Genome {
    constructor(inputNodes = 5, hiddenNodes = 8, outputNodes = 1) {
        this.brain = new NeuralNetwork(inputNodes, hiddenNodes, outputNodes);
        this.fitness = 0;
        this.score = 0;
        this.lifespan = 0; // How long the bird has been alive
    }

    // Create a copy of this genome
    copy() {
        let genome = new Genome();
        genome.brain = this.brain.copy();
        return genome;
    }

    // Calculate the bird's decision based on inputs
    think(inputs) {
        const output = this.brain.feedForward(inputs);
        return output[0] > 0.5; // Jump if output is greater than 0.5
    }

    // Mutate the genome's brain
    mutate(rate) {
        this.brain.mutate(rate);
    }

    // Calculate fitness score based on score and lifespan
    calculateFitness() {
        // Score is the primary factor, but we also consider lifespan to reward birds
        // that survive longer even with the same score
        this.fitness = this.score * 10 + this.lifespan / 20;
        return this.fitness;
    }
}

export default Genome;
