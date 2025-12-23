'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseAudioCaptureOptions {
  onAudioChunk?: (chunk: ArrayBuffer) => void
  sampleRate?: number
  chunkSize?: number
}

interface UseAudioCaptureReturn {
  isRecording: boolean
  isPaused: boolean
  hasPermission: boolean | null
  audioLevel: number
  startRecording: () => Promise<void>
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  requestPermission: () => Promise<boolean>
}

export function useAudioCapture({
  onAudioChunk,
  sampleRate = 16000,
  chunkSize = 4096,
}: UseAudioCaptureOptions = {}): UseAudioCaptureReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Immediately stop the stream, we just needed permission
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      console.error('[Audio] Permission denied:', error)
      setHasPermission(false)
      return false
    }
  }, [])

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || isPaused) {
      setAudioLevel(0)
      return
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate RMS (root mean square) for audio level
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    const level = Math.min(100, (rms / 128) * 100)
    setAudioLevel(level)

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }, [isPaused])

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      mediaStreamRef.current = stream
      setHasPermission(true)

      // Create audio context
      const audioContext = new AudioContext({ sampleRate })
      audioContextRef.current = audioContext

      // Create analyser for visualization
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Create source from microphone
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Create processor for audio chunks
      const processor = audioContext.createScriptProcessor(chunkSize, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (isPaused) return

        const inputData = e.inputBuffer.getChannelData(0)
        // Convert Float32Array to Int16Array for transmission
        const int16Data = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        onAudioChunk?.(int16Data.buffer)
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      setIsRecording(true)
      setIsPaused(false)

      // Start audio level visualization
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    } catch (error) {
      console.error('[Audio] Failed to start recording:', error)
      setHasPermission(false)
    }
  }, [sampleRate, chunkSize, onAudioChunk, isPaused, updateAudioLevel])

  const stopRecording = useCallback(() => {
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Disconnect and close audio context
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    setIsRecording(false)
    setIsPaused(false)
    setAudioLevel(0)
  }, [])

  const pauseRecording = useCallback(() => {
    setIsPaused(true)
    setAudioLevel(0)
  }, [])

  const resumeRecording = useCallback(() => {
    setIsPaused(false)
    if (isRecording && analyserRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [isRecording, updateAudioLevel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  return {
    isRecording,
    isPaused,
    hasPermission,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
  }
}
