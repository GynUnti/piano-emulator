# Piano Emulator

A React web app that emulates a 3-octave piano (C3–C6) in the browser.

## Features

- **Free Play**: click piano keys or use your computer keyboard; every note has a dedicated key (see the in-app Keyboard Guide).
- **Multiple instruments**: Grand Piano, Organ, Chiptune, and Warm Strings, all synthesized live with the Web Audio API.
- **Song Library**: built-in and user-created songs, saved locally in your browser.
- **Song Editor**: a piano-roll editor with playback preview to compose your own songs.
- **Gameplay Mode**: falling-notes rhythm game (like YouTube MIDI videos): press the right key as each note reaches the line, score Perfect/Good/Miss and build combos.

## Getting Started

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (default: http://localhost:5173).

## Tech

React + Vite, Web Audio API for sound, localStorage for song persistence. No audio samples or backend required.
