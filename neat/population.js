import Genome from "./genome.js";

class Population {
    constructor(size = 100) {
        this.size = size;
        this.genomes = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
        this.mutationRate = Math.max(0.08, 0.2 - this.generation * 0.002);
        this.initialize();
    }

    initialize() {
        for (let i = 0; i < this.size; i++) {
            this.genomes.push(new Genome());
        }
    }

    // Evolve the population to create a new generation
    evolve() {
        // Calculate fitness for each genome
        this.calculateFitness();

        // Create new generation
        const newGenomes = [];

        // Keep the best genome (elitism)
        const bestGenome = this.getBestGenome();
        newGenomes.push(bestGenome.copy());

        // Make the best bird's color different to track it
        bestGenome.isElite = true;

        // Create the rest by selection, crossover, and mutation
        while (newGenomes.length < this.size) {
            // 70% chance to perform crossover, 30% chance to just copy a parent
            if (Math.random() < 0.7) {
                // Select two parents based on fitness
                const parentA = this.selectGenome();
                const parentB = this.selectGenome();

                // Create a child by crossing over the parents
                const child = this.crossover(parentA, parentB);

                // Mutate the child
                child.mutate(this.mutationRate);

                // Add to new generation
                newGenomes.push(child);
            } else {
                // Select a parent based on fitness
                const parent = this.selectGenome();

                // Create a child (copy of parent)
                const child = parent.copy();

                // Higher mutation rate when just copying
                child.mutate(this.mutationRate * 1.5);

                // Add to new generation
                newGenomes.push(child);
            }
        }

        // Replace old generation with new one
        this.genomes = newGenomes;
        this.generation++;

        // Adaptive mutation - reduce mutation rate slightly as generations increase
        // but keep it from getting too low
        this.mutationRate = Math.max(0.05, 0.2 - this.generation * 0.005);
    }
    // Perform crossover between two genomes
    crossover(parentA, parentB) {
        // Create a new child genome
        const child = new Genome();

        // Crossover weights from input to hidden layer
        this.crossoverWeights(
            parentA.brain.weightsIH,
            parentB.brain.weightsIH,
            child.brain.weightsIH
        );

        // Crossover weights from hidden to output layer
        this.crossoverWeights(
            parentA.brain.weightsHO,
            parentB.brain.weightsHO,
            child.brain.weightsHO
        );

        // Crossover hidden layer biases
        this.crossoverArray(
            parentA.brain.biasH,
            parentB.brain.biasH,
            child.brain.biasH
        );

        // Crossover output layer biases
        this.crossoverArray(
            parentA.brain.biasO,
            parentB.brain.biasO,
            child.brain.biasO
        );

        return child;
    }

    crossoverWeights(weightsA, weightsB, resultWeights) {
        for (let i = 0; i < weightsA.length; i++) {
            for (let j = 0; j < weightsA[i].length; j++) {
                // 50% chance to inherit from each parent
                resultWeights[i][j] =
                    Math.random() < 0.5 ? weightsA[i][j] : weightsB[i][j];
            }
        }
    }

    // Crossover arrays (like bias arrays)
    crossoverArray(arrayA, arrayB, resultArray) {
        for (let i = 0; i < arrayA.length; i++) {
            // 50% chance to inherit from each parent
            resultArray[i] = Math.random() < 0.5 ? arrayA[i] : arrayB[i];
        }
    }

    // Calculate fitness for all genomes
    calculateFitness() {
        let totalFitness = 0;

        for (const genome of this.genomes) {
            genome.calculateFitness();
            totalFitness += genome.fitness;

            // Track best score and fitness
            if (genome.score > this.bestScore) {
                this.bestScore = genome.score;
            }

            if (genome.fitness > this.bestFitness) {
                this.bestFitness = genome.fitness;
            }
        }

        // Normalize fitness values (turn into probabilities from 0 to 1)
        if (totalFitness > 0) {
            for (const genome of this.genomes) {
                genome.fitness /= totalFitness;
            }
        }
    }

    // Select a genome based on fitness (using roulette wheel selection)
    selectGenome() {
        let random = Math.random();
        let cumulativeProbability = 0;

        for (const genome of this.genomes) {
            cumulativeProbability += genome.fitness;
            if (random <= cumulativeProbability) {
                return genome;
            }
        }

        // Fallback: return a random genome
        return this.genomes[Math.floor(Math.random() * this.genomes.length)];
    }

    // Get the genome with the highest fitness
    getBestGenome() {
        let bestGenome = this.genomes[0];
        let bestFitness = bestGenome.fitness;

        for (let i = 1; i < this.genomes.length; i++) {
            if (this.genomes[i].fitness > bestFitness) {
                bestGenome = this.genomes[i];
                bestFitness = bestGenome.fitness;
            }
        }

        return bestGenome;
    }

    // Get all genomes
    getGenomes() {
        return this.genomes;
    }

    // Get population statistics
    getStats() {
        return {
            generation: this.generation,
            bestScore: this.bestScore,
            bestFitness: this.bestFitness,
            populationSize: this.size,
        };
    }
}

export default Population;
