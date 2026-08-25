import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  // O "Cyber Todo" kismini ucurduk, premium ve temiz durmasi icin sadece Gorevlerim yaptik
  title: 'Görevlerim',
  description: 'Kişisel görev ve ajanda takip uygulaması.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}