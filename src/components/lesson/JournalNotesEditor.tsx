"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLessonNotes } from "./useLessonNotes";
import PaperCard from "@/components/ui/PaperCard";

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const ListIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const BoldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="12" x2="9" y2="12" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="6" />
    <line x1="21" y1="12" x2="3" y2="12" />
    <line x1="18" y1="18" x2="6" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="12" x2="15" y2="12" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

const AlignJustifyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="12" x2="3" y2="12" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

type JournalNotesEditorProps = {
  lessonSlug: string;
  currentSlideId?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function JournalNotesEditor({
  lessonSlug,
  currentSlideId,
  isOpen,
  onClose,
}: JournalNotesEditorProps) {
  const { notes, add, loading: notesLoading } = useLessonNotes(lessonSlug);
  const [notesHtml, setNotesHtml] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [textColor, setTextColor] = useState("#222326");
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlideNote = useMemo(() => {
    if (!currentSlideId) return null;
    return notes.find((n) => n.slide_id === currentSlideId) ?? null;
  }, [notes, currentSlideId]);

  // Reset editing state when slide changes
  useEffect(() => {
    setIsEditingNote(false);
  }, [currentSlideId]);

  // Sync editor with stored note when not editing
  useEffect(() => {
    if (isEditingNote) return;
    if (!isOpen) return;
    if (!editorRef.current) return;

    const content = currentSlideNote?.content ?? "";
    editorRef.current.innerHTML = content;
    setNotesHtml(content);
  }, [currentSlideNote, isEditingNote, isOpen]);

  // Reset when editor opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsEditingNote(false);
      const content = currentSlideNote?.content ?? "";
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
      setNotesHtml(content);
    } else {
      setIsEditingNote(false);
      setNotesHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [isOpen, currentSlideNote]);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    if (!isEditingNote) {
      setIsEditingNote(true);
    }
    const html = editorRef.current.innerHTML;
    setNotesHtml(html);

    // Auto-save with debounce (1 second delay)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!html.trim() || !currentSlideId) return;
      
      try {
        // Strip empty paragraphs and normalize HTML
        const cleanHtml = html
          .replace(/<p><\/p>/g, "")
          .replace(/<p>\s*<\/p>/g, "")
          .trim();
        
        await add(cleanHtml || "", currentSlideId);
        setIsEditingNote(false);
      } catch (error) {
        console.error("Failed to auto-save notes:", error);
      }
    }, 1000);
  };

  const handleFormatCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    handleFormatCommand("foreColor", color);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <PaperCard
      className="flex h-full w-full flex-col"
      style={{ backgroundColor: "#f0ede9" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-xl font-normal text-[#222326]" style={{ fontFamily: 'var(--font-sans)' }}>Journal</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
          aria-label="Fermer le journal"
        >
          <XIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden gap-4 p-4">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f0ede9] shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
          <button
            onClick={() => handleFormatCommand("bold")}
            className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
            aria-label="Gras"
            title="Gras"
          >
            <BoldIcon />
          </button>
          <button
            onClick={() => handleFormatCommand("italic")}
            className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
            aria-label="Italique"
            title="Italique"
          >
            <ItalicIcon />
          </button>
          <button
            onClick={() => handleFormatCommand("insertUnorderedList")}
            className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
            aria-label="Liste à puces"
            title="Liste à puces"
          >
            <ListIcon />
          </button>
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#d7d3cd]">
            <button
              onClick={() => handleFormatCommand("justifyLeft")}
              className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
              aria-label="Aligner à gauche"
              title="Aligner à gauche"
            >
              <AlignLeftIcon />
            </button>
            <button
              onClick={() => handleFormatCommand("justifyCenter")}
              className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
              aria-label="Centrer"
              title="Centrer"
            >
              <AlignCenterIcon />
            </button>
            <button
              onClick={() => handleFormatCommand("justifyRight")}
              className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
              aria-label="Aligner à droite"
              title="Aligner à droite"
            >
              <AlignRightIcon />
            </button>
            <button
              onClick={() => handleFormatCommand("justifyFull")}
              className="rounded p-1.5 text-[#4b4842] hover:bg-[#e8e5e1] transition-colors duration-200"
              aria-label="Justifier"
              title="Justifier"
            >
              <AlignJustifyIcon />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#d7d3cd]">
            <label className="text-xs text-[#4b4842]">Couleur:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-6 w-8 cursor-pointer rounded border-0 bg-[#ece9e3] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.95)]"
              style={{ 
                WebkitAppearance: 'none',
                appearance: 'none',
                padding: 0,
              }}
              aria-label="Changer la couleur du texte"
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto rounded-lg bg-[#f4f2ee] px-4 py-4 md:px-6 md:py-6 lg:px-8 shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
          <div
            ref={editorRef}
            contentEditable={!notesLoading && !!currentSlideId}
            onInput={handleEditorInput}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              handleEditorInput();
            }}
            className="h-full w-full p-4 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E8C8C]"
            style={{ minHeight: "100%" }}
            data-placeholder={
              currentSlideId
                ? "Ajoutez vos notes pour cette diapositive..."
                : "Sélectionnez une diapositive pour ajouter des notes"
            }
            suppressContentEditableWarning={true}
          />
          <style dangerouslySetInnerHTML={{ __html: `
            div[contenteditable][data-placeholder]:empty:before {
              content: attr(data-placeholder);
              color: #8b8680;
              pointer-events: none;
            }
            div[contenteditable] ul,
            div[contenteditable] ol {
              margin-left: 1.5rem;
              margin-top: 0.5rem;
              margin-bottom: 0.5rem;
              list-style-type: disc;
              padding-left: 1rem;
            }
            div[contenteditable] ul {
              list-style-type: disc;
            }
            div[contenteditable] ol {
              list-style-type: decimal;
            }
            div[contenteditable] li {
              margin-bottom: 0.25rem;
              display: list-item;
              list-style-position: outside;
            }
            div[contenteditable] li::marker {
              color: #222326;
            }
            div[contenteditable] p {
              margin-bottom: 0.5rem;
            }
            div[contenteditable] p:last-child {
              margin-bottom: 0;
            }
          `}} />
        </div>
      </div>
    </PaperCard>
  );
}

