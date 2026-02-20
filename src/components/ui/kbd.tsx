import { ComponentProps } from 'react'

export function Kbd({ children, className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={`inline-flex select-none items-center rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-1 font-mono text-[20px] font-medium text-gray-400 dark:text-gray-500${className ? ' ' + className : ''}`}
      {...props}
    >
      {children}
    </kbd>
  )
}
