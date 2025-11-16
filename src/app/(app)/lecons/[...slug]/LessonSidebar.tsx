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
  className: "h-5 w-5 opacity-70 hover:opacity-100 transition-opacity duration-200",
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

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    {...iconProps}
    className={[
      iconProps.className,
      filled ? 'opacity-100 fill-[#222326] stroke-[#222326]' : '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <path
      d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2z"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'currentColor' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

const EyeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
    aria-hidden={true}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
    aria-hidden={true}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200"
    aria-hidden={true}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

type LessonSidebarProps = {
  lessonSlug: string;
  currentSlideId?: string;
  onRestartAction?: () => void;
  sidebarState?: 'full' | 'collapsed' | 'hidden';
  onSidebarStateChange?: (next: 'full' | 'collapsed' | 'hidden') => void;
  lastVisibleSidebarState?: 'full' | 'collapsed';
};

export default function LessonSidebar({
  lessonSlug,
  currentSlideId,
  onRestartAction,
  sidebarState,
  onSidebarStateChange,
  lastVisibleSidebarState,
}: LessonSidebarProps) {
  const effectiveSidebarState = sidebarState ?? 'full';
  const router = useRouter();
  const { notes, add, loading: notesLoading } = useLessonNotes(lessonSlug);
  const { isBookmarked, add: addBookmark, remove: removeBookmark, loading: bookmarkLoading } = useLessonBookmarks(lessonSlug);
  
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
      if (isBookmarked(currentSlideId)) {
        await removeBookmark(currentSlideId);
      } else {
        await addBookmark(currentSlideId);
      }
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

  const isFull = effectiveSidebarState === 'full';
  const iconLayoutClass = 'flex w-full items-center text-left';
  const sectionAlignmentClass = 'items-start';
  const labelClassName = [
    'text-xs text-[#4b4842] whitespace-nowrap text-left overflow-hidden',
    'transition-[max-width,opacity] duration-300 ease-in-out',
    'ml-3',
    isFull ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0',
  ].join(' ');

  // Early return for hidden state – use the remembered visible state
  if (effectiveSidebarState === 'hidden') {
    const restoreTarget =
      lastVisibleSidebarState === 'full' || lastVisibleSidebarState === 'collapsed'
        ? lastVisibleSidebarState
        : 'full';

    return (
      <div className="group flex h-full w-full items-center justify-end">
        {onSidebarStateChange && (
          <button
            type="button"
            onClick={() => onSidebarStateChange(restoreTarget)}
            className="h-24 w-3 rounded-r-full bg-[#e0ddd8] hover:bg-[#d7d3cd] transition-colors duration-200"
            aria-label="Afficher les outils"
          />
        )}
      </div>
    );
  }

  // MAIN return for 'full' and 'collapsed'
  return (
    <div className="flex h-full w-full">
      <div
        className={[
          'flex w-full justify-between gap-6 md:h-full md:flex-col md:justify-between md:gap-8',
          'items-start md:items-center',
        ].join(' ')}
      >
        <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-4`}>
          <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-3`}>
            <div className={iconLayoutClass}>
              <SoftIconButton
                ariaLabel={isNotesOpen ? "Fermer le carnet" : "Ouvrir le carnet"}
                onClick={handleNotesToggle}
                disabled={notesLoading}
                className="flex-shrink-0"
              >
                <NotebookIcon />
              </SoftIconButton>
              <span className={labelClassName} aria-hidden={!isFull}>
                Journal
              </span>
            </div>
            {effectiveSidebarState === 'full' && isNotesOpen && (
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
                    className="rounded-lg px-6 py-3 bg-[#e8e5e1] text-[#222326] hover:bg-[#e1ded9] transition-colors duration-200 disabled:opacity-50"
                  >
                    {isSavingNotes ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => setIsNotesOpen(false)}
                    className="rounded-lg px-6 py-3 bg-[#e8e5e1] text-[#222326] hover:bg-[#e1ded9] transition-colors duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={iconLayoutClass}>
                <SoftIconButton
                  ariaLabel={
                    currentSlideId && isBookmarked(currentSlideId)
                      ? "Retirer le signet"
                      : "Enregistrer un signet"
                  }
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading || !currentSlideId}
                  className="flex-shrink-0"
                >
                  <BookmarkIcon filled={!!(currentSlideId && isBookmarked(currentSlideId))} />
                </SoftIconButton>
            <span className={labelClassName} aria-hidden={!isFull}>
              Favoris
            </span>
          </div>

          <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-2`}>
            <div className={iconLayoutClass}>
              <SoftIconButton ariaLabel="Raichel" onClick={handleHelpClick} className="flex-shrink-0">
                <BrainIcon />
              </SoftIconButton>
              <span className={labelClassName} aria-hidden={!isFull}>
                Aide
              </span>
            </div>
            {effectiveSidebarState === 'full' && showHelp && (
              <div className="w-full rounded-md bg-[#f6f5f3] p-3 text-sm text-[#333] md:w-auto">
                Assistance intelligente arrive bientôt ✨
                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-2 rounded-xl px-6 py-3 bg-[#e8e5e1] text-[#222326] hover:bg-[#e1ded9] transition-colors duration-200"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-4`}>
          {onSidebarStateChange && (
            <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-2`}>
              <div className={iconLayoutClass}>
                <SoftIconButton
                  ariaLabel={
                    effectiveSidebarState === 'full'
                      ? 'Réduire la barre latérale'
                      : 'Développer la barre latérale'
                  }
                  onClick={() =>
                    onSidebarStateChange(
                      effectiveSidebarState === 'full' ? 'collapsed' : 'full'
                    )
                  }
                  className="flex-shrink-0"
                >
                  {effectiveSidebarState === 'full' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </SoftIconButton>
                <span className={labelClassName} aria-hidden={!isFull}>
                  {effectiveSidebarState === 'full' ? 'Réduire' : 'Développer'}
                </span>
              </div>

              <div className={iconLayoutClass}>
                <SoftIconButton
                  ariaLabel="Masquer les outils"
                  onClick={() => onSidebarStateChange('hidden')}
                  className="flex-shrink-0"
                >
                  <EyeIcon />
                </SoftIconButton>
                <span className={labelClassName} aria-hidden={!isFull}>
                  Masquer
                </span>
              </div>
            </div>
          )}

          <div className={iconLayoutClass}>
            <SoftIconButton ariaLabel="Redémarrer la leçon" onClick={handleRestartClick} className="flex-shrink-0">
              <RotateCcwIcon />
            </SoftIconButton>
            <span className={labelClassName} aria-hidden={!isFull}>
              Recommencer
            </span>
          </div>

          <div className={`flex w-full flex-col ${sectionAlignmentClass} gap-2`}>
            <div className={iconLayoutClass}>
              <SoftIconButton ariaLabel="Quitter la leçon" onClick={handleQuit} className="flex-shrink-0">
                <ExitIcon />
              </SoftIconButton>
              <span className={labelClassName} aria-hidden={!isFull}>
                Quitter
              </span>
            </div>
            {effectiveSidebarState === 'full' && showRestartConfirm && (
              <div className="w-full rounded-md bg-[#fff7ed] p-3 text-center text-sm text-[#92400e] md:w-auto">
                Êtes-vous sûr ?
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    onClick={handleRestartConfirm}
                    className="rounded-lg px-6 py-3 bg-[#e8e5e1] text-[#222326] hover:bg-[#e1ded9] transition-colors duration-200"
                  >
                    Oui
                  </button>
                  <button
                    onClick={handleRestartCancel}
                    className="rounded-lg px-6 py-3 bg-[#e8e5e1] text-[#222326] hover:bg-[#e1ded9] transition-colors duration-200"
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
