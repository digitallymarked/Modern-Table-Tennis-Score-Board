'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconSun, IconMoon } from '@tabler/icons-react'

export default function ColorToggleBtn() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="block"
        >
          {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
