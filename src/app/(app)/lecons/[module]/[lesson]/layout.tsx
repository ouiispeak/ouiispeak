import { ReactNode } from "react";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center flex-1">
      <div className="w-full max-w-screen-lg flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
