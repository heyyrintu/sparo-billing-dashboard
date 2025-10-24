'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [runtimeDisable, setRuntimeDisable] = useState(false)

  useEffect(() => {
    // First check server runtime flag (allows toggling without rebuilding client)
    ;(async () => {
      try {
        const res = await fetch('/api/config')
        const json = await res.json()
        if (json?.disableAuth) {
          setRuntimeDisable(true)
          return
        }
      } catch (e) {
        // ignore
      }
    })()

    // Bypass auth entirely if client-side env flag is set
    if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') return
    if (status === 'loading') return // Still loading
    
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true' || runtimeDisable) {
    return <>{children}</>
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
