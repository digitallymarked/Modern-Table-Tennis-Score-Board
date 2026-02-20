'use client'

import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { ComponentProps } from 'react'

export function Switch(props: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      className="relative inline-flex h-5 w-9 cursor-pointer rounded-full bg-gray-300 outline-none transition-colors dark:bg-gray-600 data-[checked]:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      <BaseSwitch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[checked]:translate-x-[18px]" />
    </BaseSwitch.Root>
  )
}
