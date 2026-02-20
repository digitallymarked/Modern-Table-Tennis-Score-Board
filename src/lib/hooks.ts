'use client'

import { useState, useCallback } from 'react'
import superjson from 'superjson'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) return superjson.parse<T>(stored)
    } catch {}
    return defaultValue
  })

  const setStored = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const next =
          typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
        try {
          localStorage.setItem(key, superjson.stringify(next))
        } catch {}
        return next
      })
    },
    [key],
  )

  return [value, setStored]
}
