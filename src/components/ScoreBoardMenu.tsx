'use client'

import { Menu } from '@base-ui/react/menu'
import {
  LayoutGrid,
  RotateCcw,
  RefreshCcw,
  Trash2,
  ArrowLeftRight,
  ArrowUpDown,
  Play,
  Pause,
  Eye,
  EyeOff,
  Share2,
} from 'lucide-react'
import type { ScoreObject } from '@/lib/types'

interface ScoreBoardMenuProps {
  onResetGame: () => void
  onResetMatch: () => void
  onResetAll: () => void
  onSwapMatchScore: () => void
  onSwapGameScore: () => void
  showTimer: boolean
  onToggleTimer: () => void
  isTimerRunning: boolean
  onTimerStart: () => void
  onTimerPause: () => void
  onTimerReset: () => void
  score: ScoreObject
}

const itemClass =
  'flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800 transition-colors w-full text-left'

const labelClass =
  'px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider'

const separatorClass = 'my-1 border-t border-gray-100 dark:border-gray-800'

export default function ScoreBoardMenu({
  onResetGame,
  onResetMatch,
  onResetAll,
  onSwapMatchScore,
  onSwapGameScore,
  showTimer,
  onToggleTimer,
  isTimerRunning,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  score,
}: ScoreBoardMenuProps) {
  async function shareResult() {
    try {
      await navigator.share({
        title: `TT Match (${score.leftPlayerMatchScore}–${score.rightPlayerMatchScore})`,
        text: `Match: ${score.leftPlayerMatchScore}–${score.rightPlayerMatchScore}\nGame: ${score.leftPlayerScore}–${score.rightPlayerScore}`,
        url: window.location.href,
      })
    } catch {}
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Menu"
          />
        }
      >
        <LayoutGrid size={22} />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 min-w-[260px] outline-none">

            {/* Reset */}
            <p className={labelClass}>Reset</p>
            <Menu.Item className={itemClass} onClick={onResetGame}>
              <RotateCcw size={14} /> Reset Game Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onResetMatch}>
              <RefreshCcw size={14} /> Reset Match Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onResetAll}>
              <Trash2 size={14} /> Reset All
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Swap */}
            <p className={labelClass}>Swap</p>
            <Menu.Item className={itemClass} onClick={onSwapMatchScore}>
              <ArrowLeftRight size={14} /> Swap Match Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onSwapGameScore}>
              <ArrowUpDown size={14} /> Swap Game Score
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Timer */}
            <p className={labelClass}>Timer</p>
            {!isTimerRunning && (
              <Menu.Item className={itemClass} onClick={onTimerStart}>
                <Play size={14} /> Start Timer
              </Menu.Item>
            )}
            {isTimerRunning && (
              <Menu.Item className={itemClass} onClick={onTimerPause}>
                <Pause size={14} /> Pause Timer
              </Menu.Item>
            )}
            <Menu.Item className={itemClass} onClick={onTimerReset}>
              <RotateCcw size={14} /> Reset Timer
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onToggleTimer}>
              {showTimer ? <EyeOff size={14} /> : <Eye size={14} />}
              {showTimer ? 'Hide Timer' : 'Show Timer'}
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Others */}
            <p className={labelClass}>Others</p>
            <Menu.Item className={itemClass} onClick={shareResult}>
              <Share2 size={14} /> Share Result
            </Menu.Item>

          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
