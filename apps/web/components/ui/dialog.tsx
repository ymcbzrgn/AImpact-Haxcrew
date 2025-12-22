'use client'

import { useEffect, useCallback } from 'react'
import { Button } from './button'

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

// Base Dialog
interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className = '' }: DialogProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// Dialog Header
interface DialogHeaderProps {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function DialogHeader({ children, onClose, className = '' }: DialogHeaderProps) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b border-neutral-200 ${className}`}>
      <div className="font-semibold text-neutral-800">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

// Dialog Content
interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

// Dialog Footer
interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 ${className}`}>
      {children}
    </div>
  )
}

// Confirmation Dialog (pre-built)
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: 'text-red-500 bg-red-100',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: 'text-amber-500 bg-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    default: {
      icon: 'text-accent-custom bg-accent-custom/10',
      button: 'bg-accent-custom hover:bg-accent-custom-baseline text-white',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
            <AlertIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-800 mb-1">{title}</h3>
            {description && <p className="text-sm text-neutral-600">{description}</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button className={styles.button} onClick={onConfirm} disabled={loading}>
          {loading ? 'Loading...' : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default Dialog
