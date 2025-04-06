import Genome from "./genome.js";

class Population {
    constructor(size = 100) {
        this.size = size;
        this.genomes = [];
        this.generation = 1;
        this.bestScore = 0; // Tracks highest score achieved
        this.bestFitness = 0; // Tracks highest raw fitness achieved
        this.mutationRate = Math.max(0.1, 0.25 - this.generation * 0.002);
        this.initialize();
    }

    initialize() {
        this.genomes = []; // Clear existing genomes if any
        for (let i = 0; i < this.size; i++) {
            this.genomes.push(new Genome());
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
    }

    // Evolve the population to create a new generation
    evolve() {
        // 1. Calculate raw fitness for all genomes and find the total
        let totalFitness = 0;
        let currentMaxFitness = 0;
        let currentBestGenome = null;

        for (const genome of this.genomes) {
            genome.calculateFitness(); // Calculate and store raw fitness
            totalFitness += genome.fitness;

            // Track the best score seen in this generation
            if (genome.score > this.bestScore) {
                this.bestScore = genome.score;
            }
            // Track the best raw fitness and the corresponding genome IN THIS generation
            if (genome.fitness > currentMaxFitness) {
                currentMaxFitness = genome.fitness;
                currentBestGenome = genome;
            }
        }
        // Update the overall best fitness tracking
        if (currentMaxFitness > this.bestFitness) {
            this.bestFitness = currentMaxFitness;
        }

        // Create new generation array
        const newGenomes = [];

        // --- Refined Elitism: Keep the best, but mutate its copy slightly ---
        if (currentBestGenome && this.genomes.length > 0) {
            // Ensure there is a best genome
            const eliteCopy = currentBestGenome.copy(); // Create a copy
            const eliteMutationRate = 0.02; // Define a small mutation rate for the elite (e.g., 2%)
            eliteCopy.mutate(eliteMutationRate); // Mutate the copy slightly
            eliteCopy.isElite = true; // Mark the copy as elite for tracking/coloring
            newGenomes.push(eliteCopy); // Add the potentially mutated elite copy

            // Optional: Mark the original best in the outgoing generation for visualization before it's replaced
            // currentBestGenome.isElite = true;
        } else if (this.genomes.length > 0) {
            // Fallback if no best found (e.g., all fitness zero), add a random one? Or skip elitism?
            // For simplicity, let's skip elitism if no best is clearly identifiable.
            console.warn("No best genome identified for elitism.");
        }
        // --- End Refined Elitism ---

        // Fill the rest of the population using selection, crossover, and mutation
        while (newGenomes.length < this.size) {
            // Small chance to add a completely new random genome (optional diversity boost)
            if (Math.random() < 0.02 && newGenomes.length < this.size) {
                // e.g., 2% chance
                newGenomes.push(new Genome());
                continue; // Skip selection/crossover for this one
            }

            // Select parent(s) using roulette wheel on raw fitness
            const parentA = this.selectGenome(totalFitness);
            let child;

            // Decide between crossover and mutation of a single parent
            if (Math.random() < 0.7 && newGenomes.length < this.size) {
                // Crossover
                const parentB = this.selectGenome(totalFitness);
                if (parentA && parentB) {
                    // Ensure parents were selected
                    child = this.crossover(parentA, parentB);
                    child.mutate(this.mutationRate); // Normal mutation rate
                    newGenomes.push(child);
                } else {
                    console.warn(
                        "Skipping crossover due to missing parent(s)."
                    );
                }
            } else if (parentA) {
                // Copy and mutate single parent
                child = parentA.copy();
                child.mutate(this.mutationRate * 1.5); // Higher mutation rate for copies
                newGenomes.push(child);
            } else {
                console.warn(
                    "Skipping single parent mutation due to missing parent."
                );
                // Could add a random genome here as a fallback if selection fails often
                if (newGenomes.length < this.size)
                    newGenomes.push(new Genome());
            }
        }

        // Replace old generation with new one
        this.genomes = newGenomes;
        this.generation++;

        // Adaptive mutation rate adjustment
        this.mutationRate = Math.max(0.08, 0.2 - this.generation * 0.003); // Example adjustment
    }

    // Perform crossover between two genomes (No changes needed here)
    crossover(parentA, parentB) {
        const child = new Genome();
        this.crossoverWeights(
            parentA.brain.weightsIH,
            parentB.brain.weightsIH,
            child.brain.weightsIH
        );
        this.crossoverWeights(
            parentA.brain.weightsHO,
            parentB.brain.weightsHO,
            child.brain.weightsHO
        );
        this.crossoverArray(
            parentA.brain.biasH,
            parentB.brain.biasH,
            child.brain.biasH
        );
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
                resultWeights[i][j] =
                    Math.random() < 0.5 ? weightsA[i][j] : weightsB[i][j];
            }
        }
    }

    crossoverArray(arrayA, arrayB, resultArray) {
        for (let i = 0; i < arrayA.length; i++) {
            resultArray[i] = Math.random() < 0.5 ? arrayA[i] : arrayB[i];
        }
    }

    // Removed the old calculateFitness method - fitness calculation is now done inside evolve() using genome.calculateFitness()

    // Select a genome based on raw fitness (roulette wheel selection)
    // Accepts totalFitness pre-calculated in evolve()
    selectGenome(totalFitness) {
        if (totalFitness <= 0 || !this.genomes || this.genomes.length === 0) {
            // Handle cases where selection is not possible (e.g., all zero fitness)
            // Return a random genome as a fallback
            if (!this.genomes || this.genomes.length === 0) return null; // Cannot select if empty
            //console.warn("Total fitness zero or negative, selecting random genome.");
            return this.genomes[
                Math.floor(Math.random() * this.genomes.length)
            ];
        }

        // Select a random value proportional to total fitness
        let random = Math.random() * totalFitness;
        let cumulativeFitness = 0;

        for (const genome of this.genomes) {
            cumulativeFitness += genome.fitness; // Accumulate raw fitness
            if (random <= cumulativeFitness) {
                return genome; // Return the selected genome
            }
        }

        // Fallback: Should ideally not be reached if totalFitness > 0.
        // Could happen due to floating point inaccuracies. Return the last one or best?
        // Returning the last one is common practice here.
        // console.warn("Roulette wheel selection fallback triggered.");
        return this.genomes[this.genomes.length - 1];
    }

    // Get the genome with the highest raw fitness (No changes needed)
    getBestGenome() {
        if (!this.genomes || this.genomes.length === 0) return null;

        let bestGenome = this.genomes[0];
        for (let i = 1; i < this.genomes.length; i++) {
            if (this.genomes[i].fitness > bestGenome.fitness) {
                bestGenome = this.genomes[i];
            }
        }
        return bestGenome;
    }

    // Get all genomes (No changes needed)
    getGenomes() {
        return this.genomes;
    }

    // Get population statistics (No changes needed, bestFitness now reflects raw fitness)
    getStats() {
        // Find the best score among the current genomes for accurate display
        const currentBestScore = this.genomes.reduce(
            (max, g) => Math.max(max, g.score),
            0
        );

        return {
            generation: this.generation,
            bestScore: Math.max(this.bestScore, currentBestScore), // Show highest score ever or current gen max
            bestFitness: this.bestFitness, // Show highest raw fitness ever achieved
            populationSize: this.size,
        };
    }
}

export default Population;
