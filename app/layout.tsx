import '../src/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Computer Use Agent - macOS Agent',
  description: 'Intelligent Desktop Automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  )
} 