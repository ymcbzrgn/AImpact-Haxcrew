'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSessionStore } from '@/stores/session'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

export type WebSocketEvent =
  | 'connected'
  | 'disconnected'
  | 'audio_chunk'
  | 'transcript'
  | 'realtime_note'
  | 'ai_response'
  | 'council_message'
  | 'council_vote'
  | 'council_complete'
  | 'error'

export interface WebSocketMessage {
  type: WebSocketEvent
  data?: any
  error?: string
}

interface UseWebSocketOptions {
  sessionId: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  isReconnecting: boolean
  reconnectCount: number
  connect: () => void
  disconnect: () => void
  sendMessage: (type: string, data?: any) => void
  sendAudioChunk: (audioData: ArrayBuffer) => void
  startPitch: () => void
  endPitch: () => void
  startQA: () => void
  answerComplete: (answer: string) => void
  startCouncil: () => void
}

export function useWebSocket({
  sessionId,
  autoConnect = true,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [reconnectCount, setReconnectCount] = useState(0)

  const { setStatus } = useSessionStore()

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(`${WS_URL}/ws/${sessionId}`)

      ws.onopen = () => {
        console.log('[WS] Connected to session:', sessionId)
        setIsConnected(true)
        setIsReconnecting(false)
        setReconnectCount(0)
        clearReconnectTimeout()
        onConnect?.()
      }

      ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.code, event.reason)
        setIsConnected(false)
        onDisconnect?.()

        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectCount < reconnectAttempts) {
          setIsReconnecting(true)
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[WS] Reconnection attempt ${reconnectCount + 1}/${reconnectAttempts}`)
            setReconnectCount((prev) => prev + 1)
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        console.error('[WS] Error:', error)
        onError?.(error)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('[WS] Message received:', message.type)

          // Handle specific message types
          switch (message.type) {
            case 'realtime_note':
              // Real-time feedback/notes during pitch
              break
            case 'transcript':
              // Speech-to-text transcript
              break
            case 'ai_response':
              // AI investor response
              break
            case 'council_message':
              // VC council member speaking
              break
            case 'council_vote':
              // Council voting
              break
            case 'council_complete':
              // Council session complete
              setStatus('completed')
              break
            case 'error':
              console.error('[WS] Server error:', message.error)
              break
          }

          onMessage?.(message)
        } catch (e) {
          console.error('[WS] Failed to parse message:', e)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WS] Connection error:', error)
    }
  }, [sessionId, reconnectCount, reconnectAttempts, reconnectInterval, onConnect, onDisconnect, onError, onMessage, setStatus, clearReconnectTimeout])

  const disconnect = useCallback(() => {
    clearReconnectTimeout()
    setReconnectCount(reconnectAttempts) // Prevent reconnection
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect')
      wsRef.current = null
    }
    setIsConnected(false)
    setIsReconnecting(false)
  }, [clearReconnectTimeout, reconnectAttempts])

  const sendMessage = useCallback((type: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }))
    } else {
      console.warn('[WS] Cannot send message, not connected')
    }
  }, [])

  const sendAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send as binary data
      wsRef.current.send(audioData)
    }
  }, [])

  const startPitch = useCallback(() => {
    sendMessage('start_pitch')
    setStatus('pitching')
  }, [sendMessage, setStatus])

  const endPitch = useCallback(() => {
    sendMessage('end_pitch')
    setStatus('qa')
  }, [sendMessage, setStatus])

  const startQA = useCallback(() => {
    sendMessage('start_qa')
    setStatus('qa')
  }, [sendMessage, setStatus])

  const answerComplete = useCallback((answer: string) => {
    sendMessage('answer_complete', { answer })
  }, [sendMessage])

  const startCouncil = useCallback(() => {
    sendMessage('start_council')
    setStatus('council')
  }, [sendMessage, setStatus])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && sessionId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    isReconnecting,
    reconnectCount,
    connect,
    disconnect,
    sendMessage,
    sendAudioChunk,
    startPitch,
    endPitch,
    startQA,
    answerComplete,
    startCouncil,
  }
}
