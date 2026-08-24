import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Görevlerim | Cyber Todo',
  description: 'Kişisel görev ve ajanda takip uygulaması.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // HTML dilini Türkçe yaptık
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}