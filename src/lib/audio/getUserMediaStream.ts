/**
 * Utility functions for acquiring user media streams.
 * Pure functions with no React dependencies.
 */

/**
 * Gets a user media stream with audio constraints optimized for speech recording.
 * 
 * @returns Promise that resolves to a MediaStream
 * @throws Error if getUserMedia is not supported or fails
 */
export async function getUserMediaStream(): Promise<MediaStream> {
  if (typeof window === 'undefined') {
    throw new Error('getUserMedia can only be called in browser environment');
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('L\'enregistrement audio n\'est pas pris en charge dans ce navigateur.');
  }

  // Request audio with specific constraints
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  // Log stream details for debugging
  console.log('Got media stream:', stream);
  console.log('Stream ID:', stream.id);
  console.log('Active:', stream.active);
  const audioTracks = stream.getAudioTracks();
  console.log('Audio tracks:', audioTracks.length);
  audioTracks.forEach((track, i) => {
    console.log(`Track ${i}:`, {
      id: track.id,
      kind: track.kind,
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      settings: track.getSettings(),
      constraints: track.getConstraints(),
    });
  });

  return stream;
}

/**
 * Formats a getUserMedia error into a user-friendly message.
 * 
 * @param err - The error from getUserMedia
 * @returns User-friendly error message in French
 */
export function getUserMediaError(err: unknown): string {
  console.error('getUserMedia error:', err);
  const isPermissionError = err instanceof DOMException && err.name === 'NotAllowedError';
  return isPermissionError
    ? "L'accès au micro a été refusé."
    : "Impossible d'accéder au micro.";
}

