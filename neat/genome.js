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
        genome.brain = this.brain.copy();
        genome.isElite = this.isElite;
        genome.score = 0;
        genome.lifespan = 0;
        genome.fitness = 0;
        return genome;
    }

    think(inputs) {
        this.lastInputs = [...inputs];
        const output = this.brain.feedForward(inputs);
        return output[0] > 0.5;
    }

    mutate(rate) {
        this.brain.mutate(rate);
    }

    calculateFitness() {
        let scoreFitness = this.score * 2;
        let lifespanFitness = this.lifespan * 0.2;
        let distanceFitness = (this.distanceToNextPipeGap || 0) * 3;
        let proximityPenalty = 0;
        if (this.horizontalDistanceToPipe !== undefined) {
            const closeThreshold = 0.15;
            if (this.horizontalDistanceToPipe < closeThreshold) {
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
        if (this.fitness < 0.1) this.fitness = 0.1;
        return this.fitness;
    }
}

export default Genome;
