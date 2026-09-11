import { useState, useCallback } from 'react';
import { notesAPI } from '../services/api.js';
import useNotesStore from '../store/notesStore.js';

export const useNotes = () => {
  const {
    notes,
    selectedNote,
    isLoading,
    filter,
    setNotes,
    addNote,
    updateNote,
    removeNote,
    selectNote,
    setLoading,
    setFilter
  } = useNotesStore();

  const fetchNotes = useCallback(
    async (category, tag, search) => {
      setLoading(true);
      try {
        const response = await notesAPI.getNotes(category, tag, search);
        setNotes(response.data.notes);
      } catch (error) {
        console.error('Fetch notes error:', error);
      } finally {
        setLoading(false);
      }
    },
    [setNotes, setLoading]
  );

  const createNote = useCallback(
    async (title, content, tags = [], category = 'general') => {
      setLoading(true);
      try {
        const response = await notesAPI.createNote(
          title,
          content,
          tags,
          category
        );
        addNote(response.data.note);
        return response.data.note;
      } catch (error) {
        console.error('Create note error:', error);
      } finally {
        setLoading(false);
      }
    },
    [addNote, setLoading]
  );

  const updateNoteData = useCallback(
    async (noteId, updates) => {
      setLoading(true);
      try {
        const response = await notesAPI.updateNote(noteId, updates);
        updateNote(noteId, updates);
        return response.data.note;
      } catch (error) {
        console.error('Update note error:', error);
      } finally {
        setLoading(false);
      }
    },
    [updateNote, setLoading]
  );

  const deleteNoteData = useCallback(
    async (noteId) => {
      setLoading(true);
      try {
        await notesAPI.deleteNote(noteId);
        removeNote(noteId);
      } catch (error) {
        console.error('Delete note error:', error);
      } finally {
        setLoading(false);
      }
    },
    [removeNote, setLoading]
  );

  return {
    notes,
    selectedNote,
    isLoading,
    filter,
    fetchNotes,
    createNote,
    updateNote: updateNoteData,
    deleteNote: deleteNoteData,
    selectNote,
    setFilter
  };
};
