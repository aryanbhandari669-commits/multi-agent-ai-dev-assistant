function NoteCard({ note }) {
  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p className="note-preview">{note.content.substring(0, 100)}...</p>
      <div className="note-meta">
        <span className="badge badge-primary">{note.category}</span>
        <span className="text-xs text-gray-500">
          {new Date(note.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export default NoteCard;
