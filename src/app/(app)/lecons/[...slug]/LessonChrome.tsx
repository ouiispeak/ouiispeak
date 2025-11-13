import { ReactNode } from "react";
import PaperCard from "@/components/ui/PaperCard";

type LessonChromeProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function LessonChrome({ children, sidebar }: LessonChromeProps) {
  return (
    <main className="flex h-[85vh] w-full items-center justify-center bg-[#f6f5f3]">
      <PaperCard className="lesson-surface flex h-full w-screen max-w-none flex-col items-stretch gap-4 md:flex-row md:gap-6">
        {sidebar && (
          <aside className="flex h-full w-full flex-shrink-0 md:w-auto">
            <PaperCard className="flex h-full w-full flex-col items-center justify-between gap-6 md:gap-8">
              {sidebar}
            </PaperCard>
          </aside>
        )}

        <PaperCard className="flex h-full flex-1 flex-col">
          {children}
        </PaperCard>
      </PaperCard>
    </main>
  );
}
