// Create a pleasant bell/chime sound using Web Audio API
export function playAlarmSound() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();

  let isPlaying = true;
  const activeOscillators: OscillatorNode[] = [];
  const activeGains: GainNode[] = [];

  const playChime = () => {
    if (!isPlaying) return;

    const now = audioContext.currentTime;
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Track active nodes
      activeOscillators.push(oscillator);
      activeGains.push(gainNode);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      // Stagger the notes slightly for a pleasant effect
      const startTime = now + index * 0.1;
      const endTime = startTime + 1.5;

      // Fade in and out
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

      oscillator.start(startTime);
      oscillator.stop(endTime);

      // Remove from tracking when done
      oscillator.onended = () => {
        const oscIdx = activeOscillators.indexOf(oscillator);
        const gainIdx = activeGains.indexOf(gainNode);
        if (oscIdx > -1) activeOscillators.splice(oscIdx, 1);
        if (gainIdx > -1) activeGains.splice(gainIdx, 1);
      };
    });
  };

  // Play immediately
  playChime();

  // Loop every 3 seconds
  const intervalId = window.setInterval(() => {
    playChime();
  }, 3000);

  // Return stop function
  return () => {
    isPlaying = false;
    clearInterval(intervalId);

    // Immediately stop all active oscillators and fade out gains
    const now = audioContext.currentTime;
    activeGains.forEach((gain) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    });
    activeOscillators.forEach((osc) => {
      try {
        osc.stop(now + 0.1);
      } catch {
        // Oscillator might already be stopped
      }
    });

    // Clear the arrays
    activeOscillators.length = 0;
    activeGains.length = 0;
  };
}
