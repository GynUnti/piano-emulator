import { useState } from 'react';
import { listSongs, deleteSong } from '../songs/songStore';

export default function Library({ onPlay, onEdit, onNew }) {
  const [songs, setSongs] = useState(() => listSongs());

  function handleDelete(song) {
    if (!confirm(`Delete "${song.title}"?`)) return;
    deleteSong(song.id);
    setSongs(listSongs());
  }

  return (
    <div className="library">
      <div className="library-header">
        <h2>Song Library</h2>
        <button onClick={onNew}>+ New Song</button>
      </div>
      {songs.length === 0 && <p>No songs yet. Create one!</p>}
      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id} className="song-row">
            <div className="song-info">
              <strong>{song.title}</strong>
              <span className="song-meta">
                {song.bpm} BPM · {song.notes.length} notes
                {song.isDefault && ' · built-in'}
              </span>
            </div>
            <div className="song-actions">
              <button onClick={() => onPlay(song)}>▶ Play</button>
              {song.isDefault ? (
                <button onClick={() => onEdit({ ...song, id: null, title: song.title + ' (copy)' })}>
                  Edit (copy)
                </button>
              ) : (
                <>
                  <button onClick={() => onEdit(song)}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(song)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
