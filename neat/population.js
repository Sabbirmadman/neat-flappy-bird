import Genome from "./genome.js";

class Population {
    constructor(size = 100) {
        this.size = size;
        this.genomes = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
        // Lower initial mutation rate and slower decay
        this.mutationRate = Math.max(0.1, 0.2 - this.generation * 0.001);
        this.initialize();
    }

    initialize() {
        this.genomes = [];
        for (let i = 0; i < this.size; i++) {
            this.genomes.push(new Genome());
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
    }

    evolve() {
        let totalFitness = 0;
        let currentMaxFitness = 0;
        let currentBestGenome = null;

        for (const genome of this.genomes) {
            genome.calculateFitness();
            totalFitness += genome.fitness;
            if (genome.score > this.bestScore) {
                this.bestScore = genome.score;
            }
            if (genome.fitness > currentMaxFitness) {
                currentMaxFitness = genome.fitness;
                currentBestGenome = genome;
            }
        }
        if (currentMaxFitness > this.bestFitness) {
            this.bestFitness = currentMaxFitness;
        }

        const newGenomes = [];
        // Preserve more of the best genomes (elitism)
        if (currentBestGenome && this.genomes.length > 0) {
            // Keep the very best genome without any mutation
            const eliteCopy = currentBestGenome.copy();
            eliteCopy.isElite = true;
            newGenomes.push(eliteCopy);

            // Also keep 2-3 more top genomes with slight mutation
            const topGenomes = [...this.genomes]
                .sort((a, b) => b.fitness - a.fitness)
                .slice(0, 3);
            for (
                let i = 1;
                i < topGenomes.length && newGenomes.length < this.size;
                i++
            ) {
                if (topGenomes[i] && topGenomes[i].fitness > 0) {
                    const topCopy = topGenomes[i].copy();
                    topCopy.mutate(this.mutationRate * 0.3); // Much lower mutation for top performers
                    newGenomes.push(topCopy);
                }
            }
        } else if (this.genomes.length > 0) {
            console.warn("No best genome identified for elitism.");
        }

        while (newGenomes.length < this.size) {
            if (Math.random() < 0.02 && newGenomes.length < this.size) {
                newGenomes.push(new Genome());
                continue;
            }

            const parentA = this.selectGenome(totalFitness);
            let child;

            if (Math.random() < 0.7 && newGenomes.length < this.size) {
                const parentB = this.selectGenome(totalFitness);
                if (parentA && parentB) {
                    child = this.crossover(parentA, parentB);
                    child.mutate(this.mutationRate);
                    newGenomes.push(child);
                } else {
                    console.warn(
                        "Skipping crossover due to missing parent(s)."
                    );
                }
            } else if (parentA) {
                child = parentA.copy();
                child.mutate(this.mutationRate * 1.5);
                newGenomes.push(child);
            } else {
                console.warn(
                    "Skipping single parent mutation due to missing parent."
                );
                if (newGenomes.length < this.size)
                    newGenomes.push(new Genome());
            }
        }

        this.genomes = newGenomes;
        this.generation++;
        // Slower decay of mutation rate
        this.mutationRate = Math.max(0.05, 0.2 - this.generation * 0.001);
    }

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

    // Improved selection method using tournament selection
    selectGenome(totalFitness) {
        if (totalFitness <= 0 || !this.genomes || this.genomes.length === 0) {
            if (!this.genomes || this.genomes.length === 0) return null;
            return this.genomes[
                Math.floor(Math.random() * this.genomes.length)
            ];
        }

        // Tournament selection - select best from a random subset
        const tournamentSize = Math.max(
            3,
            Math.floor(this.genomes.length * 0.1)
        );
        let bestInTournament = null;

        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.genomes.length);
            const candidate = this.genomes[randomIndex];

            if (
                !bestInTournament ||
                candidate.fitness > bestInTournament.fitness
            ) {
                bestInTournament = candidate;
            }
        }

        return bestInTournament;
    }

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

    getGenomes() {
        return this.genomes;
    }

    getStats() {
        const currentBestScore = this.genomes.reduce(
            (max, g) => Math.max(max, g.score),
            0
        );

        return {
            generation: this.generation,
            bestScore: Math.max(this.bestScore, currentBestScore),
            bestFitness: this.bestFitness,
            populationSize: this.size,
        };
    }
}

export default Population;
