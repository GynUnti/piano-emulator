// Song persistence: user songs live in localStorage; default songs ship with
// the app and are read-only (editing one creates a user copy).

import { DEFAULT_SONGS } from './defaultSongs';

const STORAGE_KEY = 'piano-emulator:user-songs';

function readUserSongs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeUserSongs(songs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export function listSongs() {
  return [
    ...DEFAULT_SONGS.map((s) => ({ ...s, isDefault: true })),
    ...readUserSongs().map((s) => ({ ...s, isDefault: false })),
  ];
}

export function getSong(id) {
  return listSongs().find((s) => s.id === id) ?? null;
}

// Saves a song. Existing user song id → update; otherwise create new.
// Default songs are never mutated: saving one creates a user copy.
export function saveSong(song) {
  const toSave = { ...song };
  const users = readUserSongs();
  const idx = users.findIndex((s) => s.id === toSave.id);
  if (idx >= 0) {
    users[idx] = toSave;
  } else {
    toSave.id = 'user-' + Date.now();
    users.push(toSave);
  }
  writeUserSongs(users);
  return toSave;
}

export function deleteSong(id) {
  writeUserSongs(readUserSongs().filter((s) => s.id !== id));
}

export function songLengthBeats(song) {
  return song.notes.reduce((max, n) => Math.max(max, n.beat + n.duration), 0);
}
