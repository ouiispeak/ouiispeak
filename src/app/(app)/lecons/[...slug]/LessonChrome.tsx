import { ReactNode } from "react";
import PaperCard from "@/components/ui/PaperCard";

type LessonChromeProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarState?: 'full' | 'collapsed' | 'hidden';
  editorPanel?: ReactNode;
  isEditorOpen?: boolean;
};

export default function LessonChrome({ 
  children, 
  sidebar, 
  sidebarState = 'full',
  editorPanel,
  isEditorOpen = false,
}: LessonChromeProps) {
  return (
    <main className="flex min-h-[70vh] md:h-[85vh] w-full items-center justify-center bg-transparent px-2">
      <PaperCard
        className="lesson-surface flex h-full w-full max-w-none flex-col items-stretch gap-3 sm:gap-4 md:flex-row md:gap-6"
        style={{ backgroundColor: '#ece9e3' }}
      >
        {/* Show editor in place of sidebar when open */}
        {isEditorOpen && editorPanel ? (
          <aside
            data-editor-open="true"
            className="lesson-editor flex h-full w-full flex-shrink-0"
          >
            {editorPanel}
          </aside>
        ) : sidebar ? (
          <aside
            data-sidebar-state={sidebarState}
            className="lesson-sidebar flex h-full w-full flex-shrink-0"
          >
            <PaperCard
              className="flex h-full w-full flex-col items-center justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8"
              style={{ backgroundColor: '#f0ede9' }}
            >
              {sidebar}
            </PaperCard>
          </aside>
        ) : null}

        <PaperCard 
          className="flex h-full flex-1 flex-col" 
          style={{ backgroundColor: '#f0ede9' }}
        >
          {children}
        </PaperCard>
      </PaperCard>
      <style jsx>{`
        .lesson-sidebar {
          transition: width 0.5s ease, min-width 0.5s ease, max-width 0.5s ease;
        }

        .lesson-editor {
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

          .lesson-editor[data-editor-open='true'] {
            width: 40%;
            min-width: 20rem;
            max-width: 40%;
          }
        }

        @media (max-width: 767px) {
          .lesson-editor[data-editor-open='true'] {
            width: 100%;
            min-width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
