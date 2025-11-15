import { ReactNode } from "react";
import PaperCard from "@/components/ui/PaperCard";

type LessonChromeProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarState?: 'full' | 'collapsed' | 'hidden';
};

export default function LessonChrome({ children, sidebar, sidebarState = 'full' }: LessonChromeProps) {
  const compactWidthClass = 'w-fit min-w-[4.5rem]';
  const sidebarWidthClass =
    sidebarState === 'hidden'
      ? compactWidthClass
      : sidebarState === 'collapsed'
        ? compactWidthClass
        : 'w-full md:w-64';

  return (
    <main className="flex h-[85vh] w-full items-center justify-center bg-[#f6f5f3]">
      <PaperCard className="lesson-surface flex h-full w-screen max-w-none flex-col items-stretch gap-4 md:flex-row md:gap-6">
        {sidebar && (
          <aside
            className={[
              'flex h-full flex-shrink-0 transition-all duration-300',
              sidebarWidthClass,
            ].join(' ')}
          >
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
