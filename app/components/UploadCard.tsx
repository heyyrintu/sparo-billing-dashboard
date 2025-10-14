'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/lib/ui/button'
import { Badge } from '@/lib/ui/badge'
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UploadCardProps {
  type: 'inbound' | 'outbound'
}

export function UploadCard({ type }: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Please select a .xlsx file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/upload/${type}`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setUploadMessage(result.message)
        toast.success(result.message)
      } else {
        setUploadStatus('error')
        setUploadMessage(result.error)
        toast.error(result.error)
      }
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage('Upload failed. Please try again.')
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [type])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">Drop your Excel file here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <p className="text-xs text-muted-foreground">
            Supports .xlsx files up to 10MB
          </p>
        </div>
        
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileInputChange}
          className="hidden"
          id={`file-input-${type}`}
          disabled={isUploading}
        />
        
        <Button
          asChild
          className="mt-4"
          disabled={isUploading}
        >
          <label htmlFor={`file-input-${type}`}>
            {isUploading ? 'Uploading...' : 'Choose File'}
          </label>
        </Button>
      </div>

      {uploadStatus !== 'idle' && (
        <div className="flex items-center space-x-2">
          {uploadStatus === 'success' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {uploadStatus === 'error' && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${
            uploadStatus === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {uploadMessage}
          </span>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Processing file...</span>
        </div>
      )}
    </div>
  )
}
