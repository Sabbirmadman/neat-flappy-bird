class NeuralNetwork {
    constructor(inputNodes, hiddenNodes, outputNodes) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        this.weightsIH = this.initializeWeights(
            this.inputNodes,
            this.hiddenNodes
        );
        this.weightsHO = this.initializeWeights(
            this.hiddenNodes,
            this.outputNodes
        );
        this.biasH = Array(this.hiddenNodes)
            .fill()
            .map(() => Math.random() * 2 - 1);
        this.biasO = Array(this.outputNodes)
            .fill()
            .map(() => Math.random() * 2 - 1);
    }

    initializeWeights(rows, cols) {
        let weights = [];
        for (let i = 0; i < rows; i++) {
            weights.push([]);
            for (let j = 0; j < cols; j++) {
                weights[i].push(Math.random() * 2 - 1);
            }
        }
        return weights;
    }

    activate(x) {
        return 1 / (1 + Math.exp(-x));
    }

    feedForward(inputs) {
        if (inputs.length !== this.inputNodes) {
            throw new Error(
                `Expected ${this.inputNodes} inputs, got ${inputs.length}`
            );
        }

        let hiddenOutputs = Array(this.hiddenNodes).fill(0);

        for (let i = 0; i < this.hiddenNodes; i++) {
            let sum = this.biasH[i];
            for (let j = 0; j < this.inputNodes; j++) {
                sum += inputs[j] * this.weightsIH[j][i];
            }
            hiddenOutputs[i] = this.activate(sum);
        }

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

    copy() {
        let copy = new NeuralNetwork(
            this.inputNodes,
            this.hiddenNodes,
            this.outputNodes
        );
        copy.weightsIH = JSON.parse(JSON.stringify(this.weightsIH));
        copy.weightsHO = JSON.parse(JSON.stringify(this.weightsHO));
        copy.biasH = [...this.biasH];
        copy.biasO = [...this.biasO];
        return copy;
    }

    mutate(rate) {
        const mutateValue = (val) => {
            if (Math.random() < rate) {
                if (Math.random() < 0.07) {
                    return Math.random() * 2 - 1;
                } else if (Math.random() < 0.13) {
                    return val + (Math.random() * 0.8 - 0.4);
                } else {
                    return val + (Math.random() * 0.2 - 0.1);
                }
            }
            return val;
        };

        for (let i = 0; i < this.inputNodes; i++) {
            for (let j = 0; j < this.hiddenNodes; j++) {
                this.weightsIH[i][j] = mutateValue(this.weightsIH[i][j]);
            }
        }

        for (let i = 0; i < this.hiddenNodes; i++) {
            for (let j = 0; j < this.outputNodes; j++) {
                this.weightsHO[i][j] = mutateValue(this.weightsHO[i][j]);
            }
        }

        this.biasH = this.biasH.map(mutateValue);
        this.biasO = this.biasO.map(mutateValue);
    }
}

export default NeuralNetwork;
