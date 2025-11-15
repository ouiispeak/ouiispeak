import { ReactNode } from "react";

type PaperCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PaperCard({ children, className = "" }: PaperCardProps) {
  return (
    <div
      className={[
        "bg-[#f3f1ef] text-[#222326]",
        "rounded-2xl p-6",
        "shadow-[6px_6px_16px_rgba(0,0,0,0.08),-6px_-6px_16px_rgba(255,255,255,0.8)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

