# Flappy Bird with NEAT AI Implementation

This project implements both a playable version of Flappy Bird and an AI that learns to play the game using the NEAT (NeuroEvolution of Augmenting Topologies) algorithm. This documentation explains the key components and how they work together.

## Part 1: Game Implementation

### Game Architecture

The game follows a traditional HTML5 Canvas implementation using JavaScript for game logic. It consists of:

-   A main game loop
-   Sprite rendering
-   Physics calculations
-   Collision detection
-   User input handling

### Core Game Components

1. **Bird Class**: Manages the player character with properties like position, velocity, and animation state
2. **Pipe System**: Generates and manages obstacles the bird must navigate through
3. **Scoring System**: Tracks player progress
4. **Physics Engine**: Simple gravity and collision implementation
5. **Rendering Loop**: Handles drawing all game elements to the canvas

### Game Controls

The game can be controlled with:

-   Mouse clicks
-   Spacebar presses
-   Touch events on mobile

### Game States

The implementation includes different states:

-   Menu/Start screen
-   Active gameplay
-   Game over screen

## Part 2: AI Implementation

### NEAT Algorithm Overview

The NEAT implementation allows the AI to evolve over time, learning to play the game through generations of neural networks. Key aspects include:

1. **Neural Network Structure**:

    - Input layer: Bird's position, velocity, and distance to pipes
    - Hidden layer(s): Dynamically evolving
    - Output layer: Jump decision (yes/no)

2. **Genetic Algorithm Components**:

    - Population: Multiple neural networks (birds) playing simultaneously
    - Fitness function: Distance traveled/pipes cleared
    - Selection: Best-performing networks are selected for reproduction
    - Crossover: Genetic material from high-performing networks is combined
    - Mutation: Random changes to weights and connections

3. **Evolution Process**:
    - Initial population with random neural network weights
    - Networks play the game and receive fitness scores
    - Top performers breed to create next generation
    - Process repeats with gradually improving performance

### Technical Implementation

The AI implementation includes:

-   Network serialization for saving successful models
-   Visualization tools to observe the neural networks in action
-   Performance metrics to track improvement across generations

### Training Process

The training follows these steps:

1. Initialize population of random networks
2. Let each network control a bird in parallel
3. Calculate fitness based on survival time and pipes passed
4. Select top performers and create offspring
5. Apply mutations to maintain diversity
6. Repeat with new generation

## How to Run

### Play the Game Yourself

1. Open the application
2. Select "Play Game" option
3. Use mouse clicks or spacebar to control the bird

### Watch the AI Learn

1. Select "AI Mode" option
2. Adjust parameters if desired (population size, mutation rate)
3. Start the simulation and observe as the AI improves over generations

### Train Your Own AI

1. Select "Train Mode"
2. Configure training parameters
3. Let the system run until satisfactory performance is achieved
4. Save the trained model for later use

## Technologies Used

-   HTML5 Canvas for rendering
-   JavaScript for game logic
-   NEAT algorithm for AI implementation
-   Local storage for saving high scores and trained models
