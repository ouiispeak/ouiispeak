import { ReactNode } from "react";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden lesson-page">
      <div className="w-full max-w-none flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
