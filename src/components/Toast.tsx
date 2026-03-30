'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 1700)
    const doneTimer = setTimeout(onDone, 2000)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(20, 20, 34, 0.95)',
        border: '1px solid rgba(14, 202, 150, 0.3)',
        backdropFilter: 'blur(16px)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
        animation: 'fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,202,150,0.1)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: '#0ECA96' }}
      />
      <span className="text-sm font-medium text-[#ECEDF3]">{message}</span>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = (msg: string) => setToast(msg)
  const hide = () => setToast(null)
  return { toast, show, hide }
}
