/**
 * Instant Audio & Haptic Feedback for QR Scans
 * Uses Web Audio API oscillator synthesis (Zero latency, no sound files to load).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a pleasant, ultra-fast success chime (< 100ms duration)
 */
export function playScanSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Crisp ascending chime: 880Hz (A5) -> 1760Hz (A6)
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch {
    // Audio output not permitted or available
  }
}

/**
 * Plays a distinct warning / permission required tone
 */
export function playScanNoticeSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(783.99, now + 0.08); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  } catch {
    // Audio output not permitted
  }
}

/**
 * Triggers hardware vibration on supported mobile devices
 */
export function triggerHaptic(type: 'success' | 'warning' | 'error' = 'success'): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate([40, 30, 40]);
      } else if (type === 'warning') {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }
  } catch {
    // Ignore vibration failure
  }
}
