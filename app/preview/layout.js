import '@/app/globals.css'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Preview - The Nightshade's Bloom",
  description: 'Preview Page',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function PreviewLayout({ children }) {
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
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
