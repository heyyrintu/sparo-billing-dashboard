'use client'

import { useState } from 'react'
import { BaseCard } from '@/components/BaseCard'
import { UploadCard } from '@/components/UploadCard'
import { Button } from '@/lib/ui/button'
import { FileUp, Download, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function UploadSection() {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDeleteData = async (type: 'inbound' | 'outbound' | 'all') => {
    const typeLabel = type === 'all' ? 'all data' : `${type} data`
    
    if (!confirm(`Are you sure you want to delete all ${typeLabel}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(type)

    try {
      const response = await fetch(`/api/data/delete?type=${type}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        // Refresh the page to update any displayed data
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to delete data')
      }
    } catch (error) {
      toast.error('Failed to delete data. Please try again.')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BaseCard borderColor="rgba(224, 30, 31, 0.5)" padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-2">
              <FileUp className="h-5 w-5" />
              <span>Inbound MIS Upload</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload your Inbound MIS Excel file (PIPO & BIBO Inward sheet)
            </p>
          </div>
          <div>
            <UploadCard type="inbound" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteData('inbound')}
              disabled={isDeleting === 'inbound'}
              className="w-full"
            >
              {isDeleting === 'inbound' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Inbound Data
                </>
              )}
            </Button>
          </div>
        </BaseCard>
        
        <BaseCard borderColor="rgba(59, 130, 246, 0.5)" padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2 mb-2">
              <Download className="h-5 w-5" />
              <span>Outbound MIS Upload</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload your Outbound MIS Excel file (Outward MIS sheet)
            </p>
          </div>
          <div>
            <UploadCard type="outbound" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteData('outbound')}
              disabled={isDeleting === 'outbound'}
              className="w-full"
            >
              {isDeleting === 'outbound' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Outbound Data
                </>
              )}
            </Button>
          </div>
        </BaseCard>
      </div>

      {/* Delete All Data Card */}
      <BaseCard borderColor="rgba(239, 68, 68, 0.5)" padding="lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Delete all data from the database. This will remove all inbound, outbound, and summary data.
            </p>
            <p className="text-xs text-red-600 font-medium">
              ⚠️ This action cannot be undone!
            </p>
          </div>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => handleDeleteData('all')}
            disabled={isDeleting === 'all'}
            className="ml-4"
          >
            {isDeleting === 'all' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting All Data...
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 mr-2" />
                Delete All Data
              </>
            )}
          </Button>
        </div>
      </BaseCard>
    </div>
  )
}
