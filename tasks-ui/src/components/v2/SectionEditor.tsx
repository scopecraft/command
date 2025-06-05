"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface SectionEditorProps {
  section: 'instruction' | 'tasks' | 'deliverable' | 'log'
  content: string
  onSave: (newContent: string) => Promise<void>
  readOnly?: boolean
}

export function SectionEditor({ section, content, onSave, readOnly = false }: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(content)
  const [isHovering, setIsHovering] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Update local content when prop changes
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  const handleEdit = useCallback(() => {
    if (!readOnly && !isSaving) {
      setIsEditing(true)
    }
  }, [readOnly, isSaving])

  const handleSave = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      await onSave(localContent)
      setIsEditing(false)
    } catch (error) {
      console.error("Save failed:", error)
      // Revert to original content on error
      setLocalContent(content)
    } finally {
      setIsSaving(false)
    }
  }, [localContent, content, isSaving, onSave])

  const handleCancel = useCallback(() => {
    setLocalContent(content)
    setIsEditing(false)
  }, [content])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        handleSave()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  // Global keyboard shortcut for edit mode
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isHovering && !isEditing && !readOnly && e.key.toLowerCase() === "e") {
        e.preventDefault()
        handleEdit()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [isHovering, isEditing, readOnly, handleEdit])

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      )
    }
  }, [isEditing])

  // Adjust textarea height based on content
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight()
    }
  }, [isEditing, localContent, adjustTextareaHeight])

  const sectionTitles = {
    instruction: "Instruction",
    tasks: "Tasks",
    deliverable: "Deliverable",
    log: "Log"
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-lg border transition-all duration-200",
        "bg-[var(--terminal-dark)] border-white/10",
        isHovering && !readOnly && "border-[var(--atlas-light)] transform -translate-y-0.5",
        isEditing && "border-[var(--atlas-light)]"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Section Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b border-white/10",
        "font-mono text-sm uppercase text-[var(--cream)]/60"
      )}>
        <span>## {sectionTitles[section]}</span>
        {!readOnly && !isEditing && isHovering && (
          <span className="text-[var(--atlas-light)] text-xs">[E]</span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => {
                setLocalContent(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full resize-none outline-none",
                "bg-transparent text-[var(--cream)] font-mono text-sm",
                "placeholder-[var(--cream)]/30"
              )}
              placeholder={`Enter ${section} content...`}
            />
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono uppercase",
                    "bg-[var(--atlas-navy)] text-[var(--cream)]",
                    "hover:bg-[var(--atlas-light)] transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "flex items-center gap-2"
                  )}
                >
                  {isSaving ? (
                    <>
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "✓ Save"
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono uppercase",
                    "bg-transparent text-[var(--cream)]/60",
                    "hover:text-[var(--cream)] hover:bg-white/5 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  ✕ Cancel
                </button>
              </div>
              <span className="text-xs font-mono text-[var(--cream)]/40">
                Shift+Enter
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "prose prose-invert max-w-none",
              "prose-headings:font-mono prose-headings:uppercase",
              "prose-code:text-[var(--atlas-light)]",
              "prose-a:text-[var(--connection-teal)]",
              !localContent && "text-[var(--cream)]/30 italic"
            )}
            onClick={handleEdit}
          >
            {localContent ? (
              <ReactMarkdown>{localContent}</ReactMarkdown>
            ) : (
              <p>No {section} content yet. Click to add.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}