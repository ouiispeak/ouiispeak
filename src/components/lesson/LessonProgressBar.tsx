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
         <div className="h-3 md:h-3.5 py-1 w-full overflow-hidden rounded-full bg-[#e5e2df]">
           <div
             className="h-2 rounded-full bg-[#2E8C8C] transition-all duration-500 ease-out motion-reduce:transition-none"
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
