import express from 'express';
import Note from '../models/Note.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    const parsedNotes = notes.map(note => ({
      id: note._id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));
    res.json(parsedNotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
      tags: tags || []
    });
    await newNote.save();
    
    res.status(201).json({
      id: newNote._id,
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  console.log('in bcknd updt,route,notes');
  const { title, content, tags } = req.body;
  const noteId = req.params.id;

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.user.id },
      { title, content, tags: tags || [] },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      id: updatedNote._id,
      title: updatedNote.title,
      content: updatedNote.content,
      tags: updatedNote.tags,
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  console.log('in bcknd dlt,route,notes');
  const noteId = req.params.id;

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: req.user.id });
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
