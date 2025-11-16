import { type CSSProperties, type ReactNode } from "react";

type PaperCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function PaperCard({ children, className = "", style }: PaperCardProps) {
  return (
    <div
      className={[
        "bg-[#f7f6f4] text-[#222326]",
        "rounded-lg p-6",
        "shadow-[2px_2px_4px_rgba(0,0,0,0.15),-1px_-1px_2px_rgba(255,255,255,0.95)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}
