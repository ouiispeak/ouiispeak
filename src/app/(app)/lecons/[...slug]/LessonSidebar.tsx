import Link from "next/link";

type LessonSidebarProps = {
  moduleName: string;
  lessonName: string;
};

export default function LessonSidebar({ moduleName, lessonName }: LessonSidebarProps) {
  return (
    <>
      <div>
        {moduleName} / {lessonName}
      </div>

      <hr />

      <button>
        Notes (présentes)
      </button>

      <button>
        Signet enregistré
      </button>

      <button>
        Aide
      </button>

      <button>
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
