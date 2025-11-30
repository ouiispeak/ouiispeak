/**
 * Utility functions for setting up audio visualization.
 * Pure functions with no React dependencies.
 */

/**
 * Sets up audio visualization for a given media stream.
 * Creates an AudioContext, AnalyserNode, and connects them to the stream.
 * 
 * @param stream - The MediaStream to visualize
 * @returns Promise that resolves to an object containing the AudioContext and AnalyserNode
 * @throws Error if audio visualization setup fails
 */
export async function setupAudioVisualization(
  stream: MediaStream
): Promise<{ audioContext: AudioContext; analyser: AnalyserNode }> {
  console.log('Setting up audio visualization...');

  // Create AudioContext with fallback for webkit browsers
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  
  if (!AudioContextClass) {
    throw new Error('AudioContext is not supported in this browser');
  }

  const audioContext = new AudioContextClass();
  console.log('Audio context created, state:', audioContext.state);

  // Resume audio context if suspended (required for some browsers)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
    console.log('Audio context resumed, new state:', audioContext.state);
  }

  // Create analyser node with optimized settings
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.3; // Lower for more responsive

  console.log('Creating media stream source from stream:', stream.id);
  const microphone = audioContext.createMediaStreamSource(stream);
  console.log('Media stream source created');

  microphone.connect(analyser);
  console.log('Analyser connected to microphone source');

  // Verify connection
  console.log('Analyser node:', {
    fftSize: analyser.fftSize,
    frequencyBinCount: analyser.frequencyBinCount,
    smoothingTimeConstant: analyser.smoothingTimeConstant,
  });

  return { audioContext, analyser };
}

