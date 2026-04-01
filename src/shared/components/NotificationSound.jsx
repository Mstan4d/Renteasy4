// src/shared/components/NotificationSound.jsx
import React, { useRef, useEffect, useState } from 'react';

const NotificationSound = ({ play, soundType = 'notification' }) => {
  const notificationAudioRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Do NOT create AudioContext on mount - wait for user interaction

  // Load notification sound file (this is fine - doesn't play yet)
  useEffect(() => {
    if (soundType === 'notification') {
      const audioUrl = `/sounds/notification-ping.mp3?t=${Date.now()}`;
      notificationAudioRef.current = new Audio(audioUrl);
      notificationAudioRef.current.load();
      
      notificationAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Notification sound loaded');
        setIsLoaded(true);
      });
      
      notificationAudioRef.current.addEventListener('error', (e) => {
        console.error('Error loading notification sound:', e);
      });
    }
    
    return () => {
      if (notificationAudioRef.current) {
        notificationAudioRef.current.pause();
        notificationAudioRef.current = null;
      }
    };
  }, [soundType]);

  // Create AudioContext ONLY on user interaction
  const initAudio = () => {
    if (audioInitialized) return;
    
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      setAudioInitialized(true);
      console.log('🎵 Audio context initialized on user interaction');
      
      // Resume immediately (now allowed because of user interaction)
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          console.log('🎵 Audio context resumed');
        });
      }
    } catch (e) {
      console.log('Audio context init failed:', e);
    }
  };

  // Detect user interaction (click anywhere on page)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        initAudio(); // Create AudioContext now - allowed after click!
        console.log('👆 User interacted, audio enabled');
      }
    };
    
    // Add event listeners
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [hasUserInteracted]);

  // Play accept sound using Web Audio
  const playAcceptSound = () => {
    if (!hasUserInteracted || !audioEnabled) {
      console.log('⚠️ Cannot play accept sound - no user interaction');
      return;
    }
    
    try {
      // Use existing audioContext or create new one (will work because user interacted)
      const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 523.25; // C5
      gainNode.gain.value = 0.3;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.frequency.value = 659.25; // E5
      }, 150);
      
      setTimeout(() => {
        oscillator.stop();
        if (!audioContext) ctx.close();
      }, 400);
      
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      console.log('Accept sound failed:', e);
    }
  };

  // Play notification sound using audio file
  const playNotificationSound = () => {
    if (!hasUserInteracted || !audioEnabled) {
      console.log('⚠️ Cannot play notification sound - no user interaction');
      return;
    }
    
    if (notificationAudioRef.current && isLoaded) {
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch(error => {
        console.log('Audio file play failed:', error);
        playFallbackBeep();
      });
    } else {
      playFallbackBeep();
    }
  };

  // Fallback beep
  const playFallbackBeep = () => {
    if (!hasUserInteracted || !audioEnabled) return;
    
    try {
      const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        if (!audioContext) ctx.close();
      }, 200);
      
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) {
      console.log('Fallback beep failed:', e);
    }
  };

  // Play sound when triggered
  useEffect(() => {
    if (!play || !audioEnabled) return;
    
    if (!hasUserInteracted) {
      console.log('🔊 Sound requested but waiting for user interaction...');
      return;
    }
    
    if (soundType === 'notification') {
      console.log('🔊 Playing notification sound');
      playNotificationSound();
    } else if (soundType === 'accept') {
      console.log('🔊 Playing accept sound');
      playAcceptSound();
    }
  }, [play, hasUserInteracted, audioEnabled, soundType]);

  return null;
};

export default NotificationSound;