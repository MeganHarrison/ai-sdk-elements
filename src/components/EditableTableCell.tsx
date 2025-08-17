"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableTableCellProps {
  value: unknown
  columnType: string
  onSave: (value: unknown) => Promise<void>
  editable?: boolean
  className?: string
}

export function EditableTableCell({
  value,
  columnType,
  onSave,
  editable = true,
  className,
}: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return ""
    if (typeof val === "object") return JSON.stringify(val)
    return String(val)
  }

  const parseValue = (val: string): unknown => {
    if (val === "") return null
    
    const type = columnType.toUpperCase()
    
    if (type.includes("INT") || type.includes("NUMERIC")) {
      const num = Number(val)
      return isNaN(num) ? val : num
    }
    
    if (type.includes("BOOL")) {
      return val.toLowerCase() === "true" || val === "1"
    }
    
    if (type.includes("JSON")) {
      try {
        return JSON.parse(val)
      } catch {
        return val
      }
    }
    
    return val
  }

  const handleEdit = () => {
    if (!editable) return
    setEditValue(formatValue(value))
    setIsEditing(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const parsedValue = parseValue(editValue)
      await onSave(parsedValue)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(formatValue(value))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (!isEditing) {
    return (
      <div
        className={cn(
          "group relative flex items-center",
          editable && "cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1",
          className
        )}
        onClick={handleEdit}
      >
        <span className="pr-6">
          {value === null || value === undefined ? (
            <span className="text-muted-foreground/50 italic">NULL</span>
          ) : (
            formatValue(value)
          )}
        </span>
        {editable && (
          <Edit2 className="absolute right-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 -mx-2">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="h-7 text-sm"
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={handleSave}
        disabled={isSaving}
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={handleCancel}
        disabled={isSaving}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}