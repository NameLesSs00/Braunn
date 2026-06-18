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
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          {icon}
          <p className="text-center text-sm font-medium text-slate-800">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
