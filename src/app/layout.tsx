import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import FooterComp from '@/components/FooterComp'
import './globals.css'

export const metadata: Metadata = {
  title: 'Modern Table Tennis Score Board',
  description:
    'Free and open source table tennis score board with automatic serve tracking, match timer, and multi-match support.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <main>{children}</main>
          <FooterComp />
        </ThemeProvider>
      </body>
    </html>
  )
}
