/**
 * Utility functions for calculating audio levels from AnalyserNode data.
 * Pure functions with no React dependencies.
 */

/**
 * Calculates the normalized audio level (0-1) from an AnalyserNode.
 * Uses RMS (Root Mean Square) calculation on time domain data for accurate volume detection.
 * 
 * @param analyser - The AnalyserNode to read audio data from
 * @returns Normalized audio level between 0 and 1
 */
export function calculateAudioLevel(analyser: AnalyserNode): number {
  // Use time domain data for better volume detection
  const dataArray = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(dataArray);
  
  // Calculate RMS (Root Mean Square) for volume
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / dataArray.length);
  const normalizedLevel = Math.min(rms * 2, 1); // Scale and clamp to 0-1
  
  return normalizedLevel;
}

