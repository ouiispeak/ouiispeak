"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLessonNotes } from "@/components/lesson/useLessonNotes";
import { useLessonBookmarks } from "@/components/lesson/useLessonBookmarks";

type LessonSidebarProps = {
  moduleName: string;
  lessonName: string;
  lessonSlug: string;
  currentSlideId?: string;
  onRestart?: () => void;
};

export default function LessonSidebar({ 
  moduleName, 
  lessonName, 
  lessonSlug, 
  currentSlideId,
  onRestart 
}: LessonSidebarProps) {
  const { notes, hasAny, add, loading: notesLoading } = useLessonNotes(lessonSlug);
  const { isBookmarked, add: addBookmark, loading: bookmarkLoading } = useLessonBookmarks(lessonSlug);
  
  // Local UI state
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  
  // Update notes text when notes change
  useEffect(() => {
    if (notes.length > 0) {
      setNotesText(notes.map(n => n.content).join('\n\n'));
    }
  }, [notes]);
  
  const handleNotesToggle = () => {
    setIsNotesOpen(!isNotesOpen);
  };

  const handleSaveNotes = async () => {
    if (!notesText.trim() || !currentSlideId) return;
    
    setIsSavingNotes(true);
    try {
      await add(notesText.trim(), currentSlideId);
      setIsNotesOpen(false);
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
    onRestart?.();
    setShowRestartConfirm(false);
  };

  const handleRestartCancel = () => {
    setShowRestartConfirm(false);
  };

  return (
    <>
      <div>
        {moduleName} / {lessonName}
      </div>

      <hr />

      {/* Notes Section */}
      <div>
        <button onClick={handleNotesToggle}>
          Notes {hasAny ? "(présentes)" : "(aucune)"}
        </button>
        
        {isNotesOpen && (
          <div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
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
        >
          {currentSlideId && isBookmarked(currentSlideId) 
            ? "Retirer le signet" 
            : "Enregistrer le signet"
          }
        </button>
      </div>

      {/* Help Section */}
      <div>
        <button onClick={handleHelpClick}>
          Aide
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

      {/* Restart Section */}
      <div>
        <button onClick={handleRestartClick}>
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

      <Link href="/lecons">
        Quitter
      </Link>

      <div className="mt-auto">
        Barre latérale · outils
      </div>
    </>
  );
}
