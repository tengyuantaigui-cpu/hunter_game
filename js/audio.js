export class GameAudio {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  ensureContext() {
    if (!this.context) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      this.context = new AudioCtor();
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }

    return this.context;
  }

  tone(freq, duration, type = "sine", volume = 0.04) {
    const ctx = this.ensureContext();
    if (!ctx || !this.enabled) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.value = volume;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    const stopAt = ctx.currentTime + duration;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    oscillator.stop(stopAt);
  }

  play(type = "hit") {
    if (!this.enabled) return;

    switch (type) {
      case "hit":
        this.tone(180, 0.09, "square", 0.04);
        this.tone(140, 0.12, "triangle", 0.025);
        break;
      case "crit":
        this.tone(260, 0.12, "triangle", 0.05);
        this.tone(360, 0.12, "triangle", 0.04);
        this.tone(520, 0.18, "sawtooth", 0.035);
        break;
      case "defeat":
        this.tone(210, 0.12, "sine", 0.05);
        this.tone(170, 0.18, "sine", 0.04);
        this.tone(130, 0.22, "triangle", 0.03);
        break;
      case "upgrade":
        this.tone(330, 0.08, "triangle", 0.04);
        this.tone(440, 0.12, "triangle", 0.04);
        this.tone(590, 0.18, "triangle", 0.035);
        break;
      case "rebirth":
        this.tone(220, 0.15, "sawtooth", 0.04);
        this.tone(292, 0.18, "triangle", 0.05);
        this.tone(440, 0.24, "triangle", 0.045);
        break;
      default:
        this.tone(220, 0.08, "square", 0.03);
    }
  }

  startBgm() {
    if (!this.enabled || this.bgmTimer) return;

    const notes = [165, 196, 220, 294, 330];
    this.bgmStep = 0;

    this.bgmTimer = window.setInterval(() => {
      if (!this.enabled) return;
      const note = notes[this.bgmStep % notes.length];
      this.tone(note, 0.18, "triangle", 0.018);
      this.bgmStep += 1;
    }, 700);
  }

  stopBgm() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }
}
