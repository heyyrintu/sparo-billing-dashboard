'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/lib/ui/button'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">Drona Logitech</h1>
          <span className="text-sm text-muted-foreground">Billing Dashboard</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
