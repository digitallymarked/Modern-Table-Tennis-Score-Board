'use client'

import { Menu } from '@base-ui/react/menu'
import { Switch } from '@base-ui/react/switch'
import {
  IconCategory,
  IconZoomReset,
  IconRepeat,
  IconServerCog,
  IconArrowsExchange,
  IconArrowsExchange2,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconEye,
  IconEyeOff,
  IconShare,
  IconPlayerTrackNextFilled,
} from '@tabler/icons-react'
import type { ScoreObject } from '@/lib/types'

interface ScoreBoardMenuProps {
  onResetGame: () => void
  onResetMatch: () => void
  onResetAll: () => void
  onSwapMatchScore: () => void
  onSwapGameScore: () => void
  showTimer: boolean
  onToggleTimer: () => void
  swapOnNextMatch: boolean
  onToggleSwapOnNextMatch: (val: boolean) => void
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
  swapOnNextMatch,
  onToggleSwapOnNextMatch,
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
        <IconCategory size={22} />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 min-w-[260px] outline-none">

            {/* Reset */}
            <p className={labelClass}>Reset</p>
            <Menu.Item className={itemClass} onClick={onResetGame}>
              <IconZoomReset size={14} /> Reset Game Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onResetMatch}>
              <IconRepeat size={14} /> Reset Match Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onResetAll}>
              <IconServerCog size={14} /> Reset All
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Next Match */}
            <p className={labelClass}>Next Match</p>
            {/* Switch as a non-menu-item to prevent close on click */}
            <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <IconPlayerTrackNextFilled size={14} />
                Swap sides on next match
              </span>
              <Switch.Root
                checked={swapOnNextMatch}
                onCheckedChange={onToggleSwapOnNextMatch}
                className="relative inline-flex w-9 h-5 rounded-full transition-colors outline-none cursor-pointer bg-gray-300 dark:bg-gray-600 data-[checked]:bg-blue-500"
              >
                <Switch.Thumb className="block w-4 h-4 rounded-full bg-white shadow-sm transition-transform translate-x-0.5 data-[checked]:translate-x-[18px]" />
              </Switch.Root>
            </div>

            <hr className={separatorClass} />

            {/* Swap */}
            <p className={labelClass}>Swap</p>
            <Menu.Item className={itemClass} onClick={onSwapMatchScore}>
              <IconArrowsExchange size={14} /> Swap Match Score
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onSwapGameScore}>
              <IconArrowsExchange2 size={14} /> Swap Game Score
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Timer */}
            <p className={labelClass}>Timer</p>
            {!isTimerRunning && (
              <Menu.Item className={itemClass} onClick={onTimerStart}>
                <IconPlayerPlayFilled size={14} /> Start Timer
              </Menu.Item>
            )}
            {isTimerRunning && (
              <Menu.Item className={itemClass} onClick={onTimerPause}>
                <IconPlayerPauseFilled size={14} /> Pause Timer
              </Menu.Item>
            )}
            <Menu.Item className={itemClass} onClick={onTimerReset}>
              <IconRepeat size={14} /> Reset Timer
            </Menu.Item>
            <Menu.Item className={itemClass} onClick={onToggleTimer}>
              {showTimer ? <IconEyeOff size={14} /> : <IconEye size={14} />}
              {showTimer ? 'Hide Timer' : 'Show Timer'}
            </Menu.Item>

            <hr className={separatorClass} />

            {/* Others */}
            <p className={labelClass}>Others</p>
            <Menu.Item className={itemClass} onClick={shareResult}>
              <IconShare size={14} /> Share Result
            </Menu.Item>

          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
