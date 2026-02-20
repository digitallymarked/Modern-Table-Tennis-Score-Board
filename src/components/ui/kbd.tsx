import { ComponentProps } from 'react'

export function Kbd({ children, className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={`inline-flex h-5 select-none items-center rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-1.5 font-mono text-[10px] font-medium text-gray-400 dark:text-gray-500${className ? ' ' + className : ''}`}
      {...props}
    >
      {children}
    </kbd>
  )
}
