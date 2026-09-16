// Note range C3–C6 (3 octaves). Frequencies are computed from MIDI numbers.
// Full-keyboard mapping comes from keymap.md: rows of the keyboard cover
// consecutive octaves, capital letters (Shift+key) are used for some black
// keys, so any keys across all 3 octaves can be pressed simultaneously.

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function buildRange(startMidi, endMidi) {
  const notes = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    const name = NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
    notes.push({
      midi,
      name,
      type: name.includes('#') ? 'black' : 'white',
      freq: 440 * Math.pow(2, (midi - 69) / 12),
    });
  }
  return notes;
}

// keymap.md — key is the exact e.key value (case-sensitive).
const KEYMAP_ROWS = [
  ['q', 'C3'], ['3', 'C#3'], ['w', 'D3'], ['4', 'D#3'], ['e', 'E3'], ['r', 'F3'],
  ['7', 'F#3'], ['u', 'G3'], ['8', 'G#3'], ['i', 'A3'], ['9', 'A#3'], ['o', 'B3'],
  ['a', 'C4'], ['p', 'C4'], ['E', 'C#4'], ['s', 'D4'], ['R', 'D#4'], ['d', 'E4'], ['f', 'F4'],
  ['U', 'F#4'], ['j', 'G4'], ['I', 'G#4'], ['k', 'A4'], ['O', 'A#4'], ['l', 'B4'],
  ['z', 'C5'], [';', 'C5'], ['D', 'C#5'], ['x', 'D5'], ['F', 'D#5'], ['c', 'E5'], ['v', 'F5'],
  ['J', 'F#5'], ['m', 'G5'], ['K', 'G#5'], [',', 'A5'], ['L', 'A#5'], ['.', 'B5'],
  ['/', 'C6'],
];

export const NOTES = buildRange(48, 84); // C3–C6

// Resolve note names from keymap.md into full note objects (with freq).
const noteIndex = new Map(NOTES.map((n) => [n.name, n]));

export const KEY_MAP = Object.fromEntries(
  KEYMAP_ROWS.map(([key, noteName]) => [key, noteIndex.get(noteName)])
);

// note.name -> key char, for labels rendered on the piano keys.
// First mapping wins when several keys map to the same note.
export const NOTE_TO_KEY = Object.fromEntries(
  [...KEYMAP_ROWS].reverse().map(([key, noteName]) => [noteName, key])
);
