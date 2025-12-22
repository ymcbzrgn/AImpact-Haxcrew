'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAudioOptions {
  onAudioData?: (data: Float32Array) => void
  onAudioChunk?: (chunk: Blob) => void
  onPermissionDenied?: () => void
  onError?: (error: Error) => void
  fftSize?: number
  chunkInterval?: number // ms
}

interface UseAudioReturn {
  isRecording: boolean
  hasPermission: boolean | null
  audioLevel: number
  frequencyData: Uint8Array | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  requestPermission: () => Promise<boolean>
}

export function useAudio({
  onAudioData,
  onAudioChunk,
  onPermissionDenied,
  onError,
  fftSize = 256,
  chunkInterval = 1000,
}: UseAudioOptions = {}): UseAudioReturn {
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null)

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately - we just wanted to check permission
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      setHasPermission(false)
      onPermissionDenied?.()
      return false
    }
  }, [onPermissionDenied])

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      setHasPermission(true)

      // Create audio context
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      // Create analyser node
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = fftSize
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      // Connect stream to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Create frequency data array
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const floatDataArray = new Float32Array(bufferLength)

      // Animation loop for real-time analysis
      const analyze = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        setFrequencyData(new Uint8Array(dataArray))

        // Calculate audio level (RMS)
        analyserRef.current.getFloatTimeDomainData(floatDataArray)
        let sum = 0
        for (let i = 0; i < floatDataArray.length; i++) {
          sum += floatDataArray[i] * floatDataArray[i]
        }
        const rms = Math.sqrt(sum / floatDataArray.length)
        setAudioLevel(Math.min(1, rms * 3)) // Normalize and cap at 1

        onAudioData?.(floatDataArray)

        animationFrameRef.current = requestAnimationFrame(analyze)
      }

      analyze()

      // Set up MediaRecorder for audio chunks
      if (onAudioChunk && MediaRecorder.isTypeSupported('audio/webm')) {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            onAudioChunk(event.data)
          }
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()

        // Send chunks at regular intervals
        chunkIntervalRef.current = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
            mediaRecorder.start()
          }
        }, chunkInterval)
      }

      setIsRecording(true)
    } catch (error) {
      setHasPermission(false)
      onError?.(error as Error)
      onPermissionDenied?.()
    }
  }, [fftSize, chunkInterval, onAudioData, onAudioChunk, onError, onPermissionDenied])

  const stopRecording = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop chunk interval
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current)
      chunkIntervalRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setIsRecording(false)
    setAudioLevel(0)
    setFrequencyData(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  return {
    isRecording,
    hasPermission,
    audioLevel,
    frequencyData,
    startRecording,
    stopRecording,
    requestPermission,
  }
}

// Hook for voice activity detection
interface UseVoiceActivityOptions {
  threshold?: number
  silenceTimeout?: number
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
}

export function useVoiceActivity({
  threshold = 0.1,
  silenceTimeout = 1500,
  onSpeechStart,
  onSpeechEnd,
}: UseVoiceActivityOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wasSpeakingRef = useRef(false)

  const processAudioLevel = useCallback(
    (level: number) => {
      const isAboveThreshold = level > threshold

      if (isAboveThreshold) {
        // Clear silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current)
          silenceTimeoutRef.current = null
        }

        // Start speaking
        if (!wasSpeakingRef.current) {
          wasSpeakingRef.current = true
          setIsSpeaking(true)
          onSpeechStart?.()
        }
      } else if (wasSpeakingRef.current && !silenceTimeoutRef.current) {
        // Start silence timeout
        silenceTimeoutRef.current = setTimeout(() => {
          wasSpeakingRef.current = false
          setIsSpeaking(false)
          onSpeechEnd?.()
          silenceTimeoutRef.current = null
        }, silenceTimeout)
      }
    },
    [threshold, silenceTimeout, onSpeechStart, onSpeechEnd]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [])

  return {
    isSpeaking,
    processAudioLevel,
  }
}

export default useAudio
