class Population {
    constructor(size = 100) {
        this.size = size;
        this.genomes = [];
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
        // Adjust mutation rate for larger populations - less mutation with more genomes
        this.baseMutationRate = 0.2;
        this.mutationRate = Math.max(
            0.05,
            this.baseMutationRate - this.size * 0.0003
        );
        this.initialize();
    }

    initialize() {
        // Dispose old genomes to prevent memory leaks
        this.disposeGenomes();

        this.genomes = [];
        for (let i = 0; i < this.size; i++) {
            // Use global Genome
            this.genomes.push(new window.Genome());
        }
        this.generation = 1;
        this.bestScore = 0;
        this.bestFitness = 0;
    }

    // Dispose all genomes to prevent memory leaks
    disposeGenomes() {
        if (this.genomes) {
            for (const genome of this.genomes) {
                if (genome) genome.dispose();
            }
            this.genomes = [];
        }
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

            // Scale elite count based on population size (1% of population, min 2, max 10)
            const eliteCount = Math.min(
                10,
                Math.max(2, Math.floor(this.size * 0.01))
            );

            // Also keep more top genomes with slight mutation
            const topGenomes = [...this.genomes]
                .sort((a, b) => b.fitness - a.fitness)
                .slice(0, eliteCount);

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

        // Adjust selection pressure based on population size
        const tournamentSize = Math.max(
            3,
            Math.min(20, Math.floor(this.size * 0.1))
        );

        // Create new genomes until we reach the desired population size
        while (newGenomes.length < this.size) {
            // Occasionally introduce completely new genomes to maintain diversity
            if (Math.random() < 0.02 && newGenomes.length < this.size) {
                newGenomes.push(new window.Genome());
                continue;
            }

            const parentA = this.selectGenome(totalFitness, tournamentSize);
            let child;

            if (Math.random() < 0.7 && newGenomes.length < this.size) {
                const parentB = this.selectGenome(totalFitness, tournamentSize);
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
                    newGenomes.push(new window.Genome());
            }
        }

        // Dispose old genomes before replacing them
        this.disposeGenomes();
        this.genomes = newGenomes;
        this.generation++;

        // Adjust mutation rate based on generation and population size
        // Larger populations should use lower mutation rates
        const sizeFactor = Math.max(0.5, Math.min(1.0, 100 / this.size));
        this.mutationRate = Math.max(
            0.05,
            this.baseMutationRate * sizeFactor - this.generation * 0.0005
        );
    }

    crossover(parentA, parentB) {
        const child = new window.Genome();

        // Get neural network from parents
        const brainA = parentA.brain;
        const brainB = parentB.brain;

        // Create new neural network with same architecture
        const childBrain = child.brain;

        // Crossover weights from input to hidden layer
        for (let i = 0; i < brainA.weightsInputHidden.length; i++) {
            for (let j = 0; j < brainA.weightsInputHidden[i].length; j++) {
                // Choose weight from either parent A or B randomly
                childBrain.weightsInputHidden[i][j] =
                    Math.random() < 0.5
                        ? brainA.weightsInputHidden[i][j]
                        : brainB.weightsInputHidden[i][j];
            }
        }

        // Crossover biases for hidden layer
        for (let i = 0; i < brainA.biasesHidden.length; i++) {
            childBrain.biasesHidden[i] =
                Math.random() < 0.5
                    ? brainA.biasesHidden[i]
                    : brainB.biasesHidden[i];
        }

        // Crossover weights from hidden to output layer
        for (let i = 0; i < brainA.weightsHiddenOutput.length; i++) {
            for (let j = 0; j < brainA.weightsHiddenOutput[i].length; j++) {
                childBrain.weightsHiddenOutput[i][j] =
                    Math.random() < 0.5
                        ? brainA.weightsHiddenOutput[i][j]
                        : brainB.weightsHiddenOutput[i][j];
            }
        }

        // Crossover biases for output layer
        for (let i = 0; i < brainA.biasesOutput.length; i++) {
            childBrain.biasesOutput[i] =
                Math.random() < 0.5
                    ? brainA.biasesOutput[i]
                    : brainB.biasesOutput[i];
        }

        return child;
    }

    // Update to pass tournament size as parameter
    selectGenome(totalFitness, tournamentSize = 3) {
        if (totalFitness <= 0 || !this.genomes || this.genomes.length === 0) {
            if (!this.genomes || this.genomes.length === 0) return null;
            return this.genomes[
                Math.floor(Math.random() * this.genomes.length)
            ];
        }

        // Tournament selection - select best from a random subset
        const actualTournamentSize = Math.min(
            tournamentSize,
            this.genomes.length
        );
        let bestInTournament = null;

        for (let i = 0; i < actualTournamentSize; i++) {
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

    // Clean up resources when population is no longer needed
    dispose() {
        this.disposeGenomes();
    }
}

window.Population = Population;
