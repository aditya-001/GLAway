const MOODS = {
  sunny: { base: 246, detune: 7, type: "triangle", filter: 1200 },
  night: { base: 196, detune: 4, type: "sine", filter: 840 },
  snow: { base: 174, detune: 3, type: "sine", filter: 720 },
  rain: { base: 220, detune: 4, type: "triangle", filter: 620 },
  cyberstorm: { base: 132, detune: 9, type: "sawtooth", filter: 920 },
  candy: { base: 262, detune: 6, type: "square", filter: 1100 },
};

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.filter = null;
    this.ambientA = null;
    this.ambientB = null;
    this.adMuted = false;

    const unlock = () => this.unlock();
    scene.input.once("pointerdown", unlock);
    scene.input.keyboard.once("keydown", unlock);
  }

  unlock() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!this.ctx) {
      this.ctx = new AudioContextClass();

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);

      this.music = this.ctx.createGain();
      this.music.gain.value = 0.09;
      this.music.connect(this.master);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.value = 900;
      this.filter.connect(this.music);

      this.ambientA = this.ctx.createOscillator();
      this.ambientB = this.ctx.createOscillator();
      this.ambientA.type = "triangle";
      this.ambientB.type = "sine";
      this.ambientA.frequency.value = 196;
      this.ambientB.frequency.value = 203;

      this.ambientA.connect(this.filter);
      this.ambientB.connect(this.filter);
      this.ambientA.start();
      this.ambientB.start();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setWeatherMood(key) {
    this.unlock();

    if (!this.ctx) {
      return;
    }

    const mood = MOODS[key] || MOODS.night;
    const now = this.ctx.currentTime;

    this.ambientA.type = mood.type;
    this.ambientB.type = mood.type === "square" ? "triangle" : "sine";
    this.ambientA.frequency.setTargetAtTime(mood.base, now, 0.2);
    this.ambientB.frequency.setTargetAtTime(mood.base + mood.detune, now, 0.24);
    this.filter.frequency.setTargetAtTime(mood.filter, now, 0.24);
  }

  resume() {
    this.unlock();

    if (!this.music || this.adMuted) {
      return;
    }

    this.music.gain.setTargetAtTime(0.09, this.ctx.currentTime, 0.08);
  }

  pause() {
    if (!this.music || this.adMuted) {
      return;
    }

    this.music.gain.setTargetAtTime(0.035, this.ctx.currentTime, 0.08);
  }

  setAdMuted(muted) {
    this.unlock();

    if (!this.ctx || !this.master) {
      return;
    }

    this.adMuted = muted;
    this.master.gain.setTargetAtTime(muted ? 0.001 : 0.18, this.ctx.currentTime, 0.02);
  }

  playJump() {
    this.pulse({ frequency: 520, type: "triangle", duration: 0.12, volume: 0.08, slide: -120 });
  }

  playCollect(kind = "sweet") {
    const map = {
      sweet: { frequency: 620, type: "triangle", duration: 0.12, volume: 0.055, slide: 80 },
      petal: { frequency: 680, type: "sine", duration: 0.13, volume: 0.055, slide: 50 },
      bright: { frequency: 720, type: "triangle", duration: 0.15, volume: 0.06, slide: 90 },
      rare: { frequency: 880, type: "square", duration: 0.18, volume: 0.065, slide: 140 },
      combo: { frequency: 920, type: "triangle", duration: 0.16, volume: 0.075, slide: 180 },
    };

    this.pulse(map[kind] || map.sweet);
  }

  playCrash() {
    this.pulse({ frequency: 180, type: "sawtooth", duration: 0.3, volume: 0.1, slide: -140 });
    this.pulse({ frequency: 90, type: "square", duration: 0.18, volume: 0.07, slide: -40 });
  }

  playNearMiss() {
    this.pulse({ frequency: 760, type: "triangle", duration: 0.12, volume: 0.065, slide: -40 });
  }

  playWeatherSwap() {
    this.pulse({ frequency: 420, type: "sine", duration: 0.22, volume: 0.05, slide: 110 });
  }

  playChest() {
    this.pulse({ frequency: 520, type: "triangle", duration: 0.12, volume: 0.06, slide: 120 });
    this.pulse({ frequency: 690, type: "triangle", duration: 0.16, volume: 0.05, slide: 150 });
  }

  playRevive() {
    this.pulse({ frequency: 380, type: "sine", duration: 0.16, volume: 0.06, slide: 200 });
    this.pulse({ frequency: 760, type: "triangle", duration: 0.22, volume: 0.055, slide: 80 });
  }

  pulse({ frequency, type, duration, volume, slide }) {
    this.unlock();

    if (!this.ctx || this.adMuted) {
      return;
    }

    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.linearRampToValueAtTime(Math.max(40, frequency + slide), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}
