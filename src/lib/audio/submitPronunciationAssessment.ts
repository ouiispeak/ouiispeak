/**
 * Utility functions for submitting pronunciation assessments to the API.
 * Pure functions with no React dependencies.
 */

export type PronunciationAssessmentResult = {
  transcript: string;
  score: number;
  words: Array<{ reference: string; actual: string | null; correct: boolean }>;
};

/**
 * Submits an audio blob to the pronunciation assessment API.
 * Creates FormData, sends POST request, and parses the response.
 * 
 * @param blob - The audio blob to submit
 * @param referenceText - The reference text to compare against
 * @returns Promise that resolves to the assessment result
 * @throws Error if the API request fails
 */
export async function submitPronunciationAssessment(
  blob: Blob,
  referenceText: string
): Promise<PronunciationAssessmentResult> {
  console.log('Sending audio to pronunciation assessment API...', {
    blobSize: blob.size,
    referenceText,
  });

  const formData = new FormData();
  formData.append('file', blob, 'audio.webm');

  const res = await fetch(
    `/api/pronunciation-assessment?referenceText=${encodeURIComponent(referenceText)}`,
    {
      method: 'POST',
      body: formData,
    },
  );

  console.log('API response status:', res.status, res.statusText);

  if (!res.ok) {
    // Try to parse error response as JSON, fallback to empty object
    const body = await res.json().catch(() => ({}));
    console.error('API error response:', body);
    const errorMessage = body.error ?? `Server error (${res.status})`;
    throw new Error(errorMessage);
  }

  const data = await res.json();
  console.log('Pronunciation assessment result:', data);

  return {
    transcript: data.transcript ?? '',
    score: data.score ?? 0,
    words: data.words ?? [],
  };
}

