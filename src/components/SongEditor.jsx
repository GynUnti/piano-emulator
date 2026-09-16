import { useMemo, useRef, useState } from 'react';
import { NOTES } from '../constants/keys';
import { noteOn, noteOff } from '../audio/synth';
import { saveSong, songLengthBeats } from '../songs/songStore';

const STEP = 0.5; // grid resolution in beats (eighth notes)
const DURATIONS = [0.5, 1, 1.5, 2, 3, 4];
const CELL_W = 26; // px per column
const ROW_H = 18; // px per note row
const LABEL_W = 50; // px for note-name column

// Rows top→bottom = high notes → low notes.
const ROWS = [...NOTES].reverse();

export default function SongEditor({ song, instrument, onExit, onSaved }) {
  const [title, setTitle] = useState(song.title);
  const [bpm, setBpm] = useState(song.bpm);
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState(() => [...song.notes]);
  const [playing, setPlaying] = useState(false);
  const timersRef = useRef([]);

  const totalCols = useMemo(() => {
    const end = songLengthBeats({ notes });
    return Math.max(64, Math.ceil((end + 8) / STEP)); // always room to grow
  }, [notes]);

  const midiIndex = useMemo(
    () => new Map(ROWS.map((n, i) => [n.midi, i])),
    []
  );

  function toggleCell(midi, beat) {
    // Click on an existing note (start OR covered by its span) removes it.
    const hit = notes.find(
      (n) => n.midi === midi && beat >= n.beat && beat < n.beat + n.duration
    );
    if (hit) {
      setNotes(notes.filter((n) => n !== hit));
      return;
    }
    const note = NOTES.find((n) => n.midi === midi);
    noteOn(note.name, note.freq, instrument); // audition feedback
    setTimeout(() => noteOff(note.name), 250);
    setNotes((prev) => [...prev, { midi, beat, duration }]);
  }

  function playPreview() {
    if (playing) {
      stopPreview();
      return;
    }
    const spb = 60 / bpm;
    timersRef.current = [];
    for (const n of notes) {
      const note = NOTES.find((x) => x.midi === n.midi);
      if (!note) continue;
      timersRef.current.push(
        setTimeout(() => noteOn(note.name, note.freq, instrument), n.beat * spb * 1000),
        setTimeout(
          () => noteOff(note.name),
          (n.beat + n.duration) * spb * 1000
        )
      );
    }
    const end = songLengthBeats({ notes }) * spb * 1000 + 500;
    timersRef.current.push(setTimeout(() => setPlaying(false), end));
    setPlaying(true);
  }

  function stopPreview() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    notes.forEach((n) => {
      const note = NOTES.find((x) => x.midi === n.midi);
      if (note) noteOff(note.name);
    });
    setPlaying(false);
  }

  function handleSave() {
    stopPreview();
    const cleaned = [...notes].sort((a, b) => a.beat - b.beat || a.midi - b.midi);
    const saved = saveSong({ id: song.id ?? null, title: title.trim() || 'Untitled', bpm, notes: cleaned });
    onSaved(saved);
  }

  function handleExit() {
    stopPreview();
    onExit();
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button onClick={handleExit}>← Back</button>
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
        />
        <label>
          BPM{' '}
          <input
            type="number"
            min="30"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Math.max(30, Math.min(300, +e.target.value || 60)))}
          />
        </label>
        <label>
          Note length{' '}
          <select value={duration} onChange={(e) => setDuration(+e.target.value)}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} beat{d > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>
        <button onClick={playPreview}>{playing ? '■ Stop' : '▶ Preview'}</button>
        <button className="primary" onClick={handleSave}>
          Save
        </button>
      </div>
      <p className="editor-hint">
        Click a cell to place a note (each column = ½ beat). Click an existing note to remove it.
      </p>
      <div className="grid-scroll">
        <div
          className="grid"
          style={{
            width: LABEL_W + totalCols * CELL_W,
            height: ROWS.length * ROW_H,
          }}
        >
          {/* note-name labels + cell click handlers */}
          {ROWS.map((note, row) => (
            <div
              key={note.midi}
              className={`grid-row ${note.type}`}
              style={{ top: row * ROW_H, height: ROW_H }}
            >
              <span
                className="row-label"
                style={{ width: LABEL_W, height: ROW_H, lineHeight: ROW_H + 'px' }}
              >
                {note.name}
              </span>
              {Array.from({ length: totalCols }, (_, col) => (
                <div
                  key={col}
                  className={`cell ${col % 2 === 0 ? 'beat-on' : ''} ${col % 8 === 0 ? 'measure' : ''}`}
                  style={{ left: LABEL_W + col * CELL_W, width: CELL_W, height: ROW_H }}
                  onClick={() => toggleCell(note.midi, col * STEP)}
                />
              ))}
            </div>
          ))}
          {/* placed notes, spanning their duration */}
          {notes.map((n, i) => {
            const row = midiIndex.get(n.midi);
            if (row === undefined) return null;
            const isBlack = ROWS[row].type === 'black';
            return (
              <div
                key={i}
                className={`grid-note ${isBlack ? 'black-note' : ''}`}
                style={{
                  left: LABEL_W + (n.beat / STEP) * CELL_W + 1,
                  top: row * ROW_H + 1,
                  width: (n.duration / STEP) * CELL_W - 2,
                  height: ROW_H - 2,
                }}
                onClick={() => toggleCell(n.midi, n.beat)}
                title={`${NOTES.find((x) => x.midi === n.midi)?.name} @ beat ${n.beat}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
