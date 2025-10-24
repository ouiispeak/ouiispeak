import { ReactNode } from "react";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center flex-1 px-4 py-6">
      <div
        className="
          w-full max-w-screen-lg
          bg-white text-[#222326]
          border border-[#ddd] rounded-xl shadow-sm
          flex flex-col
          min-h-[80vh] max-h-[100vh]
          overflow-hidden
        "
      >
        {children}
      </div>
    </div>
  );
}