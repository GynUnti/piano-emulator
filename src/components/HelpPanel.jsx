// Shows the full static keyboard ↔ note mapping (all 3 octaves, keymap.md).
// Capital letters mean Shift+key. Entries grouped by octave.

import { KEY_MAP } from '../constants/keys';

export default function HelpPanel({ onClose }) {
  const entries = Object.entries(KEY_MAP).sort((a, b) => a[1].midi - b[1].midi);

  const byOctave = entries.reduce((groups, [key, note]) => {
    const octave = note.name.match(/\d+$/)[0];
    (groups[octave] ??= []).push([key, note]);
    return groups;
  }, {});

  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-panel wide" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Guide</h2>
        <p>
          All 3 octaves are always available. Capital letters = hold{' '}
          <kbd>Shift</kbd> + that key.
        </p>
        <div className="octave-columns">
          {Object.entries(byOctave).map(([octave, rows]) => (
            <table key={octave}>
              <thead>
                <tr>
                  <th colSpan={2}>Octave {octave}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([key, note]) => (
                  <tr key={key + note.name} className={note.type}>
                    <td>
                      <kbd>{key}</kbd>
                    </td>
                    <td>{note.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
