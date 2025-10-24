import { ReactNode } from "react";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    // This outer div sits INSIDE (app)/layout.tsx, which already gives beige bg and header.
    // We tell it: take the remaining height under the header (flex-1),
    // center the white card, and add page padding.
    <div className="flex flex-1 justify-center px-4 py-6">
      {/* WHITE CARD */}
      <div
        className="
          w-full max-w-screen-lg
          bg-white text-[#222326]
          border border-[#ddd] rounded-xl shadow-sm
          flex flex-col
          min-h-[95vh]
          max-h-[98vh]
          overflow-hidden
        "
      >
        {children}
      </div>
    </div>
  );
}
