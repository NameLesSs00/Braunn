import { ReactNode } from 'react'

import { Modal } from './Modal'

type Props = {
  open: boolean
  onClose: () => void
  icon: ReactNode
  message: string
}

export function SuccessAlertModal({ open, onClose, icon, message }: Props) {
  return (
    <Modal open={open} onClose={onClose} lockScroll>
      {/* Added 'relative' here so the absolute button positions correctly inside this box */}
      <div className="relative mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-4">
          {icon}
          <p className="text-center text-sm font-medium text-slate-800">{message}</p>
        </div>
      </div>
    </Modal>
  )
}