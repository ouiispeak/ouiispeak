import { ReactNode } from "react";

type LessonLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function LessonLayout({ children, sidebar }: LessonLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      {/* MAIN LESSON AREA */}
      <div className="flex-1 min-w-0 flex flex-col items-center text-center">
        {children}
      </div>

      {/* SIDEBAR AREA - OPTIONAL */}
      {sidebar && (
        <aside className="w-full md:w-56 border-t md:border-t-0 md:border-l flex flex-col text-center md:text-left">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
