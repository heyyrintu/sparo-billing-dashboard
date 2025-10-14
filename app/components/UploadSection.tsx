'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui/card'
import { UploadCard } from './UploadCard'
import { FileUp, Download } from 'lucide-react'

export function UploadSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileUp className="h-5 w-5" />
            <span>Inbound MIS Upload</span>
          </CardTitle>
          <CardDescription>
            Upload your Inbound MIS Excel file (PIPO & BIBO Inward sheet)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadCard type="inbound" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Outbound MIS Upload</span>
          </CardTitle>
          <CardDescription>
            Upload your Outbound MIS Excel file (Outward MIS sheet)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadCard type="outbound" />
        </CardContent>
      </Card>
    </div>
  )
}
