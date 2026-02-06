import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Figma → Instant Builder Blueprint',
  description: 'Convert Figma frames to Instant Builder blueprints',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
