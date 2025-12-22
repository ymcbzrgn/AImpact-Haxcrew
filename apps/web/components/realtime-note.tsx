'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Note {
  id: string
  content: string
  timestamp: Date
  type: 'info' | 'warning' | 'tip' | 'feedback'
  source?: string
  isRead?: boolean
}

interface RealtimeNoteProps {
  notes: Note[]
  onNoteRead?: (noteId: string) => void
  onNoteDismiss?: (noteId: string) => void
  maxVisible?: number
  autoHideDuration?: number
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  className?: string
}

// Individual Note Toast
function NoteToast({
  note,
  onDismiss,
  autoHideDuration,
}: {
  note: Note
  onDismiss: () => void
  autoHideDuration?: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true))

    // Auto hide
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [autoHideDuration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const typeStyles = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-500',
      iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-500',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    tip: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-500',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
    feedback: {
      bg: 'bg-purple-50 border-purple-200',
      icon: 'text-purple-500',
      iconPath: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
  }

  const style = typeStyles[note.type]

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`${style.bg} border rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${style.icon}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={style.iconPath} />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {note.source && (
              <p className="text-xs font-medium text-neutral-500 mb-1">{note.source}</p>
            )}
            <p className="text-sm text-neutral-700">{note.content}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {note.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Notes Container (Toast Stack)
export function RealtimeNoteToasts({
  notes,
  onNoteDismiss,
  maxVisible = 3,
  autoHideDuration = 5000,
  position = 'top-right',
  className = '',
}: RealtimeNoteProps) {
  const visibleNotes = notes.slice(0, maxVisible)

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4',
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 ${className}`}>
      {visibleNotes.map((note) => (
        <NoteToast
          key={note.id}
          note={note}
          onDismiss={() => onNoteDismiss?.(note.id)}
          autoHideDuration={autoHideDuration}
        />
      ))}
    </div>
  )
}

// Notes History Panel
interface NotesHistoryProps {
  notes: Note[]
  onClear?: () => void
  maxHeight?: string
  className?: string
}

export function NotesHistory({ notes, onClear, maxHeight = '400px', className = '' }: NotesHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom on new notes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [notes])

  const typeColors = {
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    tip: 'border-l-green-500',
    feedback: 'border-l-purple-500',
  }

  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-700">
          Notlar
          {notes.length > 0 && (
            <span className="ml-2 text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          )}
        </h3>
        {notes.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Notes List */}
      <div ref={scrollRef} className="overflow-y-auto" style={{ maxHeight }}>
        {notes.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-400">
            Henuz not yok
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 border-l-4 ${typeColors[note.type]} hover:bg-neutral-50 transition-colors`}
              >
                {note.source && (
                  <p className="text-xs font-medium text-neutral-500 mb-1">{note.source}</p>
                )}
                <p className="text-sm text-neutral-700">{note.content}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {note.timestamp.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Notes Popup (Collapsible Panel)
interface NotesPopupProps {
  notes: Note[]
  isOpen: boolean
  onToggle: () => void
  onClear?: () => void
  position?: 'left' | 'right'
  className?: string
}

export function NotesPopup({
  notes,
  isOpen,
  onToggle,
  onClear,
  position = 'right',
  className = '',
}: NotesPopupProps) {
  const unreadCount = notes.filter((n) => !n.isRead).length

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
          ${isOpen ? 'bg-accent-custom text-white border-accent-custom' : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'}
        `}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="text-sm font-medium">Notlar</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popup Panel */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-2 w-80 z-50
            ${position === 'right' ? 'right-0' : 'left-0'}
            animate-fadeIn
          `}
        >
          <NotesHistory notes={notes} onClear={onClear} maxHeight="300px" />
        </div>
      )}
    </div>
  )
}

// Hook for managing notes
export function useRealtimeNotes() {
  const [notes, setNotes] = useState<Note[]>([])

  const addNote = useCallback((content: string, type: Note['type'] = 'info', source?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type,
      source,
      isRead: false,
    }
    setNotes((prev) => [...prev, newNote])
    return newNote.id
  }, [])

  const removeNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }, [])

  const markAsRead = useCallback((noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isRead: true } : n))
    )
  }, [])

  const clearNotes = useCallback(() => {
    setNotes([])
  }, [])

  return {
    notes,
    addNote,
    removeNote,
    markAsRead,
    clearNotes,
  }
}

// CSS for fade-in animation (add to global styles or use Tailwind plugin)
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`

export default RealtimeNoteToasts
