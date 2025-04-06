class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        // Create weights and biases
        this.createModel();
    }

    createModel() {
        // Initialize weights with random values
        this.weightsInputHidden = this.initializeWeights(
            this.inputNodes,
            this.hiddenNodes
        );
        this.biasesHidden = this.initializeWeights(1, this.hiddenNodes)[0];

        this.weightsHiddenOutput = this.initializeWeights(
            this.hiddenNodes,
            this.outputNodes
        );
        this.biasesOutput = this.initializeWeights(1, this.outputNodes)[0];
    }

    initializeWeights(rows, cols) {
        const weights = [];
        for (let i = 0; i < rows; i++) {
            const rowWeights = [];
            for (let j = 0; j < cols; j++) {
                // Random weights between -1 and 1
                rowWeights.push(Math.random() * 2 - 1);
            }
            weights.push(rowWeights);
        }
        return weights;
    }

    // Sigmoid activation function
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Feed forward using pure JavaScript
    feedForward(inputs) {
        if (inputs.length !== this.inputNodes) {
            throw new Error(
                `Expected ${this.inputNodes} inputs, got ${inputs.length}`
            );
        }

        // Calculate hidden layer outputs
        const hiddenOutputs = new Array(this.hiddenNodes).fill(0);
        for (let i = 0; i < this.hiddenNodes; i++) {
            let sum = this.biasesHidden[i];
            for (let j = 0; j < this.inputNodes; j++) {
                sum += inputs[j] * this.weightsInputHidden[j][i];
            }
            hiddenOutputs[i] = this.sigmoid(sum);
        }

        // Calculate final outputs
        const outputs = new Array(this.outputNodes).fill(0);
        for (let i = 0; i < this.outputNodes; i++) {
            let sum = this.biasesOutput[i];
            for (let j = 0; j < this.hiddenNodes; j++) {
                sum += hiddenOutputs[j] * this.weightsHiddenOutput[j][i];
            }
            outputs[i] = this.sigmoid(sum);
        }

        return outputs;
    }

    // Create a copy of the neural network
    copy() {
        const copy = new NeuralNetwork(
            this.inputNodes,
            this.hiddenNodes,
            this.outputNodes
        );

        // Deep copy weights and biases
        copy.weightsInputHidden = JSON.parse(
            JSON.stringify(this.weightsInputHidden)
        );
        copy.biasesHidden = JSON.parse(JSON.stringify(this.biasesHidden));
        copy.weightsHiddenOutput = JSON.parse(
            JSON.stringify(this.weightsHiddenOutput)
        );
        copy.biasesOutput = JSON.parse(JSON.stringify(this.biasesOutput));

        return copy;
    }

    // Mutate the network's weights
    mutate(rate) {
        // Mutate input->hidden weights
        this.mutateMatrix(this.weightsInputHidden, rate);

        // Mutate hidden biases
        this.mutateArray(this.biasesHidden, rate);

        // Mutate hidden->output weights
        this.mutateMatrix(this.weightsHiddenOutput, rate);

        // Mutate output biases
        this.mutateArray(this.biasesOutput, rate);
    }

    mutateMatrix(matrix, rate) {
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (Math.random() < rate) {
                    if (Math.random() < 0.07) {
                        // Completely new random weight
                        matrix[i][j] = Math.random() * 2 - 1;
                    } else if (Math.random() < 0.13) {
                        // Larger adjustment
                        matrix[i][j] += Math.random() * 0.8 - 0.4;
                    } else {
                        // Small adjustment
                        matrix[i][j] += Math.random() * 0.2 - 0.1;
                    }
                }
            }
        }
    }

    mutateArray(array, rate) {
        for (let i = 0; i < array.length; i++) {
            if (Math.random() < rate) {
                if (Math.random() < 0.07) {
                    array[i] = Math.random() * 2 - 1;
                } else if (Math.random() < 0.13) {
                    array[i] += Math.random() * 0.8 - 0.4;
                } else {
                    array[i] += Math.random() * 0.2 - 0.1;
                }
            }
        }
    }

    // No need for dispose method anymore since we're not using TensorFlow
    dispose() {
        // Nothing to dispose in pure JS implementation
    }
}

// Remove export and make globally available
window.NeuralNetwork = NeuralNetwork;
