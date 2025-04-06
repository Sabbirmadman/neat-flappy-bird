document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const canvas = document.getElementById("game-canvas");
    const humanModeButton = document.getElementById("human-mode-button");
    const aiModeButton = document.getElementById("ai-mode-button");
    const reloadButton = document.getElementById("reload-button");

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
            // For mobile, adjust to fit the screen while maintaining aspect ratio
            const screenWidth = Math.min(window.innerWidth, 800);
            const screenHeight = Math.min(window.innerHeight, 800);

            canvas.width = screenWidth;
            canvas.height = screenHeight;
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

    // Load the background image before initializing the game
    const backgroundImage = new Image();
    backgroundImage.src = "../assets/background.webp";

    let game; // Declare game variable in a higher scope

    backgroundImage.onload = () => {
        console.log("Background image loaded");
        console.log("Creating game instance");
        // Use Game from the global scope
        game = new window.Game(canvas, backgroundImage, isMobile);
        console.log("Game instance created", game);

        // Show instructions
        const ctx = canvas.getContext("2d");
        // Draw background first
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

        if (!isMobile) {
            // Only show instruction text on desktop
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(
                canvas.width / 2 - 180,
                canvas.height / 2 - 60,
                360,
                120
            );
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText(
                "Press SPACE to jump (Human)",
                canvas.width / 2 - 150,
                canvas.height / 2 - 20
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

        // Setup game over monitoring to show reload button
        setInterval(() => {
            if (game && game.isHumanPlaying && game.gameOver) {
                reloadButton.style.display = "block";
            } else {
                reloadButton.style.display = "none";
            }
        }, 100);
    };

    backgroundImage.onerror = () => {
        console.error("Failed to load background image");
        // Initialize game without background image as fallback
        game = new window.Game(canvas, null, isMobile);

        // Show instructions with fallback background
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "skyblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!isMobile) {
            // Only show instruction text on desktop
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(
                canvas.width / 2 - 180,
                canvas.height / 2 - 60,
                360,
                120
            );
            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText(
                "Press SPACE to jump (Human)",
                canvas.width / 2 - 150,
                canvas.height / 2 - 20
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

        // Setup game over monitoring to show reload button
        setInterval(() => {
            if (game && game.isHumanPlaying && game.gameOver) {
                reloadButton.style.display = "block";
            } else {
                reloadButton.style.display = "none";
            }
        }, 100);
    };

    function setupMobileControls() {
        // Handle canvas tap for jumping
        canvas.addEventListener(
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

        // Handle reload button
        reloadButton.addEventListener(
            "touchstart",
            function (e) {
                e.preventDefault();
                if (game && game.isHumanPlaying && game.gameOver) {
                    game.restart();
                    reloadButton.style.display = "none";
                }
            },
            { passive: false }
        );
    }
});
