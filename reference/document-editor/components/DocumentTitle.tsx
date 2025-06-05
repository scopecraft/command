"use client"

import { useState } from "react"

interface DocumentTitleProps {
  title: string
  fullContent: string
  onSave: (newContent: string) => Promise<void>
  onEdit: () => void
}

export function DocumentTitle({ title, fullContent, onSave, onEdit }: DocumentTitleProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onEdit}
    >
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {isHovering && (
        <div className="absolute top-0 left-0 bg-background/80 backdrop-blur-sm p-2 rounded">
          Click to edit full document
        </div>
      )}
    </div>
  )
}
