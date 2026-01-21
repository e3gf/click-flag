import { changeMusicPlaying, stopMusicPlaying } from "../utils/settingsUtils.js";

export class AudioManager {
    constructor() {
        this.context = null;

        this.buffers = new Map();

        this.musicGain = null;
        this.sfxGain = null;

        this.sfxCooldowns = new Map();
        this.SFX_COOLDOWN_MS = 100;

        this.musicPlaylist = [];
        this.lastMusicName = null;
        this.currentMusic = null;
    }

    init(volumeData) {
        if (this.context) return;

        this.context = new window.AudioContext();

        this.musicGain = this.context.createGain();
        this.sfxGain = this.context.createGain();

        this.musicGain.connect(this.context.destination);
        this.sfxGain.connect(this.context.destination);

        this.musicGain.gain.value = volumeData.musicVolume / 100;
        this.sfxGain.gain.value = volumeData.sfxVolume / 100;
    }

    async loadSound(name, url) {
        if (this.buffers.has(name)) return;

        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

        this.buffers.set(name, audioBuffer);
    }

    playSFX(name, delayMS = this.SFX_COOLDOWN_MS, { volume = 1, playbackRate = 1 } = {}) {
        if (this.sfxGain.gain.value === 0) return;

        const now = performance.now();
        const lastPlayed = this.sfxCooldowns.get(name) ?? 0;

        if (now - lastPlayed < delayMS) return;
        this.sfxCooldowns.set(name, now);

        const buffer = this.buffers.get(name);
        if (!buffer) return;

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRate;

        const gain = this.context.createGain();
        gain.gain.value = volume;

        source.connect(gain);
        gain.connect(this.sfxGain);

        source.start();
    }

    setMusicPlaylist(names) {
        this.musicPlaylist = [...names];
    }

    playRandomMusic({ fadeIn = 0 } = {}) {
        if (this.musicGain.gain.value === 0) return;
        if (this.musicPlaylist.length === 0) return;

        let candidates = this.musicPlaylist;

        if (this.musicPlaylist.length > 1 && this.lastMusicName) {
            candidates = this.musicPlaylist.filter(
                name => name !== this.lastMusicName
            );
        }

        const name =
            candidates[Math.floor(Math.random() * candidates.length)];

        this.playMusic(name, { fadeIn });
    }

    playMusic(name, { fadeIn = 0 } = {}) {
        const buffer = this.buffers.get(name);
        if (!buffer) return;

        this.stopMusic();

        changeMusicPlaying(name);

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = false;

        const gain = this.context.createGain();
        gain.gain.value = 0;

        source.connect(gain);
        gain.connect(this.musicGain);

        source.start();

        if (fadeIn > 0) {
            gain.gain.linearRampToValueAtTime(
                1,
                this.context.currentTime + fadeIn
            );
        } else {
            gain.gain.value = 1;
        }

        source.onended = () => {
            if (this.currentMusic?.source === source) {
                this.lastMusicName = name;
                this.currentMusic = null;
                this.playRandomMusic();
            }
        };

        this.currentMusic = { source, gain };
    }

    stopMusic({ fadeOut = 0 } = {}) {
        if (!this.currentMusic) return;

        stopMusicPlaying();
        const { source, gain } = this.currentMusic;

        if (fadeOut > 0) {
            gain.gain.linearRampToValueAtTime(
                0,
                this.context.currentTime + fadeOut
            );
            source.stop(this.context.currentTime + fadeOut);
        } else {
            source.stop();
        }

        this.currentMusic = null;
    }

    setMusicVolume(value) {
        this.musicGain.gain.value = value;
    }

    setSFXVolume(value) {
        this.sfxGain.gain.value = value;
    }
}
