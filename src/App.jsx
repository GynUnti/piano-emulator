import { useCallback, useState } from 'react';
import Piano from './components/Piano';
import HelpPanel from './components/HelpPanel';
import Library from './components/Library';
import SongEditor from './components/SongEditor';
import Gameplay from './components/Gameplay';
import { NOTES, NOTE_TO_KEY } from './constants/keys';
import { noteOn, noteOff, INSTRUMENTS, DEFAULT_INSTRUMENT } from './audio/synth';
import { usePianoKeys } from './hooks/usePianoKeys';
import './App.css';

const EMPTY_SONG = { id: null, title: '', bpm: 100, notes: [] };

function FreePlay({ instrument, pressed, pressNote, releaseNote }) {
  return (
    <>
      <Piano
        notes={NOTES}
        keyLabels={NOTE_TO_KEY}
        pressedKeys={pressed}
        onDown={pressNote}
        onUp={releaseNote}
      />
      <footer>
        Click keys or use your keyboard — each keyboard row covers one octave (see Keyboard Guide)
      </footer>
    </>
  );
}

export default function App() {
  // view: { name: 'play' | 'library' | 'editor' | 'game', song? }
  const [view, setView] = useState({ name: 'play' });
  const [pressed, setPressed] = useState(() => new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [instrument, setInstrument] = useState(DEFAULT_INSTRUMENT);

  const pressNote = useCallback(
    (note) => {
      noteOn(note.name, note.freq, instrument);
      setPressed((prev) => new Set(prev).add(note.name));
    },
    [instrument]
  );

  const releaseNote = useCallback((note) => {
    noteOff(note.name);
    setPressed((prev) => {
      const next = new Set(prev);
      next.delete(note.name);
      return next;
    });
  }, []);

  // Global piano keys only in free-play view (editor/game manage their own input).
  usePianoKeys(pressNote, releaseNote, view.name === 'play');

  return (
    <div className="app">
      <header>
        <h1 onClick={() => setView({ name: 'play' })} style={{ cursor: 'pointer' }}>
          Piano Emulator
        </h1>
        <nav>
          <button
            className={view.name === 'play' ? 'active' : ''}
            onClick={() => setView({ name: 'play' })}
          >
            Free Play
          </button>
          <button
            className={view.name === 'library' ? 'active' : ''}
            onClick={() => setView({ name: 'library' })}
          >
            Song Library
          </button>
        </nav>
        <select
          className="instrument-select"
          value={instrument}
          onChange={(e) => setInstrument(e.target.value)}
        >
          {Object.entries(INSTRUMENTS).map(([id, inst]) => (
            <option key={id} value={id}>
              {inst.label}
            </option>
          ))}
        </select>
        <button className="help-btn" onClick={() => setShowHelp(true)}>
          ? Keyboard Guide
        </button>
      </header>

      {view.name === 'play' && (
        <FreePlay
          instrument={instrument}
          pressed={pressed}
          pressNote={pressNote}
          releaseNote={releaseNote}
        />
      )}

      {view.name === 'library' && (
        <Library
          onPlay={(song) => setView({ name: 'game', song })}
          onEdit={(song) => setView({ name: 'editor', song })}
          onNew={() => setView({ name: 'editor', song: { ...EMPTY_SONG, notes: [] } })}
        />
      )}

      {view.name === 'editor' && (
        <SongEditor
          song={view.song}
          instrument={instrument}
          onExit={() => setView({ name: 'library' })}
          onSaved={() => setView({ name: 'library' })}
        />
      )}

      {view.name === 'game' && (
        <Gameplay
          song={view.song}
          instrument={instrument}
          onExit={() => setView({ name: 'library' })}
        />
      )}

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  );
}
