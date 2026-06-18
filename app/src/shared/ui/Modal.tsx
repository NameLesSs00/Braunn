import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  lockScroll?: boolean
  closeOnBackdrop?: boolean
}

export function Modal({ open, onClose, children, lockScroll = true, closeOnBackdrop = false }: Props) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !lockScroll) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [lockScroll, open])

  if (!open) return null

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-50',
        closeOnBackdrop ? '' : 'pointer-events-none',
      ].join(' ')}
      onMouseDown={closeOnBackdrop ? onClose : undefined}
      onWheel={
        lockScroll
          ? undefined
          : (e) => {
              window.scrollBy({ top: e.deltaY })
            }
      }
    >
      <div className={['absolute inset-0 bg-black/30', closeOnBackdrop ? '' : 'pointer-events-none'].join(' ')} />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-4">
        <div
          className={closeOnBackdrop ? '' : 'pointer-events-auto'}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
