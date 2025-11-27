const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export function playMoneyLossSound() {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
}

export function playSuccessSound() {
  if (!audioContext) return;
  
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('Audio not supported');
  }
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const duration = type === 'light' ? 50 : type === 'medium' ? 100 : 200;
    navigator.vibrate(duration);
  }
}

export function playWrongAnswerFeedback() {
  playMoneyLossSound();
  triggerHapticFeedback('heavy');
}

export function playCorrectAnswerFeedback() {
  playSuccessSound();
  triggerHapticFeedback('light');
}
