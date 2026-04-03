/** @format */

import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Edit2,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiConfig";


export default function Dashboard() {
  

  // Notes data and loading state
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  // Modal visibility and editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form data for creating/editing notes
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  // Effects

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  /**
   * Fetches all notes from the backend API.
   * Updates the `notes` state and handles loading/error states.
   */
  const fetchNotes = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'GET', 
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await res.json();

    // Safety check: only set notes if data is an array
    if (res.ok && Array.isArray(data)) {
      setNotes(data);
    } else {
      console.error("Server returned an error or non-array:", data);
      setNotes([]); // Fallback to empty array to prevent .map/.forEach crashes
    }
  } catch (error) {
    console.error("Failed to fetch notes", error);
  } finally {
    setLoading(false);
  }
};

  // Data Processing & Memos

  /**
   * Extracts all unique tags from the notes list.
   * Used for the tag filter bar.
   */
  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [notes]);

  /**
   * Filters notes based on the current search query and selected tag.
   * Returns the list of notes to be displayed.
   */
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);



 
  const handleOpenModal = (note) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags.join(", "),
      });
    } else {
      setEditingNote(null);
      setFormData({ title: "", content: "", tags: "" });
    }
    setIsModalOpen(true);
  };

  /**
   * Closes the modal and resets the form state.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", tags: "" });
  };

  /**
   * Handles saving a note (Create or Update).
   * Validates input, sends API request, and updates local state.
   */
  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSaving(true);

    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const payload = {
      title: formData.title,
      content: formData.content,
      tags: tagsArray,
    };

    try {
      if (editingNote) {
        // Update existing note
        const res = await fetch(`${API_BASE_URL}/api/notes/${editingNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
  credentials: "include",
        });
        const updatedNote = await res.json();
        setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
      } else {
        // Create new note
        const res = await fetch(`${API_BASE_URL}/api/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
  credentials: "include",
        });
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save note", error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Deletes a note by ID.
   * Prompts for confirmation before deleting.
   */
  const handleDeleteNote = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetch(`${API_BASE_URL}/api/notes/${id}`, { method: "DELETE" ,
  credentials: "include"});
      setNotes(notes.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  if (loading) {
    return (
      // Loading State
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/*Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My Notes</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </button>
      </div>

      {/* Search and Filter Section*/}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedTag === null
                  ? "bg-indigo-100 text-indigo-800 font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? "bg-indigo-100 text-indigo-800 font-medium"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid Section  */}
      {filteredNotes.length === 0 ? (
        // Empty State
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            No notes found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery || selectedTag
              ? "Try adjusting your search or filters."
              : "Get started by creating a new note."}
          </p>
        </div>
      ) : (
        // Notes List
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={note.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Note Content */}
                <div className="p-5 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1">
                    {note.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-4 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
                {/* Note Footer (Tags & Actions) */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {format(new Date(note.updatedAt), "MMM d, yyyy")}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(note)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Modal Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div
                  className="absolute inset-0 bg-slate-900 opacity-75"
                  onClick={handleCloseModal}
                ></div>
              </motion.div>

              {/* Centering spacer */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
              >
                <form onSubmit={handleSaveNote}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-slate-900">
                        {editingNote ? "Edit Note" : "Create Note"}
                      </h3>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-slate-400 hover:text-slate-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Title Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Note title"
                        />
                      </div>

                      {/* Content Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Content
                        </label>
                        <textarea
                          rows={5}
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              content: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                          placeholder="Write your note here..."
                        />
                      </div>

                      {/* Tags Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                          }
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="work, personal, ideas"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : null}
                      {saving ? "Saving..." : "Save Note"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
