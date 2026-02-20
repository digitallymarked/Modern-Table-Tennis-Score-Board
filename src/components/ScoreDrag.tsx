'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'

const MAX_SCORE = 50
const GAP = 4

interface ScoreDragProps {
  score: number
  onChange: (score: number) => void
  variant?: 'main' | 'match'
  color: 'left' | 'right'
}

export default function ScoreDrag({ score, onChange, variant = 'main', color }: ScoreDragProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [slideHeight, setSlideHeight] = useState(0)
  const y = useMotionValue(0)
  const isDragging = useRef(false)
  const initialized = useRef(false)
  const committedScore = useRef(score)

  // Measure container height
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const measure = () => {
      const h = el.clientHeight
      if (h > 0) setSlideHeight(h)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const slideStep = slideHeight + GAP

  // Sync y to score — instant on first paint, spring on subsequent changes
  useEffect(() => {
    if (slideHeight === 0 || isDragging.current) return
    committedScore.current = score
    const targetY = -score * slideStep
    if (!initialized.current) {
      initialized.current = true
      y.set(targetY)
    } else {
      animate(y, targetY, { type: 'spring', stiffness: 400, damping: 35 })
    }
  }, [score, slideStep, y, slideHeight])

  function handleDragEnd() {
    isDragging.current = false
    const raw = -y.get() / slideStep
    const next = Math.max(0, Math.min(MAX_SCORE - 1, Math.round(raw)))
    animate(y, -next * slideStep, { type: 'spring', stiffness: 400, damping: 35 })
    if (next !== committedScore.current) {
      committedScore.current = next
      onChange(next)
    }
  }

  const cardBg = color === 'left' ? 'var(--left-card-bg)' : 'var(--right-card-bg)'

  const fontSize = slideHeight > 0
    ? Math.max(
        variant === 'main' ? Math.round(slideHeight * 0.45) : Math.round(slideHeight * 0.28),
        variant === 'main' ? 60 : 28,
      )
    : variant === 'main' ? 120 : 48

  const containerStyle: React.CSSProperties = {
    height: variant === 'main' ? 'min(600px, 45vh)' : 'min(300px, 45vh)',
    minHeight: variant === 'main' ? '200px' : '120px',
  }

  return (
    <div ref={wrapperRef} className="w-full rounded-xl overflow-hidden" style={containerStyle}>
      <motion.div
        style={{ y, display: 'flex', flexDirection: 'column', gap: `${GAP}px`, touchAction: 'none' }}
        drag={slideHeight > 0 ? 'y' : false}
        dragConstraints={{ top: -(MAX_SCORE - 1) * slideStep, bottom: 0 }}
        dragMomentum={false}
        dragElastic={0.05}
        onDragStart={() => { isDragging.current = true }}
        onDragEnd={handleDragEnd}
      >
        {Array.from({ length: MAX_SCORE }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-xl mx-1 border border-black/10 dark:border-white/10"
            style={{
              flex: `0 0 ${slideHeight}px`,
              height: `${slideHeight}px`,
              backgroundColor: cardBg,
              visibility: slideHeight === 0 ? 'hidden' : 'visible',
            }}
          >
            <span
              className="font-black tabular-nums select-none leading-none"
              style={{ fontSize: `${fontSize}px` }}
            >
              {i}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
