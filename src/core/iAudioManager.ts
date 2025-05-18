export interface IAudioManager {
  playMusic(filePath: string, loop?: boolean): Promise<void>;
  stopMusic(): void;
  pauseMusic(): void;
  resumeMusic(): void;
  playSound(filePath: string, volume?: number): Promise<void>;
  
  setMasterVolume(volume: number): void;
  getMasterVolume(): number;
  setMusicVolume(volume: number): void;
  getMusicVolume(): number;
  setSfxVolume(volume: number): void;
  getSfxVolume(): number;

  unlockAudioContext(): void;
}
