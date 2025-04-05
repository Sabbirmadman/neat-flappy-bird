class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        // Initialize weights with random values between -1 and 1
        this.weightsIH = this.initializeWeights(
            this.inputNodes,
            this.hiddenNodes
        );
        this.weightsHO = this.initializeWeights(
            this.hiddenNodes,
            this.outputNodes
        );

        // Initialize biases
        this.biasH = Array(this.hiddenNodes)
            .fill()
            .map(() => Math.random() * 2 - 1);
        this.biasO = Array(this.outputNodes)
            .fill()
            .map(() => Math.random() * 2 - 1);
    }

    initializeWeights(rows, cols) {
        // Create a matrix filled with random values between -1 and 1
        let weights = [];
        for (let i = 0; i < rows; i++) {
            weights.push([]);
            for (let j = 0; j < cols; j++) {
                weights[i].push(Math.random() * 2 - 1);
            }
        }
        return weights;
    }

    // Apply the activation function (sigmoid) to a value
    activate(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Feed forward through the neural network
    feedForward(inputs) {
        if (inputs.length !== this.inputNodes) {
            throw new Error(
                `Expected ${this.inputNodes} inputs, got ${inputs.length}`
            );
        }

        // Calculate hidden layer outputs
        let hiddenOutputs = Array(this.hiddenNodes).fill(0);

        for (let i = 0; i < this.hiddenNodes; i++) {
            let sum = this.biasH[i];
            for (let j = 0; j < this.inputNodes; j++) {
                sum += inputs[j] * this.weightsIH[j][i];
            }
            hiddenOutputs[i] = this.activate(sum);
        }

        // Calculate final outputs
        let finalOutputs = Array(this.outputNodes).fill(0);

        for (let i = 0; i < this.outputNodes; i++) {
            let sum = this.biasO[i];
            for (let j = 0; j < this.hiddenNodes; j++) {
                sum += hiddenOutputs[j] * this.weightsHO[j][i];
            }
            finalOutputs[i] = this.activate(sum);
        }

        return finalOutputs;
    }

    // Create a copy of this neural network
    copy() {
        let copy = new NeuralNetwork(
            this.inputNodes,
            this.hiddenNodes,
            this.outputNodes
        );

        // Copy weights and biases
        copy.weightsIH = JSON.parse(JSON.stringify(this.weightsIH));
        copy.weightsHO = JSON.parse(JSON.stringify(this.weightsHO));
        copy.biasH = [...this.biasH];
        copy.biasO = [...this.biasO];

        return copy;
    }

    // Mutate the weights and biases with a given probability
    mutate(rate) {
        const mutateValue = (val) => {
            if (Math.random() < rate) {
                // 5% chance for a completely random weight
                if (Math.random() < 0.05) {
                    return Math.random() * 2 - 1;
                }

                // 10% chance for a larger adjustment
                else if (Math.random() < 0.1) {
                    return val + (Math.random() * 0.8 - 0.4);
                }

                // 85% chance for a small adjustment
                else {
                    return val + (Math.random() * 0.2 - 0.1);
                }
            }
            return val;
        };

        // Mutate input->hidden weights
        for (let i = 0; i < this.inputNodes; i++) {
            for (let j = 0; j < this.hiddenNodes; j++) {
                this.weightsIH[i][j] = mutateValue(this.weightsIH[i][j]);
            }
        }

        // Mutate hidden->output weights
        for (let i = 0; i < this.hiddenNodes; i++) {
            for (let j = 0; j < this.outputNodes; j++) {
                this.weightsHO[i][j] = mutateValue(this.weightsHO[i][j]);
            }
        }

        // Mutate biases
        this.biasH = this.biasH.map(mutateValue);
        this.biasO = this.biasO.map(mutateValue);
    }
}

export default NeuralNetwork;
