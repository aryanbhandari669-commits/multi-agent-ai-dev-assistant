import { useEffect } from 'react';
import { useNotes } from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import './NotesPage.css';

function NotesPage() {
  const { notes, isLoading, fetchNotes, createNote } = useNotes();

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="notes-page">
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="btn btn-primary">New Note</button>
      </div>

      <div className="notes-grid">
        {isLoading ? (
          <div className="loading">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          notes.map((note) => <NoteCard key={note.noteId} note={note} />)
        )}
      </div>
    </div>
  );
}

export default NotesPage;
