export interface SavedGameState {
  mapUrl: string;
  respawnX: number;
  respawnY: number;
  score: number;
  lives: number;
  totalCoinsCollected: number;
  timestamp: number;
}

const SAVE_GAME_KEY = "superNarioGameState";

export function saveGameState(state: Omit<SavedGameState, 'timestamp'>): void {
  try {
    const stateWithTimestamp: SavedGameState = { ...state, timestamp: Date.now() };
    localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(stateWithTimestamp));
    console.log("Game state saved:", stateWithTimestamp);
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

export function loadGameState(): SavedGameState | null {
  try {
    const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
    if (savedStateJSON) {
      const state = JSON.parse(savedStateJSON) as SavedGameState;
      console.log("Game state loaded:", state);
      return state;
    }
    return null;
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(SAVE_GAME_KEY);
    console.log("Game state cleared.");
  } catch (error)
    {
    console.error("Error clearing game state:", error);
  }
}
