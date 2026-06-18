import type { ImgHTMLAttributes } from 'react'
import { IconType, IconContext } from 'react-icons' // 1. Import IconContext

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string | IconType 
  alt: string
}

export function IconImage({ src, alt, className, onError, ...rest }: Props) {
  
  if (typeof src === 'function') {
    const IconComponent = src
    
    // 2. Wrap it in a Provider. This safely applies the className to the SVG under the hood!
    return (
      <IconContext.Provider value={{ className: className }}>
        <IconComponent />
      </IconContext.Provider>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        // eslint-disable-next-line no-console
        console.warn('[IconImage] Failed to load image', { src, href: window.location.href })
        onError?.(e)
      }}
      {...rest}
    />
  )
}