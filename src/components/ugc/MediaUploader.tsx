'use client'

/**
 * Media Uploader Component
 * 
 * Handles file selection, upload to Supabase Storage via signed URLs,
 * and displays upload progress/state.
 * 
 * Drag and Drop = A UI pattern where users can drag files from their
 * computer and drop them into a designated area to upload.
 */

import { useState, useRef, useCallback } from 'react'
import { getUploadUrl, isValidFile, getMediaType, type MediaType } from '@/lib/ugc'

interface UploadedMedia {
  storagePath: string
  fileName: string
  mimeType: string
  size: number
}

interface MediaUploaderProps {
  postId: string
  onUpload: (media: UploadedMedia) => void
  onRemove: (storagePath: string) => void
  uploadedMedia: UploadedMedia[]
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

export function MediaUploader({ postId, onUpload, onRemove, uploadedMedia }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      // Validate file
      const validation = isValidFile(file)
      if (!validation.valid) {
        setUploads((prev) => [...prev, {
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: validation.error,
        }])
        continue
      }

      // Add to upload queue
      setUploads((prev) => [...prev, {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      }])

      try {
        // Get signed upload URL
        const urlResult = await getUploadUrl(postId, file.name, file.type, file.size)
        
        if (!urlResult.success) {
          setUploads((prev) => prev.map((u) =>
            u.fileName === file.name
              ? { ...u, status: 'error', error: urlResult.error }
              : u
          ))
          continue
        }

        // Upload file directly to Supabase Storage
        const response = await fetch(urlResult.data.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        // Update progress to complete
        setUploads((prev) => prev.map((u) =>
          u.fileName === file.name
            ? { ...u, progress: 100, status: 'complete' }
            : u
        ))

        // Notify parent
        onUpload({
          storagePath: urlResult.data.storagePath,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        })

        // Remove from progress list after a delay
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.fileName !== file.name))
        }, 2000)

      } catch (err) {
        setUploads((prev) => prev.map((u) =>
          u.fileName === file.name
            ? { ...u, status: 'error', error: 'Upload failed. Please try again.' }
            : u
        ))
      }
    }
  }, [postId, onUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getMediaIcon = (mimeType: string) => {
    const type = getMediaType(mimeType)
    switch (type) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎬'
      case 'audio':
        return '🎵'
      case 'document':
        return '📄'
      default:
        return '📎'
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg,application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            Images, videos, audio, or PDFs (max 50MB)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={`${upload.fileName}-${index}`}
              className={`
                flex items-center gap-3 p-3 rounded-lg
                ${upload.status === 'error' ? 'bg-red-500/10' : 'bg-muted/50'}
              `}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.fileName}</p>
                {upload.status === 'uploading' && (
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                  </div>
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-red-500">{upload.error}</p>
                )}
                {upload.status === 'complete' && (
                  <p className="text-xs text-green-500">Upload complete!</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded files:</p>
          {uploadedMedia.map((media) => (
            <div
              key={media.storagePath}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <span className="text-2xl">{getMediaIcon(media.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{media.fileName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(media.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(media.storagePath)}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Remove file"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
