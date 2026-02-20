'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useStopwatch } from 'react-timer-hook'
import confetti from 'canvas-confetti'
import { useLocalStorage } from '@/lib/hooks'
import { defaultScore, type ScoreObject } from '@/lib/types'
import { determineWhoServe, determineWhoWin } from '@/lib/utils'
import ScoreDrag from './ScoreDrag'
import ScoreBoardMenu from './ScoreBoardMenu'
import ColorToggleBtn from './ColorToggleBtn'
import { Kbd } from './ui/kbd'
import {
  Plus,
  Minus,
  SkipForward,
  Maximize,
  Minimize,
  Swords,
  Github,
} from 'lucide-react'

const MAX = 49

// Shared tap animation for all buttons
const tapScale = {
  whileTap: { scale: 0.88 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
}

export default function ScoreBoard() {
  const [score, setScore] = useLocalStorage<ScoreObject>(
    'players-score2-scheme',
    defaultScore,
  )
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    'score-board-show-timer',
    true,
  )
  const [isShaking, setIsShaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const previousWinner = useRef('')

  const { seconds, minutes, isRunning, start, pause, reset } = useStopwatch({
    autoStart: false,
  })
  const timerRef = useRef({ start, pause, isRunning })
  useEffect(() => {
    timerRef.current = { start, pause, isRunning }
  })

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return
      const map: Record<string, () => void> = {
        q: () => adjustScore('leftPlayerScore', 1),
        w: () => adjustScore('leftPlayerMatchScore', 1),
        e: () => adjustScore('rightPlayerMatchScore', 1),
        r: () => adjustScore('rightPlayerScore', 1),
        a: () => adjustScore('leftPlayerScore', -1),
        s: () => adjustScore('leftPlayerMatchScore', -1),
        d: () => adjustScore('rightPlayerMatchScore', -1),
        f: () => adjustScore('rightPlayerScore', -1),
      }
      map[e.key.toLowerCase()]?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
  }

  function fireConfetti() {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 600)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      startVelocity: 45,
      zIndex: 1000,
    })
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { y: 0.6 },
      startVelocity: 35,
      decay: 0.92,
      zIndex: 1000,
    })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const whoWon = determineWhoWin(
      score.leftPlayerScore,
      score.rightPlayerScore,
    )
    if (whoWon !== '') {
      timerRef.current.pause()
      if (previousWinner.current === '') {
        previousWinner.current = whoWon
        fireConfetti()
      }
    } else {
      previousWinner.current = ''
      if (!timerRef.current.isRunning) timerRef.current.start()
    }
  }, [score])

  function adjustScore(
    field:
      | 'leftPlayerScore'
      | 'rightPlayerScore'
      | 'leftPlayerMatchScore'
      | 'rightPlayerMatchScore',
    delta: number,
  ) {
    setScore((prev) => ({
      ...prev,
      [field]: Math.max(0, Math.min(MAX, (prev[field] as number) + delta)),
    }))
  }

  function changeScore(
    value: number,
    field:
      | 'leftPlayerScore'
      | 'rightPlayerScore'
      | 'leftPlayerMatchScore'
      | 'rightPlayerMatchScore',
  ) {
    setScore((prev) => ({ ...prev, [field]: value }))
  }

  function resetGameScore() {
    setScore((prev) => ({ ...prev, leftPlayerScore: 0, rightPlayerScore: 0 }))
    previousWinner.current = ''
    reset(new Date(), false)
  }

  function resetMatchScore() {
    setScore((prev) => ({
      ...prev,
      leftPlayerMatchScore: 0,
      rightPlayerMatchScore: 0,
    }))
  }

  function resetAllScore() {
    setScore({ ...defaultScore })
    previousWinner.current = ''
    reset(new Date(), false)
  }

  function swapGameScore() {
    setScore((prev) => ({
      ...prev,
      leftPlayerScore: prev.rightPlayerScore,
      rightPlayerScore: prev.leftPlayerScore,
    }))
  }

  function swapMatchScore() {
    setScore((prev) => ({
      ...prev,
      leftPlayerMatchScore: prev.rightPlayerMatchScore,
      rightPlayerMatchScore: prev.leftPlayerMatchScore,
    }))
  }

  function nextMatch() {
    const whoWon = determineWhoWin(
      score.leftPlayerScore,
      score.rightPlayerScore,
    )
    if (whoWon === '') return

    // Players always swap sides — cross the match scores with them.
    // The winner gets +1 on their new (post-swap) side.
    // whoServeFirst is positional and stays unchanged so the same side serves.
    let newLeftMatch = score.rightPlayerMatchScore
    let newRightMatch = score.leftPlayerMatchScore

    if (whoWon === '< Left Win') newRightMatch += 1
    else if (whoWon === 'Right Win >') newLeftMatch += 1

    setScore((prev) => ({
      ...prev,
      leftPlayerScore: 0,
      rightPlayerScore: 0,
      leftPlayerMatchScore: newLeftMatch,
      rightPlayerMatchScore: newRightMatch,
      leftPlayerName: prev.rightPlayerName ?? '',
      rightPlayerName: prev.leftPlayerName ?? '',
    }))
    previousWinner.current = ''
    reset(new Date(), false)
  }

  const whoWon = determineWhoWin(score.leftPlayerScore, score.rightPlayerScore)
  const currentServer = determineWhoServe(score)
  const isDeuce = score.leftPlayerScore >= 10 && score.rightPlayerScore >= 10

  return (
    <motion.div
      className='min-h-screen'
      animate={
        isShaking
          ? {
              x: [-5, 5, -5, 5, -3, 3, -2, 2, 0],
              y: [-3, 3, -3, 3, -2, 2, -1, 1, 0],
            }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Top bar */}
      <div className='grid grid-cols-3 items-center px-4 pt-4 pb-2'>
        {/* Left: spacer */}
        <div />

        {/* Center: Timer */}
        <div className='flex justify-center'>
          <span className={`font-mono text-5xl font-light tabular-nums text-gray-300 dark:text-gray-600 transition-opacity duration-200${showTimer ? '' : ' invisible'}`}>
            {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </span>
        </div>

        {/* Right: Action buttons */}
        <div className='flex items-center justify-end gap-1'>
          <a
            href='https://github.com/digitallymarked/Modern-Table-Tennis-Score-Board'
            target='_blank'
            rel='noopener noreferrer'
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
            title='View on GitHub'
          >
            <Github size={20} />
          </a>

          <motion.button
            {...tapScale}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
          >
            {isFullscreen ? (
              <Minimize size={20} />
            ) : (
              <Maximize size={20} />
            )}
          </motion.button>

          <ScoreBoardMenu
            onResetGame={resetGameScore}
            onResetMatch={resetMatchScore}
            onResetAll={resetAllScore}
            onSwapGameScore={swapGameScore}
            onSwapMatchScore={swapMatchScore}
            showTimer={showTimer}
            onToggleTimer={() => setShowTimer((v) => !v)}
            isTimerRunning={isRunning}
            onTimerStart={start}
            onTimerPause={pause}
            onTimerReset={() => reset(new Date(), false)}
            score={score}
          />

          <ColorToggleBtn />
        </div>
      </div>

      {/* Match title */}
      <div className='px-4 pb-1'>
        <input
          className='w-full text-center text-3xl md:text-5xl font-semibold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600'
          placeholder='Match title...'
          value={score.freeText}
          onChange={(e) =>
            setScore((prev) => ({ ...prev, freeText: e.target.value }))
          }
        />
      </div>

      {/* Player names + serve ball */}
      <div className='grid grid-cols-[1fr_auto_1fr] items-center px-4'>
        <input
          className='text-3xl md:text-5xl font-semibold bg-transparent border-none outline-none min-w-0 placeholder:text-gray-300 dark:placeholder:text-gray-600'
          placeholder='Player 1'
          value={score.leftPlayerName ?? ''}
          onChange={(e) =>
            setScore((prev) => ({ ...prev, leftPlayerName: e.target.value }))
          }
        />
        <motion.button
          animate={{ opacity: whoWon !== '' ? 1 : 0, scale: whoWon !== '' ? 1 : 0.7 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          whileTap={{ scale: 0.88 }}
          onClick={nextMatch}
          title='Start next game'
          disabled={whoWon === ''}
          className='flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors disabled:pointer-events-none'
        >
          <SkipForward size={18} />
          Next game
        </motion.button>
        <input
          className='justify-self-end text-3xl md:text-5xl font-semibold bg-transparent border-none outline-none text-right min-w-0 placeholder:text-gray-300 dark:placeholder:text-gray-600'
          placeholder='Player 2'
          value={score.rightPlayerName ?? ''}
          onChange={(e) =>
            setScore((prev) => ({ ...prev, rightPlayerName: e.target.value }))
          }
        />
      </div>

      {/* Serve ball — travels full screen width */}
      <div className={`flex px-4 py-2 mb-1 ${currentServer === 'left' ? 'justify-start' : 'justify-end'}`}>
        <motion.button
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          whileTap={{ scale: 0.85 }}
          onClick={() =>
            setScore((prev) => ({
              ...prev,
              whoServeFirst: prev.whoServeFirst === 'left' ? 'right' : 'left',
            }))
          }
          className='w-10 h-10'
          title='Tap to change first server'
        >
          <img src='/tt-ball.svg' alt='Serving' className='w-full h-full drop-shadow' draggable={false} />
        </motion.button>
      </div>

      {/* Score grid */}
      <div className='grid grid-cols-[1fr_auto_1fr] gap-2 px-4'>
        {/* Left game score */}
        <div className='flex flex-col items-center gap-1'>
          <Kbd>Q</Kbd>
          <motion.button
            {...tapScale}
            onClick={() => adjustScore('leftPlayerScore', 1)}
            className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
          >
            <Plus size={24} strokeWidth={2} />
          </motion.button>
          <ScoreDrag
            score={score.leftPlayerScore}
            onChange={(v) => changeScore(v, 'leftPlayerScore')}
            variant='main'
            color='left'
          />
          <motion.button
            {...tapScale}
            onClick={() => adjustScore('leftPlayerScore', -1)}
            className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
          >
            <Minus size={24} strokeWidth={2} />
          </motion.button>
          <Kbd>A</Kbd>
        </div>

        {/* Center column */}
        <div className='flex flex-col items-center justify-between py-2 gap-3 min-w-[90px]'>
          {/* Match score carousels */}
          <div className='flex gap-1 items-start'>
            <div className='flex flex-col items-center gap-1'>
              <Kbd>W</Kbd>
              <motion.button
                {...tapScale}
                onClick={() => adjustScore('leftPlayerMatchScore', 1)}
                className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
              >
                <Plus size={18} />
              </motion.button>
              <ScoreDrag
                score={score.leftPlayerMatchScore}
                onChange={(v) => changeScore(v, 'leftPlayerMatchScore')}
                variant='match'
                color='left'
              />
              <motion.button
                {...tapScale}
                onClick={() => adjustScore('leftPlayerMatchScore', -1)}
                className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
              >
                <Minus size={18} />
              </motion.button>
              <Kbd>S</Kbd>
            </div>
            <div className='flex flex-col items-center gap-1'>
              <Kbd>E</Kbd>
              <motion.button
                {...tapScale}
                onClick={() => adjustScore('rightPlayerMatchScore', 1)}
                className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
              >
                <Plus size={18} />
              </motion.button>
              <ScoreDrag
                score={score.rightPlayerMatchScore}
                onChange={(v) => changeScore(v, 'rightPlayerMatchScore')}
                variant='match'
                color='right'
              />
              <motion.button
                {...tapScale}
                onClick={() => adjustScore('rightPlayerMatchScore', -1)}
                className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
              >
                <Minus size={18} />
              </motion.button>
              <Kbd>D</Kbd>
            </div>
          </div>

          {/* Deuce / Win status */}
          <AnimatePresence mode='wait'>
            {isDeuce && whoWon === '' && (
              <motion.div
                key='deuce'
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className='flex items-center gap-1 text-sm font-light text-gray-500 dark:text-gray-400'
              >
                <Swords size={16} /> Deuce
              </motion.div>
            )}
            {whoWon !== '' && (
              <motion.div
                key='winner'
                initial={{ opacity: 0, scale: 0.5, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className='text-base font-bold leading-tight text-center'
              >
                {whoWon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right game score */}
        <div className='flex flex-col items-center gap-1'>
          <Kbd>R</Kbd>
          <motion.button
            {...tapScale}
            onClick={() => adjustScore('rightPlayerScore', 1)}
            className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
          >
            <Plus size={24} strokeWidth={2} />
          </motion.button>
          <ScoreDrag
            score={score.rightPlayerScore}
            onChange={(v) => changeScore(v, 'rightPlayerScore')}
            variant='main'
            color='right'
          />
          <motion.button
            {...tapScale}
            onClick={() => adjustScore('rightPlayerScore', -1)}
            className='w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors'
          >
            <Minus size={24} strokeWidth={2} />
          </motion.button>
          <Kbd>F</Kbd>
        </div>
      </div>

    </motion.div>
  )
}
