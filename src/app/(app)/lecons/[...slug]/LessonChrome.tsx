import { ReactNode } from "react";
import PaperCard from "@/components/ui/PaperCard";

type LessonChromeProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarState?: 'full' | 'collapsed' | 'hidden';
};

export default function LessonChrome({ children, sidebar, sidebarState = 'full' }: LessonChromeProps) {
  return (
    <main className="flex h-[85vh] w-full items-center justify-center bg-transparent px-2">
      <PaperCard
        className="lesson-surface flex h-full w-full max-w-none flex-col items-stretch gap-4 md:flex-row md:gap-6"
        style={{ backgroundColor: '#ece9e3' }}
      >
        {sidebar && (
          <aside
            data-sidebar-state={sidebarState}
            className="lesson-sidebar flex h-full w-full flex-shrink-0"
          >
            <PaperCard
              className="flex h-full w-full flex-col items-center justify-between gap-6 md:gap-8"
              style={{ backgroundColor: '#f0ede9' }}
            >
              {sidebar}
            </PaperCard>
          </aside>
        )}

        <PaperCard className="flex h-full flex-1 flex-col" style={{ backgroundColor: '#f0ede9' }}>
          {children}
        </PaperCard>
      </PaperCard>
      <style jsx>{`
        .lesson-sidebar {
          transition: width 0.5s ease, min-width 0.5s ease, max-width 0.5s ease;
        }

        @media (min-width: 768px) {
          .lesson-sidebar[data-sidebar-state='full'] {
            width: 16rem;
            min-width: 16rem;
            max-width: 16rem;
          }

          .lesson-sidebar[data-sidebar-state='collapsed'] {
            width: 8rem;
            min-width: 6rem;
            max-width: 8rem;
          }

          .lesson-sidebar[data-sidebar-state='hidden'] {
            width: 4.5rem;
            min-width: 4.5rem;
            max-width: 4.5rem;
          }
        }
      `}</style>
    </main>
  );
}
