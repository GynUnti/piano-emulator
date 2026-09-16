// Multi-instrument synth built on the Web Audio API (no audio assets).
// Each instrument is a set of oscillator partials + envelope parameters.
// API: noteOn(name, freq, instrumentId) / noteOff(name).

export const INSTRUMENTS = {
  piano: {
    label: 'Grand Piano',
    attack: 0.008,
    release: 0.18,
    decayByPitch: true, // low notes ring longer, like real strings
    baseDecay: 2.4,
    brightness: (freq) => Math.min(9000, freq * 8 + 800),
    partials: [
      { ratio: 1.0, gain: 1.0, type: 'sine' },
      { ratio: 2.0001, gain: 0.45, type: 'sine' },
      { ratio: 3.008, gain: 0.22, type: 'sine' },
      { ratio: 4.16, gain: 0.1, type: 'sine' },
      { ratio: 5.43, gain: 0.05, type: 'sine' },
    ],
  },
  organ: {
    label: 'Organ',
    attack: 0.03,
    release: 0.08,
    sustain: true, // sound holds until key release
    brightness: () => 7000,
    partials: [
      { ratio: 0.5, gain: 0.4, type: 'sine' }, // sub-octave drawbar
      { ratio: 1.0, gain: 1.0, type: 'sine' },
      { ratio: 2.0, gain: 0.6, type: 'sine' },
      { ratio: 3.0, gain: 0.25, type: 'sine' },
      { ratio: 4.0, gain: 0.15, type: 'sine' },
    ],
  },
  chiptune: {
    label: 'Chiptune (Square)',
    attack: 0.003,
    release: 0.06,
    baseDecay: 0.9,
    brightness: () => 9000,
    partials: [
      { ratio: 1.0, gain: 1.0, type: 'square' },
      { ratio: 2.0, gain: 0.15, type: 'square' },
    ],
  },
  strings: {
    label: 'Warm Strings',
    attack: 0.25, // slow swell
    release: 0.5,
    baseDecay: 3.5,
    brightness: () => 2200,
    partials: [
      { ratio: 1.0, gain: 1.0, type: 'sawtooth' },
      { ratio: 1.005, gain: 0.6, type: 'sawtooth' }, // detune chorus
      { ratio: 0.5, gain: 0.35, type: 'sawtooth' },
    ],
  },
};

export const DEFAULT_INSTRUMENT = 'piano';

let ctx = null;
let master = null;
const active = new Map(); // noteName -> { oscs, out }

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 6;
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function noteOn(name, freq, instrumentId = DEFAULT_INSTRUMENT) {
  if (active.has(name)) return;
  const inst = INSTRUMENTS[instrumentId] ?? INSTRUMENTS[DEFAULT_INSTRUMENT];
  const ac = getContext();
  const t = ac.currentTime;

  const out = ac.createGain();
  out.gain.value = 0.28;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = inst.brightness(freq);
  filter.Q.value = 0.4;
  filter.connect(out);
  out.connect(master);

  const oscs = inst.partials.map(({ ratio, gain, type }, i) => {
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq * ratio;

    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + inst.attack);

    if (!inst.sustain) {
      let decay = inst.baseDecay ?? 1.5;
      if (inst.decayByPitch) {
        // Scale decay by pitch: low notes longer, high notes shorter.
        decay = Math.min(4.5, Math.max(1.2, (inst.baseDecay * 440) / freq));
      }
      decay /= 1 + i * 0.9; // higher partials die faster
      g.gain.exponentialRampToValueAtTime(0.0008, t + inst.attack + decay);
    }

    osc.connect(g);
    g.connect(filter);
    osc.start(t);
    return osc;
  });

  active.set(name, { oscs, out, release: inst.release });
}

export function noteOff(name) {
  const node = active.get(name);
  if (!node) return;
  active.delete(name);
  const { oscs, out, release } = node;
  const t = ctx.currentTime;
  out.gain.cancelScheduledValues(t);
  out.gain.setValueAtTime(out.gain.value, t);
  out.gain.exponentialRampToValueAtTime(0.0001, t + release);
  oscs.forEach((osc) => osc.stop(t + release + 0.1));
}
