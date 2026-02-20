'use client'

import dynamic from 'next/dynamic'

// ssr: false prevents hydration mismatch — ScoreBoard reads from localStorage on mount
const ScoreBoard = dynamic(() => import('./ScoreBoard'), { ssr: false })

export default ScoreBoard
