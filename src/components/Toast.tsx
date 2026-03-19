'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#51cf66] text-black font-semibold px-5 py-3 rounded-xl shadow-lg animate-fade-in">
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = (msg: string) => setToast(msg)
  const hide = () => setToast(null)
  return { toast, show, hide }
}
