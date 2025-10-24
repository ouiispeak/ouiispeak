import { ReactNode } from "react";

export default function LessonLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This layout does not decide auth or data. It just gives the lesson page
  // the correct background, centering, and card shell spacing.
  //
  // The real structure happens in LessonShell, which will live inside this.
  // We keep this super light so it's easy to maintain.

  return (
    <section className="bg-[#f6f5f3] text-[#222326] px-4 py-6 flex justify-center">
      {/* Card wrapper */}
      <div className="w-full max-w-screen-lg min-h-[98vh] border border-[#ddd] rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
        {children}
      </div>
    </section>
  );  
}