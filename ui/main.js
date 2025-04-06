document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const canvas = document.getElementById("game-canvas");
    const jumpButton = document.getElementById("jump-button");
    const humanModeButton = document.getElementById("human-mode-button");
    const aiModeButton = document.getElementById("ai-mode-button");
    const orientationWarning = document.getElementById("orientation-warning");

    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    console.log("Canvas found, setting dimensions");

    // Check if we're on a mobile device
    const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

    // Set up canvas dimensions based on device
    function setupCanvasDimensions() {
        if (isMobile) {
            // For mobile, enforce 16:9 aspect ratio
            const screenWidth = Math.min(window.innerWidth, 800);
            const screenHeight = Math.min(window.innerHeight, 800);

            if (window.innerWidth > window.innerHeight) {
                // Landscape mode
                canvas.width = screenHeight * (16 / 9);
                canvas.height = screenHeight;

                // Make sure we don't exceed screen width
                if (canvas.width > window.innerWidth) {
                    canvas.width = screenWidth;
                    canvas.height = screenWidth * (9 / 16);
                }

                orientationWarning.style.display = "none";
            } else {
                // Portrait mode - still use landscape dimensions but show warning
                canvas.width = screenWidth;
                canvas.height = screenWidth * (9 / 16);
                orientationWarning.style.display = "flex";
            }
        } else {
            // Desktop: Square canvas (800x800)
            canvas.width = 800;
            canvas.height = 800;
        }
    }

    // Initial setup
    setupCanvasDimensions();

    // Handle orientation changes
    window.addEventListener("resize", setupCanvasDimensions);
    window.addEventListener("orientationchange", setupCanvasDimensions);

    // Load the background image before initializing the game
    const backgroundImage = new Image();
    backgroundImage.src = "../assets/background.webp";

    let game; // Declare game variable in a higher scope

    backgroundImage.onload = () => {
        console.log("Background image loaded");
        console.log("Creating game instance");
        // Use Game from the global scope
        game = new window.Game(canvas, backgroundImage);
        console.log("Game instance created", game);

        // Show instructions
        const ctx = canvas.getContext("2d");
        // Draw background first
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";

        if (isMobile) {
            ctx.fillText(
                "Tap the JUMP button",
                canvas.width / 2 - 120,
                canvas.height / 2 - 30
            );
            ctx.fillText(
                "Use HUMAN/AI buttons to switch",
                canvas.width / 2 - 170,
                canvas.height / 2 + 20
            );
        } else {
            ctx.fillText(
                "Press SPACE to jump (Human)",
                canvas.width / 2 - 150,
                canvas.height / 2 - 30
            );
            ctx.fillText(
                "Press H/A to switch modes",
                canvas.width / 2 - 150,
                canvas.height / 2 + 20
            );
        }
        console.log("Instructions drawn");

        // Set up mobile controls if on mobile device
        if (isMobile) {
            setupMobileControls();
        }
    };

    backgroundImage.onerror = () => {
        console.error("Failed to load background image");
        // Initialize game without background image as fallback
        game = new window.Game(canvas);

        // Show instructions with fallback background
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "skyblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";

        if (isMobile) {
            ctx.fillText(
                "Tap the JUMP button",
                canvas.width / 2 - 120,
                canvas.height / 2 - 30
            );
            ctx.fillText(
                "Use HUMAN/AI buttons to switch",
                canvas.width / 2 - 170,
                canvas.height / 2 + 20
            );
        } else {
            ctx.fillText(
                "Press SPACE to jump (Human)",
                canvas.width / 2 - 150,
                canvas.height / 2 - 30
            );
            ctx.fillText(
                "Press H/A to switch modes",
                canvas.width / 2 - 150,
                canvas.height / 2 + 20
            );
        }
        console.log("Instructions drawn with fallback background");

        // Set up mobile controls if on mobile device
        if (isMobile) {
            setupMobileControls();
        }
    };

    function setupMobileControls() {
        // Handle jump button
        jumpButton.addEventListener(
            "touchstart",
            function (e) {
                e.preventDefault();
                if (
                    game &&
                    game.isHumanPlaying &&
                    !game.gameOver &&
                    game.canJump
                ) {
                    game.bird.jump();
                    game.canJump = false;

                    if (!game.isRunning) {
                        game.start();
                    }

                    setTimeout(() => {
                        game.canJump = true;
                    }, game.jumpCooldown);
                }
            },
            { passive: false }
        );

        // Handle human mode button
        humanModeButton.addEventListener(
            "touchstart",
            function (e) {
                e.preventDefault();
                if (game) {
                    game.isHumanPlaying = true;
                    game.isAITraining = false;

                    if (game.neat) {
                        game.neat.stopTraining();
                    }

                    game.restart();
                }
            },
            { passive: false }
        );

        // Handle AI mode button
        aiModeButton.addEventListener(
            "touchstart",
            function (e) {
                e.preventDefault();
                if (game) {
                    // Only change if not already in AI mode
                    if (game.isHumanPlaying || !game.isRunning) {
                        game.isHumanPlaying = false;
                        game.gameOver = false;
                        game.isAITraining = true;

                        // Start game if not running
                        if (!game.isRunning) {
                            game.start();
                        }

                        // Clean up old NEAT instance
                        if (game.neat) {
                            game.neat.dispose();
                        }

                        // Create a new NEAT instance
                        game.neat = new window.Neat(
                            game.canvas,
                            game.ground,
                            game.pipeManager,
                            game.populationSize
                        );

                        // Restart to initialize AI
                        game.restart();

                        // Start AI training
                        game.neat.startTraining();
                    }
                }
            },
            { passive: false }
        );
    }
});
