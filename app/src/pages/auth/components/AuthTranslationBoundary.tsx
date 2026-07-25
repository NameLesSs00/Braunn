import { useEffect, useRef, type ReactNode } from 'react'
import { translateAppDomTree } from '../../../shared/lib/appTranslation'

export function AuthTranslationBoundary({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!rootRef.current) return

    const root = rootRef.current
    let frameId = 0
    const observerOptions: MutationObserverInit = {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    }

    const observer = new MutationObserver(() => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        observer.disconnect()
        translateAppDomTree(root)
        observer.observe(root, observerOptions)
      })
    })

    translateAppDomTree(root)
    observer.observe(root, observerOptions)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [])

  return <div ref={rootRef} className="contents">{children}</div>
}
