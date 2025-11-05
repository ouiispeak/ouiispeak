import { ReactNode } from "react";

type LessonLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function LessonLayout({ children, sidebar }: LessonLayoutProps) {
  return (
    // PINK: overall lesson area – full width, ~95% viewport height
    <div className="w-full min-h-[85vh] flex bg-[#d9d3cc] rounded-md shadow-sm">
      {/* BLUE: Inner container: padding around edges, flex row on desktop */}
      <div className="w-full flex flex-col md:flex-row px-4 md:px-8 py-6 md:py-8 gap-y-8 md:gap-x-6 md:gap-y-0">
        {/* YELLOW: tools sidebar - adapts to red border section */}
        {sidebar && (
          <aside className="md:flex-shrink-0 flex flex-col w-max p-4 bg-[#EDEAE7] rounded-md shadow-sm">
            {/* RED: inner tools stack - only as wide as necessary, no text wrapping */}
            <div className="flex flex-col flex-1 gap-4 pt-4 px-4 pb-2 w-fit">
              {sidebar}
            </div>
          </aside>
        )}

        {/* GREEN: main lesson module - fills remaining space */}
        <section className="md:flex-1 min-w-0 flex flex-col bg-[#EDEAE7] rounded-md shadow-sm">
          <div className="flex flex-col flex-1 p-4 gap-4">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
