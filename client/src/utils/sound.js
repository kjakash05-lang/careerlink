// CareerLink Professional 4-Second Bell Notification Sound Engine

let audioCtx = null;
let isAudioUnlocked = false;
let isCurrentlyPlaying = false;
let lastPlayedTime = 0;

// Initialize or resume AudioContext on first user interaction
const unlockAudioContext = () => {
  if (isAudioUnlocked && audioCtx && audioCtx.state === 'running') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      isAudioUnlocked = true;
    }
  } catch (e) {
    // Autoplay policy or unsupported audio context
  }
};

// Listen for first interaction to unlock audio
if (typeof window !== 'undefined') {
  window.addEventListener('click', unlockAudioContext, { once: true });
  window.addEventListener('keydown', unlockAudioContext, { once: true });
  window.addEventListener('touchstart', unlockAudioContext, { once: true });
}

/**
 * Synthesizes and plays a clean, warm, 4-second professional chime
 */
export const playNotificationSound = () => {
  // Check user preference
  const isSoundEnabled = localStorage.getItem('careerlink_notification_sound') !== 'false';
  if (!isSoundEnabled) return;

  // Prevent rapid overlapping sounds within 2.5 seconds
  const now = Date.now();
  if (now - lastPlayedTime < 2500 || isCurrentlyPlaying) {
    return;
  }

  unlockAudioContext();

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    isCurrentlyPlaying = true;
    lastPlayedTime = now;

    const ctx = audioCtx;
    const startTime = ctx.currentTime;
    const duration = 4.0; // 4 seconds natural decay

    // Master gain with smooth attack & exponential decay
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.35, startTime + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Warm low-pass filter to make it soft and professional
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.frequency.exponentialRampToValueAtTime(1400, startTime + duration);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Harmonious chord notes (E5, B5, E6, G#6)
    const frequencies = [659.25, 987.77, 1318.51, 1661.22];
    const delays = [0, 0.08, 0.16, 0.24];
    const gains = [0.4, 0.35, 0.25, 0.18];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + delays[idx]);

      const noteStart = startTime + delays[idx];
      oscGain.gain.setValueAtTime(0, noteStart);
      oscGain.gain.linearRampToValueAtTime(gains[idx], noteStart + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(noteStart);
      osc.stop(startTime + duration);
    });

    // Reset lock after 4 seconds
    setTimeout(() => {
      isCurrentlyPlaying = false;
    }, 4000);
  } catch (err) {
    isCurrentlyPlaying = false;
    console.warn('Notification sound playback skipped:', err.message);
  }
};
