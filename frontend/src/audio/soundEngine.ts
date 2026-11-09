/**
 * Web Audio API procedural sound synthesizer for SLAP MY ENEMY: BANGLADESH EDITION.
 * 100% self-contained, zero network latency, custom synthesized sound effects and
 * authentic Bangladeshi scenario ambient audio generators.
 */

import type { ScenarioId } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private sfxVolume: number = 0.8;
  private musicEnabled: boolean = false;
  private musicVolume: number = 0.4;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  // Ambience
  private ambienceEnabled: boolean = true;
  private ambienceVolume: number = 0.45;
  private ambienceGain: GainNode | null = null;
  private isAmbiencePlaying: boolean = false;
  private currentScenario: ScenarioId = 'dhaka-street';
  private ambienceInterval: ReturnType<typeof setInterval> | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      if (this.isMusicPlaying) this.stopMusic();
      if (this.isAmbiencePlaying) this.stopAmbience();
    } else {
      if (this.ambienceEnabled) this.startAmbience(this.currentScenario);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
    }
  }

  public setAmbienceVolume(vol: number) {
    this.ambienceVolume = Math.max(0, Math.min(1, vol));
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setValueAtTime(this.ambienceVolume * 0.2, this.ctx.currentTime);
    }
  }

  public toggleAmbience(enable?: boolean) {
    this.ambienceEnabled = enable !== undefined ? enable : !this.ambienceEnabled;
    if (this.ambienceEnabled) {
      this.startAmbience(this.currentScenario);
    } else {
      this.stopAmbience();
    }
    return this.ambienceEnabled;
  }

  // --- Cartoon Action Sound Effects ---

  public playSlap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // High snap noise
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1400, t);
    bandpass.Q.setValueAtTime(3, t);

    // Mid smack oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    oscGain.gain.setValueAtTime(this.sfxVolume * 0.9, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    const mainGain = this.ctx.createGain();
    mainGain.gain.setValueAtTime(this.sfxVolume, t);
    mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(bandpass);
    bandpass.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(t);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playPunch() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy low frequency boom
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.18);

    oscGain.gain.setValueAtTime(this.sfxVolume * 1.0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    // Crunch noise
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.sfxVolume * 0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    noise.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.25);
  }

  public playPush() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.65, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playTomatoSplat() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.exponentialRampToValueAtTime(350, t + 0.2);
    filter.Q.setValueAtTime(6, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    const plop = this.ctx.createOscillator();
    const plopGain = this.ctx.createGain();
    plop.type = 'sine';
    plop.frequency.setValueAtTime(450, t);
    plop.frequency.exponentialRampToValueAtTime(110, t + 0.15);

    plopGain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    plopGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    plop.connect(plopGain);
    plopGain.connect(this.ctx.destination);

    noise.start(t);
    plop.start(t);
    plop.stop(t + 0.18);
  }

  public playWaterSplash() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.45;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.linearRampToValueAtTime(1700, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(500, t + duration);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.75, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  public playTickle() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [587.33, 659.25, 783.99, 880.0, 1046.5];
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.055;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 1.08, start + 0.05);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.45, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  public playComboChime(comboCount: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 440;
    const semitones = Math.min(24, comboCount * 2);
    const freq = baseFreq * Math.pow(2, semitones / 12);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playBadgeUnlock() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.09;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, start);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  public playReset() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.3);

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  // --- Authentic Bangladeshi Scenario Ambience Synthesizers ---

  public startAmbience(scenario: ScenarioId) {
    this.currentScenario = scenario;
    if (!this.soundEnabled || !this.ambienceEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbience();
    this.isAmbiencePlaying = true;

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(this.ambienceVolume * 0.2, this.ctx.currentTime);
    this.ambienceGain.connect(this.ctx.destination);

    // Scenario-specific ambient sound generators
    if (scenario === 'dhaka-street') {
      // Periodic Rickshaw bell chime "Tung-Tung!"
      const playRickshawBell = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeRickshawBell();
      };
      playRickshawBell();
      this.ambienceInterval = setInterval(playRickshawBell, 3800);

    } else if (scenario === 'village') {
      // Periodic village birdsong & breeze
      const playBirdSong = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeBirdsong();
      };
      playBirdSong();
      this.ambienceInterval = setInterval(playBirdSong, 4200);

    } else if (scenario === 'campus') {
      // University canteen and collegiate acoustic chord
      const playCampusStrum = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeAcousticChime();
      };
      playCampusStrum();
      this.ambienceInterval = setInterval(playCampusStrum, 5000);

    } else if (scenario === 'bazar') {
      // Lively marketplace clatter & bell
      const playBazarSounds = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeMarketplaceClatter();
      };
      playBazarSounds();
      this.ambienceInterval = setInterval(playBazarSounds, 3200);

    } else if (scenario === 'rooftop') {
      // Gentle twilight rooftop breeze
      const playRooftopBreeze = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeWindBreeze();
      };
      playRooftopBreeze();
      this.ambienceInterval = setInterval(playRooftopBreeze, 4500);

    } else if (scenario === 'eid-festival') {
      // Joyous Eid festival fanfare
      const playEidFanfare = () => {
        if (!this.isAmbiencePlaying || !this.ctx || !this.ambienceGain) return;
        this.synthesizeEidFestiveChime();
      };
      playEidFanfare();
      this.ambienceInterval = setInterval(playEidFanfare, 4000);
    }
  }

  public stopAmbience() {
    this.isAmbiencePlaying = false;
    if (this.ambienceInterval) {
      clearInterval(this.ambienceInterval);
      this.ambienceInterval = null;
    }
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  // --- Procedural Bangladeshi Sound Elements ---

  private synthesizeRickshawBell() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    // Double bell chime: "Tung... Tung!"
    [0, 0.16].forEach((delay) => {
      if (!this.ctx || !this.ambienceGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2150, t + delay);
      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.35, t + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.28);
      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.3);
    });
  }

  private synthesizeBirdsong() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const notes = [1800, 2250, 1950, 2400];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.ambienceGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 1.15, start + 0.06);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.07);
      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  private synthesizeAcousticChime() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const chord = [330, 392, 493.88, 659.25];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.ambienceGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.04;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start(start);
      osc.stop(start + 0.65);
    });
  }

  private synthesizeMarketplaceClatter() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ambienceGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  private synthesizeWindBreeze() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.9;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.linearRampToValueAtTime(650, t + 0.45);
    filter.frequency.exponentialRampToValueAtTime(280, t + 0.9);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);
    noise.start(t);
  }

  private synthesizeEidFestiveChime() {
    if (!this.ctx || !this.ambienceGain) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.ambienceGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.07;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  }

  // --- Synthwave Groove ---

  public toggleMusic(enable?: boolean) {
    const shouldEnable = enable !== undefined ? enable : !this.musicEnabled;
    this.musicEnabled = shouldEnable;
    if (shouldEnable) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  private startMusic() {
    if (!this.soundEnabled || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume * 0.15, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const tempo = 124;
    const stepDuration = 60 / tempo / 2;
    const bassScale = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 123.47];
    let step = 0;

    const playLoop = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      osc.type = 'sawtooth';
      const freq = bassScale[step % bassScale.length];
      osc.frequency.setValueAtTime(freq, t);

      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(450, t);
      lpf.Q.setValueAtTime(4, t);

      env.gain.setValueAtTime(0.18, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

      osc.connect(lpf);
      lpf.connect(env);
      env.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + stepDuration);

      step++;
      setTimeout(playLoop, stepDuration * 1000);
    };

    playLoop();
  }

  private stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
}

export const soundEngine = new SoundEngine();
