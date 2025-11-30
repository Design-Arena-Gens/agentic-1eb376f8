import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agentic Voice Assistant',
  description: 'AI-powered voice assistant with multiple modes and self-improving capabilities',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Voice AI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
