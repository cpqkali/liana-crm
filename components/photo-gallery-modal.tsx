"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { deletePhoto, uploadPhoto } from "@/lib/api"

interface PhotoGalleryModalProps {
  objectId: string
  photos: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  onPhotosChange: (photos: string[]) => void
}

export function PhotoGalleryModal({
  objectId,
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onPhotosChange,
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }

  const handleDelete = async () => {
    if (!photos[currentIndex]) return

    setIsDeleting(true)
    try {
      await deletePhoto(objectId, photos[currentIndex])
      const newPhotos = photos.filter((_, index) => index !== currentIndex)
      onPhotosChange(newPhotos)

      if (newPhotos.length === 0) {
        onClose()
      } else if (currentIndex >= newPhotos.length) {
        setCurrentIndex(newPhotos.length - 1)
      }

      toast.success("Фото удалено")
    } catch (error) {
      toast.error("Ошибка при удалении фото")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = Array.from(files).map((file) => uploadPhoto(objectId, file))
      const results = await Promise.all(uploadPromises)
      const newPhotoPaths = results.map((result) => result.photoPath)
      onPhotosChange([...photos, ...newPhotoPaths])
      toast.success(`Загружено ${files.length} фото`)
    } catch (error) {
      toast.error("Ошибка при загрузке фото")
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  if (photos.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Фото {currentIndex + 1} из {photos.length}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="upload-photo">
                <Button variant="outline" size="sm" disabled={isUploading} asChild>
                  <span className="cursor-pointer">
                    <UploadIcon />
                    {isUploading ? "Загрузка..." : "Добавить"}
                  </span>
                </Button>
              </label>
              <input
                id="upload-photo"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
                <TrashIcon />
                {isDeleting ? "Удаление..." : "Удалить"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={photos[currentIndex] || "/placeholder.svg"}
              alt={`Фото ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {photos.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent"
                onClick={handlePrevious}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent"
                onClick={handleNext}
              >
                <ChevronRightIcon />
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto py-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`Миниатюра ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
