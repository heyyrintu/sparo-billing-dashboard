'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload } from 'lucide-react'

export function Header() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-lg shadow-xl relative"
      style={{
        background: `linear-gradient(to right, rgba(224, 30, 31, 0.2), rgba(254, 165, 25, 0.2))`,
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, rgba(224, 30, 31, 0.35), rgba(254, 165, 25, 0.35))`,
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-[10px]">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="backdrop-blur-md px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 bg-gray-100/80 border border-gray-300">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#E01E1F] to-[#FEA519] bg-clip-text text-transparent">
                  Drona Logitech
                </h1>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link href="/">
              <button
                className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                  pathname === '/'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </Link>
            <Link href="/upload">
              <button
                className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                  pathname === '/upload'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
