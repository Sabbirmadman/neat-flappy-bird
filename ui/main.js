import Game from "./../game/game.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const canvas = document.getElementById("game-canvas");

    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    console.log("Canvas found, setting dimensions");
    canvas.width = 800;
    canvas.height = 800;

    // Load the background image before initializing the game
    const backgroundImage = new Image();
    backgroundImage.src = "background.webp";

    backgroundImage.onload = () => {
        console.log("Background image loaded");
        console.log("Creating game instance");
        const game = new Game(canvas, backgroundImage);
        console.log("Game instance created", game);

        // Show instructions
        const ctx = canvas.getContext("2d");
        // Draw background first
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
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
        console.log("Instructions drawn");
    };

    backgroundImage.onerror = () => {
        console.error("Failed to load background image");
        // Initialize game without background image as fallback
        const game = new Game(canvas);

        // Show instructions with fallback background
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "skyblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
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
        console.log("Instructions drawn with fallback background");
    };
});
