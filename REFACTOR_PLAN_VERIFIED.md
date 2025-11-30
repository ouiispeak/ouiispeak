# Verified Refactoring Plan for OpenSourcePronunciation.tsx

## Overview
This document outlines a safe, incremental refactoring plan to extract logic from `OpenSourcePronunciation.tsx` into reusable utilities and hooks, avoiding the infinite render loop issues encountered previously.

---

## Phase 1: Extract Pure Utility Functions
**Goal:** Extract functions with NO React dependencies (no hooks, no state, no refs)
**Risk Level:** ✅ Very Low - Pure functions are easy to test and can't cause render loops

### Step 1.1: Extract getUserMedia Stream Acquisition
**File:** `src/lib/audio/getUserMediaStream.ts`

**What to extract:**
- Lines 78-114: `getUserMedia` call with error handling
- Audio constraints configuration
- Error message formatting

**Function signature:**
```typescript
export async function getUserMediaStream(): Promise<MediaStream>
export function getUserMediaError(err: unknown): string
```

**Dependencies:** None (pure browser API calls)

**Verification:**
- ✅ No React imports
- ✅ No state/refs used
- ✅ Can be called from anywhere
- ✅ Easy to unit test

**After extraction, component will:**
```typescript
import { getUserMediaStream, getUserMediaError } from '@/lib/audio/getUserMediaStream';

// In startRecording:
try {
  stream = await getUserMediaStream();
  streamRef.current = stream;
} catch (err) {
  setError(getUserMediaError(err));
  return;
}
```

---

### Step 1.2: Extract Audio Visualization Setup
**File:** `src/lib/audio/setupAudioVisualization.ts`

**What to extract:**
- Lines 120-158: AudioContext and AnalyserNode creation
- Stream source connection
- Configuration (fftSize, smoothingTimeConstant)

**Function signature:**
```typescript
export async function setupAudioVisualization(
  stream: MediaStream
): Promise<{ audioContext: AudioContext; analyser: AnalyserNode }>
```

**Dependencies:** 
- Input: `MediaStream` (pure parameter)
- Output: AudioContext/AnalyserNode (pure return)

**Verification:**
- ✅ No React imports
- ✅ No state/refs used
- ✅ Pure function (input → output)
- ✅ Easy to unit test

**After extraction, component will:**
```typescript
import { setupAudioVisualization } from '@/lib/audio/setupAudioVisualization';

// In startRecording:
try {
  const { audioContext, analyser } = await setupAudioVisualization(stream);
  audioContextRef.current = audioContext;
  analyserRef.current = analyser;
} catch (err) {
  console.error('Audio visualization error:', err);
}
```

---

### Step 1.3: Extract Audio Level Calculation
**File:** `src/lib/audio/calculateAudioLevel.ts`

**What to extract:**
- Lines 183-194: RMS calculation from AnalyserNode data
- Normalization logic

**Function signature:**
```typescript
export function calculateAudioLevel(analyser: AnalyserNode): number
```

**Dependencies:**
- Input: `AnalyserNode` (pure parameter)
- Output: `number` (0-1 normalized level)

**Verification:**
- ✅ No React imports
- ✅ No state/refs used
- ✅ Pure function
- ✅ Easy to unit test with mock AnalyserNode

**After extraction, component will:**
```typescript
import { calculateAudioLevel } from '@/lib/audio/calculateAudioLevel';

// In updateAudioLevel:
const normalizedLevel = calculateAudioLevel(analyser);
setAudioLevel(normalizedLevel);
```

---

### Step 1.4: Extract API Call Logic
**File:** `src/lib/audio/submitPronunciationAssessment.ts`

**What to extract:**
- Lines 261-300: FormData creation, fetch call, response parsing
- Error handling (JSON/text fallback)

**Function signature:**
```typescript
export async function submitPronunciationAssessment(
  blob: Blob,
  referenceText: string
): Promise<{
  transcript: string;
  score: number;
  words: Array<{ reference: string; actual: string | null; correct: boolean }>;
}>
```

**Dependencies:**
- Input: `Blob`, `string` (pure parameters)
- Output: Promise with result data
- Side effect: Network request (acceptable for utility function)

**Verification:**
- ✅ No React imports
- ✅ No state/refs used directly
- ✅ Can be called from anywhere
- ✅ Easy to mock/test

**After extraction, component will:**
```typescript
import { submitPronunciationAssessment } from '@/lib/audio/submitPronunciationAssessment';

// In mr.onstop:
try {
  const data = await submitPronunciationAssessment(blob, referenceText);
  setTranscript(data.transcript);
  setScore(data.score);
  setWords(data.words);
  onWordResults?.(data.words);
  onRecordingComplete?.();
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  setError(`Impossible de contacter le serveur de prononciation: ${errorMessage}`);
}
```

---

## Phase 2: Extract Custom Hooks (No Callback Dependencies)
**Goal:** Extract hooks that don't require callbacks from the component
**Risk Level:** ⚠️ Medium - Must ensure stable dependencies

