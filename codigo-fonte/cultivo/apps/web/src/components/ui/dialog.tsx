import React from 'react'

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[90%] max-w-lg rounded-2xl bg-white p-4 shadow-lg" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="px-2">✕</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Dialog
