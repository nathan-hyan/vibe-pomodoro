// Play a simple chime when checking off a task
export function playTaskCompleteChime() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();

  const now = audioContext.currentTime;
  const frequency = 659.25; // E5 - single pleasant note

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  const startTime = now;
  const endTime = startTime + 0.15; // Very short, 150ms

  // Quick fade in and out
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

  oscillator.start(startTime);
  oscillator.stop(endTime);
}

// Play alarm sound once (no looping)
export function playAlarmSoundOnce() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();

  const now = audioContext.currentTime;
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)

  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

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
  });
}

