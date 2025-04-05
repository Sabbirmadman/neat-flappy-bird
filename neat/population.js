import Genome from "./genome.js";

class Population {
    constructor(size = 50) {
        this.size = size;
        this.genomes = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
        this.mutationRate = 0.1; // 10% chance of mutation

        // Create initial population
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

        // Create the rest by selection, crossover, and mutation
        while (newGenomes.length < this.size) {
            // Select a parent based on fitness
            const parent = this.selectGenome();

            // Create a child (copy of parent for now, crossover can be added later)
            const child = parent.copy();

            // Mutate the child
            child.mutate(this.mutationRate);

            // Add to new generation
            newGenomes.push(child);
        }

        // Replace old generation with new one
        this.genomes = newGenomes;
        this.generation++;
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
