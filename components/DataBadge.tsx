'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/lib/ui/badge'
import { BaseCard } from '@/components/BaseCard'
import { Clock, Database } from 'lucide-react'
import { format } from 'date-fns'

interface UploadLogEntry {
  id: string
  filename: string
  fileType: 'INBOUND' | 'OUTBOUND'
  uploadedBy: string
  rowCount: number
  checksum: string
  status: 'SUCCESS' | 'FAILED'
  message?: string
  createdAt: string
}

export function DataBadge() {
  const [lastUpload, setLastUpload] = useState<UploadLogEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLastUpload = async () => {
      try {
        const response = await fetch('/api/upload-log')
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setLastUpload(data[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch upload log:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLastUpload()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">Loading data status...</span>
      </div>
    )
  }

  if (!lastUpload) {
    return (
      <div className="flex items-center space-x-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No data uploaded yet</span>
      </div>
    )
  }

  const uploadDate = new Date(lastUpload.createdAt)
  const timeString = format(uploadDate, 'HH:mm')
  const dateString = format(uploadDate, 'yyyy-MM-dd')

  return (
    <BaseCard borderColor="rgba(59, 130, 246, 0.5)" padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Updated {timeString} IST; data through {dateString}
          </span>
          <Badge variant={lastUpload.status === 'SUCCESS' ? 'success' : 'destructive'}>
            {lastUpload.status}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            Latest: {lastUpload.filename}
          </span>
          <Badge variant="outline">
            {lastUpload.fileType}
          </Badge>
        </div>
      </div>
    </BaseCard>
  )
}
