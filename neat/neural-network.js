class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;

        // Create TensorFlow model
        this.createModel();
    }

    createModel() {
        // Dispose previous model to prevent memory leak
        if (this.model) {
            this.model.dispose();
        }

        // Create sequential model with TensorFlow.js
        this.model = tf.sequential();

        // Add hidden layer
        this.model.add(
            tf.layers.dense({
                units: this.hiddenNodes,
                inputShape: [this.inputNodes],
                activation: "sigmoid",
                kernelInitializer: "randomNormal",
                biasInitializer: "randomNormal",
            })
        );

        // Add output layer
        this.model.add(
            tf.layers.dense({
                units: this.outputNodes,
                activation: "sigmoid",
                kernelInitializer: "randomNormal",
                biasInitializer: "randomNormal",
            })
        );

        // Compile the model
        this.model.compile({
            optimizer: tf.train.adam(0.01),
            loss: "meanSquaredError",
        });
    }

    // Feed forward using TensorFlow
    feedForward(inputs) {
        if (inputs.length !== this.inputNodes) {
            throw new Error(
                `Expected ${this.inputNodes} inputs, got ${inputs.length}`
            );
        }

        // Using tidy to automatically clean up tensors
        return tf.tidy(() => {
            // Convert inputs to a tensor
            const xs = tf.tensor2d([inputs]);

            // Get prediction
            const prediction = this.model.predict(xs);

            // Convert to regular array and return
            return prediction.dataSync();
        });
    }

    // Create a copy of the neural network
    copy() {
        const copy = new NeuralNetwork(
            this.inputNodes,
            this.hiddenNodes,
            this.outputNodes
        );

        // Using tidy to automatically clean up tensors
        tf.tidy(() => {
            // Copy weights from this model to new model
            const weights = this.model.getWeights();
            const weightCopies = weights.map((w) => w.clone());
            copy.model.setWeights(weightCopies);
        });

        return copy;
    }

    // Mutate the network's weights
    mutate(rate) {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            const mutatedWeights = weights.map((tensor) => {
                return tf.tidy(() => {
                    const shape = tensor.shape;
                    const values = tensor.dataSync().slice();

                    for (let i = 0; i < values.length; i++) {
                        if (Math.random() < rate) {
                            if (Math.random() < 0.07) {
                                values[i] = Math.random() * 2 - 1;
                            } else if (Math.random() < 0.13) {
                                values[i] += Math.random() * 0.8 - 0.4;
                            } else {
                                values[i] += Math.random() * 0.2 - 0.1;
                            }
                        }
                    }

                    return tf.tensor(values, shape);
                });
            });

            this.model.setWeights(mutatedWeights);
        });
    }

    // Clean up resources to prevent memory leaks
    dispose() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
    }
}

export default NeuralNetwork;
