// Entry point
window.addEventListener('DOMContentLoaded', () => {
    // Initialize procedural assets
    initTextures();
    initSprites();

    // Create and start game
    const game = new Game();
    game.start();
});
