"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusIcon, XIcon } from "lucide-react"

interface PropertyNotesProps {
  notes?: string
  tags?: string[]
  onNotesChange: (notes: string) => void
  onTagsChange: (tags: string[]) => void
}

export function PropertyNotes({ notes = "", tags = [], onNotesChange, onTagsChange }: PropertyNotesProps) {
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заметки и теги</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="notes">Заметки</Label>
          <Textarea
            id="notes"
            placeholder="Добавьте заметки о переговорах, особенностях объекта или истории сделки..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">Сохраняйте важную информацию о каждом объекте</p>
        </div>

        <div>
          <Label>Теги</Label>
          <p className="text-xs text-muted-foreground mb-2">Быстрая категоризация объектов</p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm py-1.5 px-3">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-destructive">
                    <XIcon className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Например: Срочно, Люкс, Семейное, Инвестиция..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
