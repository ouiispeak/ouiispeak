import { ReactNode } from "react";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-screen-lg flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
