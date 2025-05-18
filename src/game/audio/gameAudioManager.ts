import { IAudioManager } from "../../core/iAudioManager";
import { AssetLoader } from "../../core/assetLoader";
import { getMusicEnabled, getSfxEnabled } from "../utils/audioSettings";

export class GameAudioManager implements IAudioManager {
    private static instance: GameAudioManager | null = null;

    private audioContext: AudioContext | null = null;
    private masterGainNode: GainNode | null = null;
    private musicGainNode: GainNode | null = null;
    private sfxGainNode: GainNode | null = null;

    private currentMusicSource: AudioBufferSourceNode | null = null;
    private currentMusicPath: string | null = null;
    private currentMusicBuffer: AudioBuffer | null = null;
    private isMusicLooping: boolean = false;
    private musicVolumeBeforePause: number | null = null;

    private masterVolume: number = 1.0;
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.7;

    private constructor() {
        // Private constructor to prevent direct instantiation
    }

    public static getInstance(): GameAudioManager {
        if (!GameAudioManager.instance) {
            GameAudioManager.instance = new GameAudioManager();
            GameAudioManager.instance.initialize(); 
        }
        return GameAudioManager.instance;
    }

    private initialize(): boolean {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                
                this.masterGainNode = this.audioContext.createGain();
                this.masterGainNode.connect(this.audioContext.destination);
                this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);

                this.musicGainNode = this.audioContext.createGain();
                this.musicGainNode.connect(this.masterGainNode);
                this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);

                this.sfxGainNode = this.audioContext.createGain();
                this.sfxGainNode.connect(this.masterGainNode);
                this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);

            } catch (e) {
                console.error("Web Audio API is not supported in this browser", e);
                return false;
            }
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return true;
    }

    public async playMusic(filePath: string, loop: boolean = true): Promise<void> {
        if (!getMusicEnabled()) {
            this.stopMusic(); 
            return;
        }
        if (!this.initialize() || !this.audioContext || !this.musicGainNode) return;

        if (this.currentMusicPath === filePath && this.currentMusicSource && this.musicGainNode.gain.value === 0) {
            const targetVolume = this.musicVolumeBeforePause !== null ? this.musicVolumeBeforePause : this.musicVolume;
            this.musicGainNode.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
            this.musicVolumeBeforePause = null;
            console.log(`Music "${filePath}" resumed by restoring volume to ${targetVolume}`);
            return;
        }

        if (this.currentMusicPath !== filePath || !this.currentMusicSource) {
            this.stopMusic(); 
            try {
                this.currentMusicBuffer = await AssetLoader.loadAudioBuffer(filePath);
                if (!this.currentMusicBuffer) {
                    console.error(`Failed to load audio buffer for music: ${filePath}`);
                    return;
                }

                this.currentMusicSource = this.audioContext.createBufferSource();
                this.currentMusicSource.buffer = this.currentMusicBuffer;
                this.currentMusicSource.loop = loop;
                this.currentMusicSource.connect(this.musicGainNode);
                this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
                this.currentMusicSource.start(0);

                this.currentMusicPath = filePath;
                this.isMusicLooping = loop;
                this.musicVolumeBeforePause = null; 
                console.log(`Playing music: ${filePath}`);
            } catch (error) {
                console.error(`Error playing music ${filePath}:`, error);
            }
        }
    }

    public stopMusic(): void {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.stop(0);
            } catch (e) { /* ignore */ }
            this.currentMusicSource.disconnect();
            this.currentMusicSource = null;
        }
        this.currentMusicBuffer = null;
        this.musicVolumeBeforePause = null;
        // Optionally keep currentMusicPath if resumeMusic should try to replay it after a full stop
        // this.currentMusicPath = null; 
        console.log("Music stopped.");
    }

    public pauseMusic(): void {
        if (this.musicGainNode && this.audioContext && this.currentMusicSource) {
            this.musicVolumeBeforePause = this.musicGainNode.gain.value;
            this.musicGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            console.log("Music paused (volume set to 0).");
        }
    }

    public resumeMusic(): void {
        if (!getMusicEnabled()) return;

        if (this.musicGainNode && this.audioContext && this.currentMusicSource && this.musicVolumeBeforePause !== null) {
            this.musicGainNode.gain.setValueAtTime(this.musicVolumeBeforePause, this.audioContext.currentTime);
            console.log(`Music resumed (volume restored to ${this.musicVolumeBeforePause}).`);
            this.musicVolumeBeforePause = null;
        } else if (this.currentMusicPath) {
            console.log(`Attempting to replay music: ${this.currentMusicPath}`);
            this.playMusic(this.currentMusicPath, this.isMusicLooping);
        }
    }

    public async playSound(filePath: string, volume: number = 1): Promise<void> {
        if (!getSfxEnabled() || !this.initialize() || !this.audioContext || !this.sfxGainNode) return;

        try {
            const audioBuffer = await AssetLoader.loadAudioBuffer(filePath);
            if (!audioBuffer) {
                console.error(`Failed to load audio buffer for sound: ${filePath}`);
                return;
            }

            const sourceNode = this.audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;

            const soundGainNode = this.audioContext.createGain();
            soundGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            soundGainNode.connect(this.sfxGainNode); 

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

    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode && this.audioContext) {
            this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
        }
    }

    public getMasterVolume(): number {
        return this.masterVolume;
    }

    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGainNode && this.audioContext) {
            if (this.musicVolumeBeforePause === null) { // Not paused by setting gain to 0
                this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
            } else { 
                // If paused (gain is 0), update the volume that will be restored on resume
                this.musicVolumeBeforePause = this.musicVolume;
            }
        }
    }

    public getMusicVolume(): number {
        return this.musicVolume;
    }

    public setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGainNode && this.audioContext) {
            this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
        }
    }

    public getSfxVolume(): number {
        return this.sfxVolume;
    }

    public unlockAudioContext(): void {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log("AudioContext resumed successfully.");
            }).catch(e => console.error("Error resuming AudioContext:", e));
        } else if (!this.audioContext) {
            this.initialize();
        }
    }
}
