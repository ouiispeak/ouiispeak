"use client";

import { useState, useEffect, useMemo } from "react";
import type { SVGProps } from "react";
import { useLessonNotes } from "@/components/lesson/useLessonNotes";
import { useLessonBookmarks } from "@/components/lesson/useLessonBookmarks";
import SoftIconButton from "@/components/CircleButton";
import { useRouter } from "next/navigation";

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-5 w-5",
  "aria-hidden": true,
};

const NotebookIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="2" width="12" height="20" rx="2" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <path d="M15 13l6 6" />
    <path d="M21 17l-4-4-2 2 4 4 2-2z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg {...iconProps}>
    <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z" />
  </svg>
);

const BrainIcon = () => (
  <svg {...iconProps}>
    <path d="M15 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3" />
    <path d="M9 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3" />
    <path d="M12 8h1a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-1" />
    <path d="M12 12h-1a2 2 0 0 0-2 2 2 2 0 0 0 2 2h1" />
  </svg>
);

const RotateCcwIcon = () => (
  <svg {...iconProps}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const ExitIcon = () => (
  <svg {...iconProps}>
    <path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
    <polyline points="15 17 20 12 15 7" />
    <line x1="20" y1="12" x2="8" y2="12" />
  </svg>
);

type LessonSidebarProps = {
  moduleName: string;
  lessonName?: string | null;
  lessonSlug: string;
  currentSlideId?: string;
  onRestartAction?: () => void;
};

export default function LessonSidebar({
  moduleName: _moduleName,
  lessonName: _lessonName,
  lessonSlug,
  currentSlideId,
  onRestartAction,
}: LessonSidebarProps) {
  const router = useRouter();
  const { notes, add, loading: notesLoading } = useLessonNotes(lessonSlug);
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

  const handleQuit = () => {
    router.push("/lecons");
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex w-full justify-between gap-6 md:h-full md:flex-col md:items-center md:justify-between md:gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center">
              <SoftIconButton
                ariaLabel={isNotesOpen ? "Fermer le carnet" : "Ouvrir le carnet"}
                onClick={handleNotesToggle}
                disabled={notesLoading}
              >
                <NotebookIcon />
              </SoftIconButton>
            </div>
            {isNotesOpen && (
              <div className="w-full space-y-2 md:w-48">
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
                  className="w-full rounded-md border border-slate-200 p-2 text-sm"
                />
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || !notesText.trim()}
                    className="rounded-md bg-[#077373] px-3 py-1 text-white disabled:opacity-50"
                  >
                    {isSavingNotes ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => setIsNotesOpen(false)}
                    className="rounded-md border border-[#077373] px-3 py-1 text-[#077373]"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <SoftIconButton
              ariaLabel={
                currentSlideId && isBookmarked(currentSlideId)
                  ? "Retirer le signet"
                  : "Enregistrer un signet"
              }
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading || !currentSlideId}
            >
              <BookmarkIcon />
            </SoftIconButton>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center">
              <SoftIconButton ariaLabel="Raichel" onClick={handleHelpClick}>
                <BrainIcon />
              </SoftIconButton>
            </div>
            {showHelp && (
              <div className="w-full rounded-md bg-[#f6f5f3] p-3 text-sm text-[#333] md:w-auto">
                Assistance intelligente arrive bientôt ✨
                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-2 rounded-md border border-[#077373] px-3 py-1 text-[#077373]"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center">
            <SoftIconButton ariaLabel="Redémarrer la leçon" onClick={handleRestartClick}>
              <RotateCcwIcon />
            </SoftIconButton>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center">
              <SoftIconButton ariaLabel="Quitter la leçon" onClick={handleQuit}>
                <ExitIcon />
              </SoftIconButton>
            </div>
            {showRestartConfirm && (
              <div className="w-full rounded-md bg-[#fff7ed] p-3 text-center text-sm text-[#92400e] md:w-auto">
                Êtes-vous sûr ?
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    onClick={handleRestartConfirm}
                    className="rounded-md bg-[#077373] px-3 py-1 text-white"
                  >
                    Oui
                  </button>
                  <button
                    onClick={handleRestartCancel}
                    className="rounded-md border border-[#077373] px-3 py-1 text-[#077373]"
                  >
                    Non
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
