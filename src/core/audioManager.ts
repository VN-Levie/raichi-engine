import { AssetLoader } from "./assetLoader";

export class AudioManager {
  private static audioContext: AudioContext | null = null;
  private static masterGainNode: GainNode | null = null;
  private static musicGainNode: GainNode | null = null;
  private static sfxGainNode: GainNode | null = null;

  private static currentMusicSource: AudioBufferSourceNode | null = null;
  private static currentMusicPath: string | null = null;
  private static isMusicLooping: boolean = false;

  private static masterVolume: number = 1.0;
  private static musicVolume: number = 0.5; // Default music volume
  private static sfxVolume: number = 0.7;   // Default SFX volume

  private static initialize(): boolean {
    if (!AudioManager.audioContext) {
      try {
        AudioManager.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        AudioManager.masterGainNode = AudioManager.audioContext.createGain();
        AudioManager.masterGainNode.connect(AudioManager.audioContext.destination);
        AudioManager.masterGainNode.gain.setValueAtTime(AudioManager.masterVolume, AudioManager.audioContext.currentTime);

        AudioManager.musicGainNode = AudioManager.audioContext.createGain();
        AudioManager.musicGainNode.connect(AudioManager.masterGainNode);
        AudioManager.musicGainNode.gain.setValueAtTime(AudioManager.musicVolume, AudioManager.audioContext.currentTime);

        AudioManager.sfxGainNode = AudioManager.audioContext.createGain();
        AudioManager.sfxGainNode.connect(AudioManager.masterGainNode);
        AudioManager.sfxGainNode.gain.setValueAtTime(AudioManager.sfxVolume, AudioManager.audioContext.currentTime);

      } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
        return false;
      }
    }
    if (AudioManager.audioContext && AudioManager.audioContext.state === 'suspended') {
        AudioManager.audioContext.resume();
    }
    return true;
  }

  public static async playMusic(filePath: string, loop: boolean = true): Promise<void> {
    if (!AudioManager.initialize() || !AudioManager.audioContext || !AudioManager.musicGainNode) return;

    if (AudioManager.currentMusicSource && AudioManager.currentMusicPath === filePath) {
      // Music is already playing or was paused, just ensure it's playing
      if (AudioManager.audioContext.state === 'suspended') {
        await AudioManager.audioContext.resume();
      }
      return;
    }
    
    AudioManager.stopMusic(); // Stop any previous music

    try {
      const audioBuffer = await AssetLoader.loadAudioBuffer(filePath); // Changed this line
      if (!audioBuffer) {
        console.error(`Failed to load audio buffer for music: ${filePath}`);
        return;
      }

      AudioManager.currentMusicSource = AudioManager.audioContext.createBufferSource();
      AudioManager.currentMusicSource.buffer = audioBuffer;
      AudioManager.currentMusicSource.loop = loop;
      AudioManager.isMusicLooping = loop;
      AudioManager.currentMusicSource.connect(AudioManager.musicGainNode);
      AudioManager.currentMusicSource.start(0);
      AudioManager.currentMusicPath = filePath;
    } catch (error) {
      console.error(`Error playing music ${filePath}:`, error);
    }
  }

  public static stopMusic(): void {
    if (AudioManager.currentMusicSource) {
      AudioManager.currentMusicSource.stop(0);
      AudioManager.currentMusicSource.disconnect();
      AudioManager.currentMusicSource = null;
      AudioManager.currentMusicPath = null;
    }
  }

  public static async playSound(filePath: string, volume: number = 1): Promise<void> {
    if (!AudioManager.initialize() || !AudioManager.audioContext || !AudioManager.sfxGainNode) return;

    try {
      const audioBuffer = await AssetLoader.loadAudioBuffer(filePath); // Changed this line
       if (!audioBuffer) {
        console.error(`Failed to load audio buffer for sound: ${filePath}`);
        return;
      }

      const sourceNode = AudioManager.audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      
      const soundGainNode = AudioManager.audioContext.createGain();
      soundGainNode.gain.setValueAtTime(volume, AudioManager.audioContext.currentTime);
      soundGainNode.connect(AudioManager.sfxGainNode); // Connect to SFX gain node

      sourceNode.connect(soundGainNode);
      sourceNode.start(0);

      sourceNode.onended = () => {
        sourceNode.disconnect();
        soundGainNode.disconnect();
      };
    } catch (error) {
      console.error(`Error playing sound ${filePath}:`, error);
    }
  }

  public static setMasterVolume(volume: number): void {
    AudioManager.masterVolume = Math.max(0, Math.min(1, volume));
    if (AudioManager.masterGainNode && AudioManager.audioContext) {
      AudioManager.masterGainNode.gain.setValueAtTime(AudioManager.masterVolume, AudioManager.audioContext.currentTime);
    }
  }

  public static getMasterVolume(): number {
    return AudioManager.masterVolume;
  }

  public static setMusicVolume(volume: number): void {
    AudioManager.musicVolume = Math.max(0, Math.min(1, volume));
    if (AudioManager.musicGainNode && AudioManager.audioContext) {
      AudioManager.musicGainNode.gain.setValueAtTime(AudioManager.musicVolume, AudioManager.audioContext.currentTime);
    }
  }

  public static getMusicVolume(): number {
    return AudioManager.musicVolume;
  }

  public static setSfxVolume(volume: number): void {
    AudioManager.sfxVolume = Math.max(0, Math.min(1, volume));
    if (AudioManager.sfxGainNode && AudioManager.audioContext) {
      AudioManager.sfxGainNode.gain.setValueAtTime(AudioManager.sfxVolume, AudioManager.audioContext.currentTime);
    }
  }

  public static getSfxVolume(): number {
    return AudioManager.sfxVolume;
  }

  // Call this on a user interaction to unlock audio context if needed
  public static unlockAudioContext(): void {
    if (AudioManager.audioContext && AudioManager.audioContext.state === 'suspended') {
      AudioManager.audioContext.resume().then(() => {
        console.log("AudioContext resumed successfully.");
      }).catch(e => console.error("Error resuming AudioContext:", e));
    } else if (!AudioManager.audioContext) {
        AudioManager.initialize();
    }
  }
}
