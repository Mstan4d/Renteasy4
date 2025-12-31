// src/shared/hooks/useAudioRecorder.jsx
import { useState, useRef, useEffect, useCallback } from 'react';

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingPermission, setRecordingPermission] = useState(null); // null, true, or false
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Check for microphone permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Modern permission API
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          setRecordingPermission(permissionStatus.state === 'granted');
          
          permissionStatus.onchange = () => {
            setRecordingPermission(permissionStatus.state === 'granted');
          };
        } else {
          // Fallback for browsers without permissions API
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setRecordingPermission(true);
        }
      } catch (error) {
        console.log('Microphone permission not granted:', error);
        setRecordingPermission(false);
      }
    };

    checkPermission();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    if (recordingPermission === false) {
      alert('Microphone access is required. Please allow microphone access in your browser settings.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          
          setAudioBlob(blob);
          setAudioUrl(url);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        stopRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      return true;

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setRecordingPermission(false);
      alert(`Cannot access microphone: ${error.message}`);
      return false;
    }
  }, [recordingPermission]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    stopRecording();
    resetRecording();
  }, [stopRecording]);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, [audioUrl]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    recordingTime: formatTime(recordingTime),
    rawTime: recordingTime,
    recordingPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    hasAudio: !!audioBlob,
  };
};

export default useAudioRecorder;