import type { ReactNode } from 'react';

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-center bg-[#f6f5f3] text-[#222326] px-4 py-6">
      <div className="w-full max-w-screen-lg border border-[#ddd] rounded-xl bg-white shadow-sm flex flex-col md:flex-row overflow-hidden">
        {children}
      </div>
    </div>
  );
}
