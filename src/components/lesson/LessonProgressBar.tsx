import { memo } from "react";

 type LessonProgressBarProps = {
   current: number;
   total: number;
   showLabel?: boolean;
   ariaLabel?: string;
   className?: string;
 };

 function LessonProgressBar({
   current,
   total,
   showLabel = true,
   ariaLabel = "Lesson progress",
   className = "",
 }: LessonProgressBarProps) {
   const safeTotal = Math.max(0, total || 0);
   const safeIndex = Math.max(0, current || 0);
   const percent = safeTotal > 0 ? Math.min(100, Math.max(0, ((safeIndex + 1) / safeTotal) * 100)) : 0;
   const roundedPercent = Math.round(percent);
   const percentText = `${roundedPercent}%`;

   return (
     <div className={["w-full", className].filter(Boolean).join(" ")}
     >
       <div
         className="w-full"
         role="progressbar"
         aria-label={ariaLabel}
         aria-valuemin={0}
         aria-valuemax={100}
         aria-valuenow={roundedPercent}
       >
        <div className="h-3 md:h-3.5 w-full rounded-full bg-[#ece9e3] p-[2px] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.95)]">
          <div
            className="h-full rounded-full bg-[#2E8C8C] transition-all duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
         <span className="sr-only">{`${ariaLabel}: ${percentText} complete`}</span>
       </div>

       {showLabel && (
         <p className="mt-1 text-center text-xs text-[#222326]" aria-hidden="true">
           {percentText} complete
         </p>
       )}
     </div>
   );
 }

 export default memo(LessonProgressBar);
