import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'

export function AnimatedCounter({
  valueStr,
  active = true,
  durationMs = 2500,
}: {
  valueStr: string
  active?: boolean
  durationMs?: number
}) {
  const match = valueStr.match(/^([^0-9.-]*)([0-9.,]+)(.*)$/)
  if (!match) return <>{valueStr}</>

  const prefix = match[1]
  const numStr = match[2]
  const suffix = match[3]

  const parsedNum = parseFloat(numStr.replace(/,/g, ''))
  const hasDecimals = numStr.includes('.')

  const spring = useSpring(0, { bounce: 0, duration: durationMs })

  const displayValue = useTransform(spring, (current) => {
    let numString = hasDecimals ? current.toFixed(1) : Math.round(current).toString()

    const parts = numString.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    numString = parts.join('.')

    return `${prefix}${numString}${suffix}`
  })

  useEffect(() => {
    if (!active) return
    spring.set(parsedNum)
  }, [active, parsedNum, spring])

  return <motion.span>{displayValue}</motion.span>
}

