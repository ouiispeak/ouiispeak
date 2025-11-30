export type ElementStatus = 'pending' | 'correct' | 'incorrect' | 'passed';

export const getElementStyles = (
  isCurrent: boolean,
  isPlayed: boolean,
  status: ElementStatus
) => {
  // Status-based colors take priority
  if (status === 'correct') {
    // Correct (≥80%) - green momentarily
    return {
      textColor: 'text-[#9bbfb2]',
      borderColor: 'border-[#9bbfb2]',
    };
  }
  if (status === 'incorrect') {
    // Incorrect (<80%) - red
    return {
      textColor: 'text-[#bf6f6f]',
      borderColor: 'border-[#bf6f6f]',
    };
  }
  if (status === 'passed') {
    // Passed - gray (default passed state)
    return {
      textColor: 'text-[#a6a198]',
      borderColor: 'border-[#a6a198]',
    };
  }
  
  // Status is 'pending' - use current/played logic
  if (isCurrent) {
    // Currently being played - teal color
    return {
      textColor: 'text-[#0c9599]',
      borderColor: 'border-[#0c9599]',
    };
  }
  if (isPlayed) {
    // Finished playing - gray color
    return {
      textColor: 'text-[#a6a198]',
      borderColor: 'border-[#a6a198]',
    };
  }
  // Default - not played yet
  return {
    textColor: 'text-[#222326]',
    borderColor: 'border-[#e3e0dc]',
  };
};

export const calculateAccuracy = (
  results: { reference: string; actual: string | null; correct: boolean }[]
): number => {
  if (results.length === 0) return 0;
  const correctCount = results.filter((r) => r.correct).length;
  return (correctCount / results.length) * 100;
};
