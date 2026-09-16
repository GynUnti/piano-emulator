// Built-in songs the app ships with (read-only; editing creates a copy).
// Format: notes use MIDI numbers and beat positions (quarter note = 1 beat).

export const DEFAULT_SONGS = [
  {
    id: 'default-twinkle',
    title: 'Twinkle Twinkle Little Star',
    bpm: 100,
    notes: [
      { midi: 60, beat: 0, duration: 1 },
      { midi: 60, beat: 1, duration: 1 },
      { midi: 67, beat: 2, duration: 1 },
      { midi: 67, beat: 3, duration: 1 },
      { midi: 69, beat: 4, duration: 1 },
      { midi: 69, beat: 5, duration: 1 },
      { midi: 67, beat: 6, duration: 2 },
      { midi: 65, beat: 8, duration: 1 },
      { midi: 65, beat: 9, duration: 1 },
      { midi: 64, beat: 10, duration: 1 },
      { midi: 64, beat: 11, duration: 1 },
      { midi: 62, beat: 12, duration: 1 },
      { midi: 62, beat: 13, duration: 1 },
      { midi: 60, beat: 14, duration: 2 },
    ],
  },
  {
    id: 'default-ode-to-joy',
    title: 'Ode to Joy',
    bpm: 120,
    notes: [
      { midi: 64, beat: 0, duration: 1 },
      { midi: 64, beat: 1, duration: 1 },
      { midi: 65, beat: 2, duration: 1 },
      { midi: 67, beat: 3, duration: 1 },
      { midi: 67, beat: 4, duration: 1 },
      { midi: 65, beat: 5, duration: 1 },
      { midi: 64, beat: 6, duration: 1 },
      { midi: 62, beat: 7, duration: 1 },
      { midi: 60, beat: 8, duration: 1 },
      { midi: 60, beat: 9, duration: 1 },
      { midi: 62, beat: 10, duration: 1 },
      { midi: 64, beat: 11, duration: 1 },
      { midi: 64, beat: 12, duration: 1.5 },
      { midi: 62, beat: 12.5, duration: 0.5 },
      { midi: 62, beat: 13, duration: 2 },
    ],
  },
];
