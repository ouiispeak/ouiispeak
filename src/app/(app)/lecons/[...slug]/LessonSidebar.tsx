"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useLessonNotes } from "@/components/lesson/useLessonNotes";
import { useLessonBookmarks } from "@/components/lesson/useLessonBookmarks";

type LessonSidebarProps = {
  moduleName: string;
  lessonName?: string | null;
  lessonSlug: string;
  currentSlideId?: string;
  onRestartAction?: () => void;
};

export default function LessonSidebar({ 
  moduleName, 
  lessonName, 
  lessonSlug, 
  currentSlideId,
  onRestartAction 
}: LessonSidebarProps) {
  const { notes, hasAny, add, loading: notesLoading } = useLessonNotes(lessonSlug);
  const { isBookmarked, add: addBookmark, loading: bookmarkLoading } = useLessonBookmarks(lessonSlug);
  
  // Local UI state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const currentSlideNote = useMemo(() => {
    if (!currentSlideId) return null;
    return notes.find(n => n.slide_id === currentSlideId) ?? null;
  }, [notes, currentSlideId]);
  
  useEffect(() => {
    // When the slide changes, reset editing state so we can sync with stored note
    setIsEditingNote(false);
  }, [currentSlideId]);

  // Keep the textarea in sync with the stored note only when the user isn't actively editing.
  useEffect(() => {
    if (isEditingNote) return;
    if (!isNotesOpen) return;

    setNotesText(currentSlideNote?.content ?? '');
  }, [currentSlideNote, isEditingNote, isNotesOpen]);
  
  const handleNotesToggle = () => {
    const nextOpen = !isNotesOpen;
    setIsNotesOpen(nextOpen);

    if (nextOpen) {
      setIsEditingNote(false);
      setNotesText(currentSlideNote?.content ?? '');
    } else {
      setIsEditingNote(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesText.trim() || !currentSlideId) return;
    
    setIsSavingNotes(true);
    try {
      await add(notesText.trim(), currentSlideId);
      setIsNotesOpen(false);
      setIsEditingNote(false);
      setNotesText('');
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!currentSlideId) return;
    
    try {
      await addBookmark(currentSlideId);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleHelpClick = () => {
    setShowHelp(!showHelp);
  };

  const handleRestartClick = () => {
    setShowRestartConfirm(true);
  };

  const handleRestartConfirm = () => {
    onRestartAction?.();
    setShowRestartConfirm(false);
  };

  const handleRestartCancel = () => {
    setShowRestartConfirm(false);
  };

  return (
    <>
      <div>
        {moduleName || 'Module inconnu'} / {lessonName ?? 'Leçon non configurée'}
      </div>

      <hr />

      {/* Notes Section */}
      <div>
        <button 
          onClick={handleNotesToggle}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] w-full text-left"
        >
          Carnet
        </button>
        
        {isNotesOpen && (
          <div>
            <textarea
              value={notesText}
              onChange={(e) => {
                if (!isEditingNote) {
                  setIsEditingNote(true);
                }
                setNotesText(e.target.value);
              }}
              placeholder="Ajoutez vos notes ici..."
              rows={4}
            />
            <div>
              <button 
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !notesText.trim()}
              >
                {isSavingNotes ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button onClick={() => setIsNotesOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bookmark Section */}
      <div>
        <button 
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading || !currentSlideId}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentSlideId && isBookmarked(currentSlideId) 
            ? "Retirer le signet" 
            : "Enregistrer le signet"
          }
        </button>
      </div>

      {/* Help Section */}
      <div>
        <button 
          onClick={handleHelpClick}
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] w-full text-left"
        >
          Raichel
        </button>
        
        {showHelp && (
          <div>
            Assistance intelligente arrive bientôt ✨
            <button onClick={() => setShowHelp(false)}>
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: Restart and Quit */}
      <div className="mt-auto flex flex-col gap-4">

        {/* Restart Section */}
        <div>
          <button 
            onClick={handleRestartClick}
            className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] w-full text-left"
          >
            Redémarrer
          </button>
          
          {showRestartConfirm && (
            <div>
              Êtes-vous sûr ?
              <div>
                <button onClick={handleRestartConfirm}>
                  Oui
                </button>
                <button onClick={handleRestartCancel}>
                  Non
                </button>
              </div>
            </div>
          )}
        </div>

        <Link 
          href="/lecons"
          className="bg-[#edeae7] text-[#077373] rounded-md shadow-sm px-4 py-2 transition-all duration-200 hover:bg-[#d3e5de] hover:shadow-md active:bg-[#b8d3c8] block text-left no-underline"
        >
          Quitter
        </Link>
      </div>
    </>
  );
}
