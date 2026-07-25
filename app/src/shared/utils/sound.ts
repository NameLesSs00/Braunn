export function playNotificationSound(): void {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.6;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.warn('[Sound] MP3 play blocked or file unavailable, falling back to Web Audio synth chime:', err);
        playSyntheticChime();
      });
    }
  } catch (e) {
    console.warn('[Sound] Audio error, using synth fallback:', e);
    playSyntheticChime();
  }
}

function playSyntheticChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Create dual-tone chime (E5 and G5 notes)
    const playNote = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);

      gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startDelay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    playNote(659.25, 0, 0.4);   // E5
    playNote(880.00, 0.1, 0.5);  // A5
  } catch (err) {
    console.error('[Sound] Synthetic chime failed:', err);
  }
}
