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
    <section className="min-h-screen bg-[#f6f5f3] text-[#222326] px-4 py-6 flex justify-center">
      {/* children here should render the LessonShell */}
      <div className="w-full max-w-screen-lg border border-[#ddd] rounded-xl bg-white shadow-sm overflow-hidden">
        {children}
      </div>
    </section>
  );
}