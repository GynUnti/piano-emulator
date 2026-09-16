export default function PianoKey({ note, label, pressed, onDown, onUp }) {
  return (
    <div
      className={`piano-key ${note.type} ${pressed ? 'pressed' : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onDown(note);
      }}
      onMouseUp={() => onUp(note)}
      onMouseLeave={() => pressed && onUp(note)}
      onTouchStart={(e) => {
        e.preventDefault();
        onDown(note);
      }}
      onTouchEnd={() => onUp(note)}
    >
      {label && <span className="key-label">{label}</span>}
      {note.type === 'white' && <span className="note-label">{note.name}</span>}
    </div>
  );
}