### Step 2.1: Extract Audio Level Monitoring Hook
**File:** `src/hooks/audio/useAudioLevel.ts`

**What to extract:**
- Lines 168-220: Animation loop for audio level updates
- RequestAnimationFrame management
- AnalyserNode reading

**Hook signature:**
```typescript
export function useAudioLevel(
  analyser: AnalyserNode | null,
  isRecording: boolean
): number
```

**Dependencies:**
- `analyser`: From ref (stable reference)
- `isRecording`: From state (stable if properly managed)
- Returns: `audioLevel` number

**Verification:**
- ✅ No callbacks from component needed
- ✅ Dependencies are stable (refs don't change identity)
- ✅ Self-contained animation loop
- ✅ Cleanup on unmount/stop

**Implementation notes:**
- Use `useEffect` to start/stop animation loop based on `isRecording`
- Use `useRef` to store animation frame ID
- Cleanup on unmount or when `isRecording` becomes false

**After extraction, component will:**
```typescript
import { useAudioLevel } from '@/hooks/audio/useAudioLevel';

// In component:
const audioLevel = useAudioLevel(analyserRef.current, isRecording);
// Remove: const [audioLevel, setAudioLevel] = useState(0);
// Remove: animationFrameRef and updateAudioLevel function
```

---

### Step 2.2: Extract Silence Detection Hook
**File:** `src/hooks/audio/useSilenceDetection.ts`

**What to extract:**
- Lines 222-255: Silence threshold checking
- Duration tracking
- Auto-stop trigger

**Hook signature:**
```typescript
export function useSilenceDetection(
  audioLevel: number,
  isRecording: boolean,
  onSilenceDetected: () => void
): void
```

**Dependencies:**
- `audioLevel`: From Phase 2.1 hook (stable)
- `isRecording`: From state (stable)
- `onSilenceDetected`: Callback - **MUST BE MEMOIZED** with `useCallback`

**Verification:**
- ⚠️ Requires memoized callback
- ✅ Other dependencies are stable
- ✅ Self-contained logic

**Implementation notes:**
- Use `useRef` to track `silenceStartTime`
- Use `useEffect` to monitor `audioLevel` changes
- Call `onSilenceDetected()` when threshold exceeded

**After extraction, component will:**
```typescript
import { useSilenceDetection } from '@/hooks/audio/useSilenceDetection';

// In component:
const handleSilenceDetected = useCallback(() => {
  stopRecording();
}, [stopRecording]); // stopRecording must be stable

useSilenceDetection(audioLevel, isRecording, handleSilenceDetected);
// Remove: silenceStartTimeRef and silence detection logic from updateAudioLevel
```

---

## Phase 3: Extract MediaRecorder Hook (With Proper Memoization)
**Goal:** Extract MediaRecorder lifecycle management
**Risk Level:** ⚠️⚠️ High - Requires careful dependency management

### Step 3.1: Memoize All Callbacks First
**Location:** In `OpenSourcePronunciation.tsx` BEFORE creating hook

**Required callbacks:**
1. `handleStop` - API submission logic
2. `handleStreamReady` - Audio visualization setup
3. `handleError` - Error state updates
4. `handleDataAvailable` - Chunk collection (optional, can stay in hook)

**Implementation:**
```typescript
// Memoize handleStop
const handleStop = useCallback(async (blob: Blob) => {
  try {
    const data = await submitPronunciationAssessment(blob, referenceText);
    setTranscript(data.transcript);
    setScore(data.score);
    setWords(data.words);
    onWordResults?.(data.words);
    onRecordingComplete?.();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(`Impossible de contacter le serveur de prononciation: ${errorMessage}`);
  }
}, [referenceText, onWordResults, onRecordingComplete]); // ✅ Stable deps

// Memoize handleStreamReady
const handleStreamReady = useCallback(async (stream: MediaStream) => {
  try {
    const { audioContext, analyser } = await setupAudioVisualization(stream);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    // Start animation loop (handled by useAudioLevel hook)
  } catch (err) {
    console.error('Audio visualization error:', err);
  }
}, []); // ✅ No dependencies - pure setup

// Memoize handleError
const handleError = useCallback((err: Error) => {
  const isPermissionError = err instanceof DOMException && err.name === 'NotAllowedError';
  const message = isPermissionError
    ? "L'accès au micro a été refusé."
    : "Impossible d'accéder au micro.";
  setError(message);
}, []); // ✅ No dependencies - just sets error state
```

**Verification:**
- ✅ All callbacks use `useCallback`
- ✅ Dependency arrays are minimal and stable
- ✅ No inline function creation

---

### Step 3.2: Memoize Options Object
**Location:** In `OpenSourcePronunciation.tsx` AFTER memoizing callbacks

**Implementation:**
```typescript
const recorderOptions = useMemo(() => ({
  onStop: handleStop,
  onStreamReady: handleStreamReady,
  onError: handleError,
}), [handleStop, handleStreamReady, handleError]); // ✅ All deps are memoized
```

**Verification:**
- ✅ Options object only changes when callbacks change
- ✅ Callbacks are memoized, so options is stable
- ✅ Can be safely passed to hook

---

### Step 3.3: Create useMediaRecorder Hook
**File:** `src/hooks/audio/useMediaRecorder.ts`

**What to extract:**
- Lines 62-344: Entire `startRecording` function logic
- Lines 346-379: `stopRecording` function logic
- MediaRecorder ref management
- Stream ref management
- Chunks ref management
- Pending stop ref management

**Hook signature:**
```typescript
export type UseMediaRecorderOptions = {
  onStop?: (blob: Blob) => Promise<void> | void;
  onStreamReady?: (stream: MediaStream) => Promise<void> | void;
  onError?: (error: Error) => void;
};

export type UseMediaRecorderReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
};

export function useMediaRecorder(
  options?: UseMediaRecorderOptions
): UseMediaRecorderReturn
```

**Critical implementation details:**
1. Use `useRef` for all refs (mediaRecorderRef, streamRef, chunksRef, pendingStopRef)
2. Use `useState` for `isRecording` and `error`
3. Use `useCallback` for `startRecording` and `stopRecording` with `options` in deps
4. **CRITICAL:** Track options in a ref to avoid stale closures:
   ```typescript
   const optionsRef = useRef(options);
   useEffect(() => {
     optionsRef.current = options;
   }, [options]);
   
   // In startRecording, use optionsRef.current instead of options
   ```

**Verification:**
- ✅ Options object is memoized before passing
- ✅ Hook uses ref for options to avoid stale closures
- ✅ All callbacks are memoized
- ✅ No inline object creation in hook

**After extraction, component will:**
```typescript
import { useMediaRecorder } from '@/hooks/audio/useMediaRecorder';

// In component:
const { isRecording, startRecording, stopRecording, error: recorderError } = 
  useMediaRecorder(recorderOptions);

// Merge recorder error
useEffect(() => {
  if (recorderError) {
    setError(recorderError);
  }
}, [recorderError]);
```

---

## Phase 4: Final Component Cleanup
**Goal:** Remove all extracted logic, keep only UI and coordination

**Steps:**
1. Remove all extracted functions from component
2. Remove extracted hooks' logic
3. Import and use extracted utilities/hooks
4. Ensure all refs are properly managed
5. Verify auto-start effect still works
6. Verify cleanup on unmount still works

---

## Testing Strategy

### After Each Phase:
1. ✅ Run `npm run lint` - should pass
2. ✅ Run `npm run build` - should succeed
3. ✅ Run `npm test` - should pass
4. ✅ Manual test: Record audio, verify it works
5. ✅ Manual test: Auto-start recording, verify it works
6. ✅ Manual test: Silence detection, verify auto-stop works

### Phase-Specific Tests:

**Phase 1:**
- Unit test each utility function independently
- Mock browser APIs (getUserMedia, AudioContext)
- Test error cases

**Phase 2:**
- Test hooks with mock analyser
- Test cleanup on unmount
- Test state transitions

**Phase 3:**
- Test hook with memoized callbacks
- Test hook with changing callbacks (should not recreate startRecording)
- Test error handling

---

## Risk Mitigation

### For Phase 1 (Pure Functions):
- ✅ **Zero risk** - No React dependencies, can't cause render loops
- ✅ Easy to rollback - Just delete new files, restore original code

### For Phase 2 (Hooks without callbacks):
- ⚠️ **Low risk** - Must ensure dependencies are stable
- ✅ Easy to test - Can test hooks in isolation
- ✅ Easy to rollback - Remove hook usage, restore inline logic

### For Phase 3 (MediaRecorder hook):
- ⚠️⚠️ **High risk** - This is where the infinite loop happened before
- ✅ **Mitigation:** Memoize ALL callbacks BEFORE creating hook
- ✅ **Mitigation:** Use ref for options to avoid stale closures
- ✅ **Mitigation:** Test thoroughly before moving to next step
- ✅ Easy to rollback - Remove hook, restore original function

---

## Order of Implementation

**Recommended order:**
1. Phase 1, Step 1.1 (getUserMedia) - Test
2. Phase 1, Step 1.2 (Audio visualization) - Test
3. Phase 1, Step 1.3 (Audio level calc) - Test
4. Phase 1, Step 1.4 (API call) - Test
5. Phase 2, Step 2.1 (Audio level hook) - Test
6. Phase 2, Step 2.2 (Silence detection hook) - Test
7. Phase 3, Step 3.1 (Memoize callbacks) - Test
8. Phase 3, Step 3.2 (Memoize options) - Test
9. Phase 3, Step 3.3 (Create hook) - Test extensively
10. Phase 4 (Cleanup) - Final test

**DO NOT proceed to next step until current step is fully tested and working.**

---

## Success Criteria

After all phases:
- ✅ Component behavior is identical to original
- ✅ No infinite render loops
- ✅ All tests pass
- ✅ Code is more maintainable
- ✅ Utilities can be reused elsewhere
- ✅ Hooks follow React best practices

