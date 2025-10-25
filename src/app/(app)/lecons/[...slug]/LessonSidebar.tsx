"use client";

import Link from "next/link";
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
  const { hasAny, add } = useLessonNotes(lessonSlug);
  const { isBookmarked, add: addBookmark } = useLessonBookmarks(lessonSlug);
  
  const handleNotes = () => {
    // For now, just show a simple prompt
    const content = prompt("Ajouter une note pour cette leçon:");
    if (content && currentSlideId) {
      add(content, currentSlideId);
    }
  };

  const handleBookmark = () => {
    if (currentSlideId) {
      addBookmark(currentSlideId);
    }
  };

  const handleHelp = () => {
    alert("Aide: Utilisez les boutons Précédent/Suivant pour naviguer dans la leçon. Ajoutez des notes et des signets pour vous aider à réviser.");
  };

  return (
    <>
      <div>
        {moduleName} / {lessonName}
      </div>

      <hr />

      <button onClick={handleNotes}>
        Notes {hasAny ? "(présentes)" : "(aucune)"}
      </button>

      <button onClick={handleBookmark}>
        {currentSlideId && isBookmarked(currentSlideId) ? "Signet enregistré ✓" : "Ajouter signet"}
      </button>

      <button onClick={handleHelp}>
        Aide
      </button>

      <button onClick={onRestart}>
        Redémarrer
      </button>

      <Link href="/lecons">
        Quitter
      </Link>

      <div className="mt-auto">
        Barre latérale · outils
      </div>
    </>
  );
}
