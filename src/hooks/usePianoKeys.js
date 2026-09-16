// Shared keyboard input hook: maps physical keys to notes via KEY_MAP
// (case-sensitive: capital letters = Shift+key). Ignores OS key-repeat
// and browser-shortcut modifiers (Ctrl/Meta/Alt).

import { useEffect } from 'react';
import { KEY_MAP } from '../constants/keys';

export function usePianoKeys(onDown, onUp, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function handleKeyDown(e) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const note = KEY_MAP[e.key];
      if (note) {
        e.preventDefault();
        onDown(note);
      }
    }
    function handleKeyUp(e) {
      const note = KEY_MAP[e.key];
      if (note) {
        e.preventDefault();
        onUp(note);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onDown, onUp, enabled]);
}
