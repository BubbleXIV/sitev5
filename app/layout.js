import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "The Nightshade's Bloom",
  description: 'An FFXIV Venue Experience',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-nightshade-900 to-gray-900 min-h-screen text-white`}>
        <div className="fixed inset-0 bg-gradient-to-br from-nightshade-900/20 via-purple-900/10 to-gray-900/30 animate-gradient"></div>
        <div className="relative z-10">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
