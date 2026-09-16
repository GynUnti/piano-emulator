import PianoKey from './PianoKey';

const BLACK_WIDTH_RATIO = 0.6; // relative to a white key's width

export default function Piano({ notes, keyLabels, pressedKeys, onDown, onUp }) {
  const whiteKeys = notes.filter((n) => n.type === 'white');
  const blackKeys = notes.filter((n) => n.type === 'black');

  // White-key global index lookup so BLACK_AFTER works across multiple octaves.
  const whiteIndex = new Map();
  whiteKeys.forEach((n, i) => {
    const base = n.name.replace('#', '').replace(/\d+$/, '');
    const octave = parseInt(n.name.match(/\d+$/)[0], 10);
    whiteIndex.set(`${base}${octave}`, i);
  });

  return (
    <div className="piano" style={{ '--white-count': whiteKeys.length }}>
      {whiteKeys.map((note) => (
        <PianoKey
          key={note.name}
          note={note}
          label={keyLabels[note.name]}
          pressed={pressedKeys.has(note.name)}
          onDown={onDown}
          onUp={onUp}
        />
      ))}
      {blackKeys.map((note) => {
        // A black key (e.g. C#4) sits right after the white key with the same
        // base name (C4), i.e. at that white key's right edge, centered on it.
        const idx = whiteIndex.get(note.name.replace('#', ''));
        const leftRatio = (idx + 1 - BLACK_WIDTH_RATIO / 2) / whiteKeys.length;
        return (
          <div
            key={note.name}
            className="black-key-wrap"
            style={{ left: `${leftRatio * 100}%` }}
          >
            <PianoKey
              note={note}
              label={keyLabels[note.name]}
              pressed={pressedKeys.has(note.name)}
              onDown={onDown}
              onUp={onUp}
            />
          </div>
        );
      })}
    </div>
  );
}
