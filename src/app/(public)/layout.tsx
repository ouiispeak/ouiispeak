import type { ReactNode } from "react";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen bg-[#f6f5f3] text-[#222326]">
      <PublicHeader />
      <main className="px-6 pb-12">
        {children}
      </main>
    </section>
  );
}
