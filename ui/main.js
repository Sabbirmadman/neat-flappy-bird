import Game from "./../game/game.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const canvas = document.getElementById("game-canvas");

    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    console.log("Canvas found, setting dimensions");
    canvas.width = 1200;
    canvas.height = 800;

    console.log("Creating game instance");
    const game = new Game(canvas);
    console.log("Game instance created", game);

    // Show instructions
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
    console.log("Instructions drawn");
});
