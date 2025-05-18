import { GameAudioManager } from "../audio/gameAudioManager";

const MUSIC_KEY = "musicEnabled";
const SFX_KEY = "sfxEnabled";

export function getMusicEnabled(): boolean {
    const val = localStorage.getItem(MUSIC_KEY);
    return val === null ? true : val === "true";
}

export function setMusicEnabled(enabled: boolean) {
    localStorage.setItem(MUSIC_KEY, enabled ? "true" : "false");
    if (!enabled) {
        GameAudioManager.getInstance().stopMusic(); // Fully stop music if disabled
    } else {
        GameAudioManager.getInstance().resumeMusic();
    }
}

export function getSfxEnabled(): boolean {
    const val = localStorage.getItem(SFX_KEY);
    return val === null ? true : val === "true";
}

export function setSfxEnabled(enabled: boolean) {
    localStorage.setItem(SFX_KEY, enabled ? "true" : "false");
    // If SFX are disabled, new sounds won't play. No need to stop currently playing one-shot SFX.
}
