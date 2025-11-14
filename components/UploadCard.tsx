'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/lib/ui/button'
import { Badge } from '@/lib/ui/badge'
import { Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { toast } from 'sonner'

interface UploadCardProps {
  type: 'inbound' | 'outbound'
}

export function UploadCard({ type }: UploadCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [rejectedCount, setRejectedCount] = useState(0)

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
        setUploadId(result.uploadId || null)
        setRejectedCount(result.rejectedCount || 0)
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

  const handleDownloadRejected = useCallback(async () => {
    if (!uploadId) return

    try {
      const response = await fetch(`/api/rejected-rows/${uploadId}`)
      if (response.ok) {
        const blob = await response.blob()
        
        // Check if it's actually an Excel file or an error JSON
        if (blob.type === 'application/json') {
          const error = await blob.text()
          const errorData = JSON.parse(error)
          toast.error(errorData.error || 'Failed to download rejected rows')
          return
        }
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rejected-rows-${uploadId.slice(0, 8)}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Rejected rows file downloaded')
      } else {
        const error = await response.json()
        if (error.error && error.error.includes('npx prisma generate')) {
          toast.error('Please restart the server after running: npx prisma generate', {
            duration: 5000
          })
        } else {
          toast.error(error.error || 'Failed to download rejected rows')
        }
      }
    } catch (error) {
      toast.error('Failed to download rejected rows. Please ensure the server is restarted after running: npx prisma generate')
    }
  }, [uploadId])

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
        <div className="space-y-2">
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
          
          {uploadStatus === 'success' && rejectedCount > 0 && uploadId && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {rejectedCount} row{rejectedCount !== 1 ? 's' : ''} rejected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadRejected}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Download Rejected Rows
              </Button>
            </div>
          )}
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
