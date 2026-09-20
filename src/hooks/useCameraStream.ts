import { useState, useRef, useEffect, useCallback } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'ready'
  | 'permission_denied'
  | 'no_camera'
  | 'error';

export interface UseCameraStreamResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: string | null;
  start: () => Promise<MediaStream | null>;
  stop: () => void;
  retry: () => Promise<MediaStream | null>;
}

export function useCameraStream(): UseCameraStreamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Keep track of whether the camera was running before tab was hidden
  const wasActiveRef = useRef<boolean>(false);
  const isStartedRef = useRef<boolean>(false);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stop = useCallback(() => {
    isStartedRef.current = false;
    wasActiveRef.current = false;
    stopTracks();
    setStatus('idle');
    setError(null);
  }, [stopTracks]);

  const start = useCallback(async (): Promise<MediaStream | null> => {
    // Check for browser support
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const errMessage = 'Camera access is not supported by this browser.';
      setError(errMessage);
      setStatus('no_camera');
      return null;
    }

    // Stop any existing tracks before starting fresh
    stopTracks();

    setStatus('requesting');
    setError(null);
    isStartedRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        await video.play();
      }

      setStatus('ready');
      setError(null);
      wasActiveRef.current = true;
      return stream;
    } catch (err: unknown) {
      stopTracks();
      isStartedRef.current = false;
      wasActiveRef.current = false;

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          setStatus('permission_denied');
          setError('Camera access was denied. Please allow camera access in your browser settings and tap Retry.');
          return null;
        }
        if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
          setStatus('no_camera');
          setError('No front-facing camera found on this device.');
          return null;
        }
        if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setStatus('error');
          setError('Camera is in use by another app or browser tab. Please close it and tap Retry.');
          return null;
        }
      }

      const genericMsg = err instanceof Error ? err.message : 'Unable to connect to camera sensor.';
      setStatus('error');
      setError(genericMsg);
      return null;
    }
  }, [stopTracks]);

  const retry = useCallback(async (): Promise<MediaStream | null> => {
    return start();
  }, [start]);

  // Handle visibilitychange: stop tracks when hidden, resume when visible if it was active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isStartedRef.current && streamRef.current) {
          wasActiveRef.current = true;
          stopTracks();
          setStatus('idle');
        }
      } else if (document.visibilityState === 'visible') {
        if (wasActiveRef.current && isStartedRef.current) {
          start().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopTracks, start]);

  // Cleanup all tracks on unmount
  useEffect(() => {
    return () => {
      stopTracks();
    };
  }, [stopTracks]);

  return {
    videoRef,
    status,
    error,
    start,
    stop,
    retry,
  };
}
