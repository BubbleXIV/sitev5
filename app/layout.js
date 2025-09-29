import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "The Nightshade's Bloom",
  description: 'An FFXIV Venue Experience',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`} style={{ 
        background: 'linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-via), var(--bg-gradient-to))',
        color: 'var(--text-primary)'
      }}>
        <ThemeProvider>
          <div className="fixed inset-0 animate-gradient" style={{ 
            background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--bg-gradient-via) 20%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent), color-mix(in srgb, var(--bg-gradient-to) 30%, transparent))'
          }}></div>
          <div className="relative z-10">
            <Navbar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
