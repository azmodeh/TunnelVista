import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TunnelVista',
  description: 'Ready to connect.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}