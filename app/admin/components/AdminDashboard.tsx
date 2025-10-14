'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card'
import { Badge } from '@/lib/ui/badge'
import { Button } from '@/lib/ui/button'
import { Input } from '@/lib/ui/input'
import { Label } from '@/lib/ui/label'
import { Download, Filter, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import type { UploadLogEntry } from '@/lib/types'

export function AdminDashboard() {
  const [uploads, setUploads] = useState<UploadLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    fileType: '',
    status: '',
    limit: '20'
  })

  const fetchUploads = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.fileType) params.append('fileType', filters.fileType)
      if (filters.status) params.append('status', filters.status)
      if (filters.limit) params.append('limit', filters.limit)

      const response = await fetch(`/api/upload-log?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUploads(data)
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploads()
  }, [filters])

  const handleDownload = async (uploadId: string, filename: string) => {
    try {
      const response = await fetch(`/api/admin/download/${uploadId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success">Success</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFileTypeBadge = (fileType: string) => {
    switch (fileType) {
      case 'INBOUND':
        return <Badge variant="outline">Inbound</Badge>
      case 'OUTBOUND':
        return <Badge variant="outline">Outbound</Badge>
      default:
        return <Badge variant="secondary">{fileType}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type</Label>
              <select
                id="fileType"
                value={filters.fileType}
                onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Types</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                type="number"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                min="1"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={fetchUploads} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>
            Recent file uploads and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No uploads found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Filename</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Rows</th>
                    <th className="text-left py-2">Uploaded</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => (
                    <tr key={upload.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">{upload.filename}</td>
                      <td className="py-2">{getFileTypeBadge(upload.fileType)}</td>
                      <td className="py-2">{getStatusBadge(upload.status)}</td>
                      <td className="py-2">{upload.rowCount.toLocaleString()}</td>
                      <td className="py-2 text-sm text-muted-foreground">
                        {format(new Date(upload.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="py-2">
                        {upload.status === 'SUCCESS' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(upload.id, upload.filename)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
