'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WebSocketMessage {
  type: string
  payload: unknown
  timestamp: number
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
  heartbeatInterval?: number
}

interface UseWebSocketReturn {
  status: WebSocketStatus
  send: (type: string, payload: unknown) => void
  connect: () => void
  disconnect: () => void
  lastMessage: WebSocketMessage | null
  isConnected: boolean
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
  reconnectAttempts = 5,
  heartbeatInterval = 30000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [status, setStatus] = useState<WebSocketStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    clearHeartbeat()
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Send in backend-expected format
        wsRef.current.send(JSON.stringify({ event: 'ping', data: { timestamp: Date.now() } }))
      }
    }, heartbeatInterval)
  }, [clearHeartbeat, heartbeatInterval])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setStatus('connecting')

    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setStatus('connected')
        reconnectCountRef.current = 0
        startHeartbeat()
        onConnect?.()
      }

      wsRef.current.onclose = () => {
        setStatus('disconnected')
        clearHeartbeat()
        onDisconnect?.()

        // Attempt reconnection
        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current.onerror = (error) => {
        setStatus('error')
        onError?.(error)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data)
          // Backend sends { event, data } format, convert to { type, payload }
          const message: WebSocketMessage = {
            type: raw.event || raw.type,
            payload: raw.data || raw.payload,
            timestamp: raw.timestamp || Date.now(),
          }
          setLastMessage(message)
          onMessage?.(message)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }
    } catch (error) {
      setStatus('error')
      console.error('WebSocket connection error:', error)
    }
  }, [
    url,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
    reconnect,
    reconnectAttempts,
    reconnectInterval,
    startHeartbeat,
    clearHeartbeat,
  ])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    clearHeartbeat()
    reconnectCountRef.current = reconnectAttempts // Prevent reconnection

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus('disconnected')
  }, [clearHeartbeat, reconnectAttempts])

  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send in backend-expected format: { event, data }
      const message = {
        event: type,
        data: payload,
      }
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    status,
    send,
    connect,
    disconnect,
    lastMessage,
    isConnected: status === 'connected',
  }
}

// Session-specific WebSocket hook
interface SessionMessage {
  type: 'phase_change' | 'slide_update' | 'timer_sync' | 'investor_message' | 'vote' | 'note' | 'audio_transcript'
  payload: unknown
}

interface UseSessionWebSocketOptions {
  sessionId: string
  onPhaseChange?: (phase: string) => void
  onSlideUpdate?: (slideIndex: number) => void
  onTimerSync?: (timeLeft: number) => void
  onInvestorMessage?: (message: { speaker: string; content: string }) => void
  onVote?: (vote: { investorId: string; decision: string }) => void
  onNote?: (note: { content: string; timestamp: number }) => void
  onAudioTranscript?: (transcript: { text: string; isFinal: boolean }) => void
}

export function useSessionWebSocket({
  sessionId,
  onPhaseChange,
  onSlideUpdate,
  onTimerSync,
  onInvestorMessage,
  onVote,
  onNote,
  onAudioTranscript,
}: UseSessionWebSocketOptions) {
  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
  const wsUrl = `${baseUrl}/ws/session/${sessionId}`

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      const { type, payload } = message as unknown as SessionMessage

      switch (type) {
        case 'phase_change':
          onPhaseChange?.(payload as string)
          break
        case 'slide_update':
          onSlideUpdate?.(payload as number)
          break
        case 'timer_sync':
          onTimerSync?.(payload as number)
          break
        case 'investor_message':
          onInvestorMessage?.(payload as { speaker: string; content: string })
          break
        case 'vote':
          onVote?.(payload as { investorId: string; decision: string })
          break
        case 'note':
          onNote?.(payload as { content: string; timestamp: number })
          break
        case 'audio_transcript':
          onAudioTranscript?.(payload as { text: string; isFinal: boolean })
          break
        default:
          console.log('Unknown message type:', type)
      }
    },
    [onPhaseChange, onSlideUpdate, onTimerSync, onInvestorMessage, onVote, onNote, onAudioTranscript]
  )

  const ws = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
  })

  // Session-specific send methods
  const sendSlideChange = useCallback(
    (slideIndex: number) => {
      ws.send('slide_change', { slideIndex })
    },
    [ws]
  )

  const sendAudioChunk = useCallback(
    (audioData: ArrayBuffer) => {
      ws.send('audio_chunk', { data: Array.from(new Uint8Array(audioData)) })
    },
    [ws]
  )

  const sendUserResponse = useCallback(
    (response: string) => {
      ws.send('user_response', { content: response })
    },
    [ws]
  )

  return {
    ...ws,
    sendSlideChange,
    sendAudioChunk,
    sendUserResponse,
  }
}

export default useWebSocket
