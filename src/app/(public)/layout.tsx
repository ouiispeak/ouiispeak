import type { ReactNode } from "react";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex-1 flex flex-col">
      <PublicHeader />
      <main>
        {children}
      </main>
    </section>
  );
}
