# Raichi Engine

A 2D game engine demonstration, showcasing various platformer mechanics.

## Features

- 2D Platformer Gameplay
- Player and Enemy Interactions
- Collectable Items (Coins, Life-ups)
- Multiple Enemy Types (Goomba, Turtle/Pumpkin, Bat)
- Shell Mechanics (Kicking, Killing other enemies, Shell-to-shell collision)
- Checkpoint System
- Level Transitions
- Dynamic Cloud Generation
- Basic HUD (Score, Lives, Coins)
- Game State Saving/Loading (via LocalStorage)

## Project Structure

The main source code is located in the `src` directory:

-   `src/core/`: Contains the core engine components. This is the heart of the Raichi Engine, designed to be reusable and independent of specific game logic. Key components include:
    -   `Game`: Manages the main game loop and scenes.
    -   `Scene`: Represents a game level or screen, holding game objects and components.
    -   `Component`: Base class for attaching behaviors and data to game objects.
    -   `Input`: Handles user input (e.g., keyboard, mouse).
    -   `Camera`: Manages the game's viewpoint, scrolling, and coordinate transformations.
    -   `Animator`: Handles sprite-sheet based animations, supporting different orientations (horizontal/vertical), frame rates, and looping.
    -   `AssetLoader`: Responsible for loading game assets like images, audio, and data files.
-   `src/entities/`: Contains generic game entities like `BoxComponent`, `TextComponent`, `ButtonComponent`, `SpriteComponent`. These are general-purpose entities that can be used by the core engine.
-   `src/game/`: Contains game-specific logic for the platformer demo. (Note: This directory is currently co-located for ease of testing and demonstration. It is intended to be separated from the core engine in future developments, allowing the core to be used for different game projects.)
    -   `src/game/constants.ts`: Game-wide constants for the demo.
    -   `src/game/entities/`: Game-specific components for the demo, like `PlayerComponent`, various enemies (`GoombaEnemyComponent`, `TurtleEnemyComponent`, `PumpkinShellComponent`, `BatEnemyComponent`), map elements, and collectables.
    -   `src/game/factories/`: Factory functions for creating level elements for the demo.
    -   `src/game/scenes/`: Different game scenes like `StartScene`, `MainScene`, `DeathScene`, `WinScene`, `LoadingScene`.
    -   `src/game/types/`: TypeScript type definitions, e.g., `MapData`.
    -   `src/game/ui/`: UI controllers like `HUDController`.
    -   `src/game/utils/`: Utility functions, e.g., `gameStateManager`.
    -   `src/game/main.ts`: The main entry point for the game logic.
-   `public/`: Static assets like images and map data.
    -   `public/assets/images/`: Spritesheets for characters, enemies, items.
    -   `public/data/maps/`: JSON files defining level structures.

## Prerequisites

-   Node.js and npm (or yarn)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd raichi-engine
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

## Available Scripts

From `package.json`:

-   **Build the project:**
    ```bash
    npm run build
    ```
    This compiles TypeScript to JavaScript, resolves path aliases, and fixes import extensions.

-   **Start the production server:**
    ```bash
    npm run start
    ```
    This runs the compiled code using a simple Node.js/Express server.

-   **Development mode (watch and rebuild):**
    ```bash
    npm run dev
    ```
    This command watches for file changes, recompiles TypeScript, and restarts the development server automatically.

-   **Run post-compilation steps manually:**
    ```bash
    npm run postcompile
    ```

-   **Start the development server (nodemon):**
    ```bash
    npm run start:server
    ```

-   **Watch and build (without starting server):**
    ```bash
    npm run watch:build
    ```

## How to Play

1.  Run the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:3000` (or the port configured in `dist/server.js`).

### Controls

-   **Move Left:** Left Arrow Key
-   **Move Right:** Right Arrow Key
-   **Jump / Swim Up (Underwater):** Up Arrow Key
-   **Swim Down (Underwater):** Down Arrow Key

## Notes

-   The game uses a simple Express server (see `dist/server.js` after build, or `src/server.ts` before build if it exists) to serve the static files.
-   Map data is loaded from JSON files located in `public/data/maps/`.
-   Game state (current map, score, lives, checkpoint) is saved to browser LocalStorage.
