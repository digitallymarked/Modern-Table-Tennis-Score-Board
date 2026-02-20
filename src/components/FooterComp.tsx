import Link from 'next/link'
import ColorToggleBtn from './ColorToggleBtn'

export default function FooterComp() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-5 mt-8">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Home
          </Link>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Modern Table Tennis Score Board
        </p>
        <ColorToggleBtn />
      </div>
    </footer>
  )
}
