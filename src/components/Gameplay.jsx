import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Piano from './Piano';
import { NOTES, KEY_MAP, NOTE_TO_KEY } from '../constants/keys';
import { noteOn, noteOff } from '../audio/synth';

const APPROACH_S = 2.0; // seconds a note is visible while falling
const HIT_STRICT = 0.09; // Perfect window (±s)
const HIT_GOOD = 0.18; // Good window (±s)
const LANE_H = 380; // height of the falling area
const HIT_MARGIN = 26; // hit line distance from bottom of falling area

export default function Gameplay({ song, instrument, onExit }) {
  const spb = 60 / song.bpm;
  const laneIndex = useMemo(() => new Map(NOTES.map((n, i) => [n.midi, i])), []);

  // Pre-compute canvas-time notes (seconds) once.
  const timedNotes = useMemo(
    () =>
      [...song.notes]
        .sort((a, b) => a.beat - b.beat)
        .map((n) => ({ ...n, time: n.beat * spb, durationS: n.duration * spb })),
    [song, spb]
  );
  const endTime = timedNotes.length
    ? Math.max(...timedNotes.map((n) => n.time + n.durationS)) + 1
    : 0;

  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [now, setNow] = useState(0);
  const [pressed, setPressed] = useState(() => new Set());
  const [stats, setStats] = useState({ perfect: 0, good: 0, miss: 0, combo: 0, maxCombo: 0 });

  const statusRef = useRef([]); // 'pending' | 'perfect' | 'good' | 'miss', per note
  const statsRef = useRef({ perfect: 0, good: 0, miss: 0, combo: 0, maxCombo: 0 });
  const startRef = useRef(0);
  const rafRef = useRef(0);

  function start() {
    statusRef.current = timedNotes.map(() => 'pending');
    statsRef.current = { perfect: 0, good: 0, miss: 0, combo: 0, maxCombo: 0 };
    setStats(statsRef.current);
    startRef.current = performance.now();
    setPhase('playing');
  }

  // Main loop + miss detection.
  useEffect(() => {
    if (phase !== 'playing') return;
    function tick(t) {
      const elapsed = (t - startRef.current) / 1000;
      setNow(elapsed);
      let changed = false;
      timedNotes.forEach((n, i) => {
        if (statusRef.current[i] === 'pending' && elapsed > n.time + HIT_GOOD) {
          statusRef.current[i] = 'miss';
          const s = statsRef.current;
          s.miss += 1;
          s.combo = 0;
          changed = true;
        }
      });
      if (changed) setStats({ ...statsRef.current });
      if (elapsed >= endTime) {
        setPhase('done');
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, timedNotes, endTime]);

  // Input: always plays sound; additionally judges timing while playing.
  const pressNote = useCallback(
    (note) => {
      noteOn(note.name, note.freq, instrument);
      setPressed((prev) => new Set(prev).add(note.name));
      if (phase !== 'playing') return;
      const elapsed = (performance.now() - startRef.current) / 1000;
      let best = -1;
      let bestDelta = Infinity;
      timedNotes.forEach((n, i) => {
        if (statusRef.current[i] !== 'pending' || n.midi !== note.midi) return;
        const d = Math.abs(elapsed - n.time);
        if (d <= HIT_GOOD && d < bestDelta) {
          best = i;
          bestDelta = d;
        }
      });
      if (best >= 0) {
        const verdict = bestDelta <= HIT_STRICT ? 'perfect' : 'good';
        statusRef.current[best] = verdict;
        const s = statsRef.current;
        s[verdict] += 1;
        s.combo += 1;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        setStats({ ...s });
      }
    },
    [phase, instrument, timedNotes]
  );

  const releaseNote = useCallback((note) => {
    noteOff(note.name);
    setPressed((prev) => {
      const next = new Set(prev);
      next.delete(note.name);
      return next;
    });
  }, []);

  // Case-sensitive keyboard input (gameplay takes over global keys).
  useEffect(() => {
    function down(e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const note = KEY_MAP[e.key];
      if (note) {
        e.preventDefault();
        pressNote(note);
      }
    }
    function up(e) {
      const note = KEY_MAP[e.key];
      if (note) {
        e.preventDefault();
        releaseNote(note);
      }
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [pressNote, releaseNote]);

  const total = stats.perfect + stats.good + stats.miss;
  const accuracy = total ? Math.round(((stats.perfect + stats.good * 0.6) / total) * 100) : 0;
  const hitLineY = LANE_H - HIT_MARGIN;

  return (
    <div className="gameplay">
      <div className="gameplay-bar">
        <button onClick={onExit}>← Exit</button>
        <strong>{song.title}</strong>
        <span>
          Perfect {stats.perfect} · Good {stats.good} · Miss {stats.miss} · Combo {stats.combo}
        </span>
      </div>

      <div className="fall-area" style={{ height: LANE_H }}>
        <div className="hit-line" style={{ bottom: HIT_MARGIN }} />
        {phase === 'playing' &&
          timedNotes.map((n, i) => {
            const status = statusRef.current[i];
            const timeUntil = n.time - now;
            // Only draw notes approaching or crossing the line.
            if (status !== 'pending' || timeUntil > APPROACH_S) return null;
            const idx = laneIndex.get(n.midi);
            if (idx === undefined) return null;
            // y grows downward as the note approaches the hit line.
            const top = ((APPROACH_S - timeUntil) / APPROACH_S) * hitLineY;
            const heightPx = Math.max(10, (n.durationS / APPROACH_S) * hitLineY);
            return (
              <div
                key={i}
                className={`falling-note ${NOTES[idx].type}`}
                style={{
                  left: `${(idx / NOTES.length) * 100}%`,
                  width: `${100 / NOTES.length}%`,
                  top: top - heightPx,
                  height: heightPx,
                }}
              >
                <span className="falling-label">{NOTE_TO_KEY[NOTES[idx].name]}</span>
              </div>
            );
          })}
        {phase === 'ready' && (
          <div className="overlay-message">
            <h2>{song.title}</h2>
            <p>
              {song.notes.length} notes · {song.bpm} BPM
            </p>
            <p>Press the shown key when a note reaches the line.</p>
            <button className="primary big" onClick={start}>
              ▶ Start
            </button>
          </div>
        )}
        {phase === 'done' && (
          <div className="overlay-message">
            <h2>Finished!</h2>
            <p className="final-score">
              Accuracy {accuracy}% · Max combo {stats.maxCombo}x
            </p>
            <p>
              Perfect {stats.perfect} · Good {stats.good} · Miss {stats.miss}
            </p>
            <button className="primary" onClick={start}>
              ↻ Retry
            </button>
            <button onClick={onExit}>Back to Library</button>
          </div>
        )}
      </div>

      <Piano notes={NOTES} keyLabels={NOTE_TO_KEY} pressedKeys={pressed} onDown={pressNote} onUp={releaseNote} />
    </div>
  );
}
