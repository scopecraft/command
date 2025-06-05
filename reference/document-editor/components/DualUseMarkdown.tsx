"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Edit,
  Wand2,
  GitBranch,
  MessageSquare,
  ChevronDown,
  Settings2,
  Loader2,
  Save,
  ExternalLink,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { KeyboardShortcut } from "./keyboard-shortcut"
import { mockAiAction } from "@/utils/mockAiAction"
import { TreeView } from "@/components/ui/tree-view"

interface DualUseMarkdownProps {
  initialContent: string
  onSave?: (content: string) => Promise<void>
  onEmpty?: () => void
}

const TONE_OPTIONS = [
  { label: "Concise", value: "concise" },
  { label: "Formal", value: "formal" },
  { label: "Funny", value: "funny" },
  { label: "Engaging", value: "engaging" },
  { label: "Technical", value: "technical" },
  { label: "Casual", value: "casual" },
]

interface ExtractedItem {
  id: string
  type: string
  name: string
  children?: ExtractedItem[]
}

export function DualUseMarkdown({ initialContent, onSave, onEmpty }: DualUseMarkdownProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [improveInstructions, setImproveInstructions] = useState("")
  const [diagramInstructions, setDiagramInstructions] = useState("")
  const [selectedTone, setSelectedTone] = useState<(typeof TONE_OPTIONS)[0] | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [improvePopoverOpen, setImprovePopoverOpen] = useState(false)
  const [diagramPopoverOpen, setDiagramPopoverOpen] = useState(false)
  const [extractPopoverOpen, setExtractPopoverOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const actionPaneTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleEdit = useCallback(() => {
    if (!isProcessing) {
      setIsEditing((prev) => !prev)
      setIsSelected(true)
    }
  }, [isProcessing])

  const handleSave = useCallback(async () => {
    if (isProcessing || !onSave) return

    setIsProcessing(true)
    setProcessingAction("Saving")

    try {
      await onSave(content)
      setIsEditing(false)
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setIsProcessing(false)
      setProcessingAction(null)
    }
  }, [content, isProcessing, onSave])

  const handleAiAction = useCallback(
    async (action: () => Promise<string>) => {
      if (isProcessing || isEditing) return

      setIsProcessing(true)
      setProcessingAction(action.name)

      try {
        const result = await action()
        setContent(result)
      } catch (error) {
        console.error("AI action failed:", error)
      } finally {
        setIsProcessing(false)
        setProcessingAction(null)
      }
    },
    [isProcessing, isEditing],
  )

  const handleImprove = useCallback(() => {
    handleAiAction(async () => {
      return await mockAiAction(content, "improve")
    }).then(() => {
      setImprovePopoverOpen(false)
    })
  }, [content, improveInstructions, handleAiAction])

  const handleGenerateDiagram = useCallback(() => {
    handleAiAction(async () => {
      return await mockAiAction(content, "generate diagram")
    }).then(() => {
      setDiagramPopoverOpen(false)
    })
  }, [content, diagramInstructions, handleAiAction])

  const handleToneChange = useCallback(
    (tone: (typeof TONE_OPTIONS)[0] | null) => {
      setSelectedTone(tone)
      handleAiAction(async () => {
        return await mockAiAction(content, `change tone to ${tone?.value ?? "default"}`)
      })
    },
    [content, handleAiAction],
  )

  const handleExtract = useCallback(() => {
    setIsExtracting(true)
    setTimeout(() => {
      setExtractedItems([
        {
          id: "1",
          type: "requirement",
          name: "client side state management",
          children: [
            {
              id: "2",
              type: "decision",
              name: "Zustand",
            },
          ],
        },
      ])
      setIsExtracting(false)
    }, 1500)
  }, [])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave],
  )

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (actionPaneTimeoutRef.current) {
      clearTimeout(actionPaneTimeoutRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    actionPaneTimeoutRef.current = setTimeout(() => {
      setIsHovering(false)
    }, 300)
  }

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isHovering && !isEditing && e.key.toLowerCase() === "e" && document.activeElement === document.body) {
        e.preventDefault()
        handleEdit()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [isHovering, isEditing, handleEdit])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsSelected(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (content.trim() === "" && onEmpty) {
      onEmpty()
    }
  }, [content, onEmpty])

  useEffect(() => {
    return () => {
      if (actionPaneTimeoutRef.current) {
        clearTimeout(actionPaneTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Card
      className={`w-full mx-auto relative group transition-all duration-200 ease-in-out pb-10
        ${isHovering || isSelected ? "border-primary" : "border-border"}
        print:border-none print:shadow-none`}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsSelected(true)}
    >
      {!isEditing && (isHovering || isSelected) && (
        <div className="absolute top-2 right-2 z-10 print:hidden">
          <KeyboardShortcut keys={["E"]} />
        </div>
      )}
      <CardContent className="p-0 flex flex-col">
        <div className="p-4">
          {isEditing ? (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pb-8"
                style={{ height: "auto", minHeight: "200px" }}
                rows={content.split("\n").length}
              />
              <div className="absolute bottom-2 right-2 print:hidden">
                <KeyboardShortcut keys={["Shift", "Enter"]} />
              </div>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {(isHovering || isSelected || isEditing) && (
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center gap-1 border-t p-2 print:hidden transition-opacity duration-200 ease-in-out bg-background"
            style={{ opacity: isHovering || isSelected || isEditing ? 1 : 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={isEditing ? handleSave : handleEdit}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-foreground"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || isEditing}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {selectedTone ? selectedTone.label : "Tone"}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {TONE_OPTIONS.map((tone) => (
                  <DropdownMenuItem key={tone.value} onClick={() => handleToneChange(tone)}>
                    {tone.label}
                  </DropdownMenuItem>
                ))}
                {selectedTone && (
                  <DropdownMenuItem onClick={() => handleToneChange(null)} className="text-muted-foreground">
                    Clear tone
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover open={improvePopoverOpen} onOpenChange={setImprovePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || isEditing}
                  className="text-muted-foreground hover:text-foreground group"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Improve
                  <Settings2 className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="improve-instructions">Additional Instructions</Label>
                    <Textarea
                      id="improve-instructions"
                      placeholder="E.g., Focus on technical accuracy, Add more examples..."
                      value={improveInstructions}
                      onChange={(e) => setImproveInstructions(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={handleImprove} disabled={isProcessing || isEditing}>
                    Apply Improvements
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={diagramPopoverOpen} onOpenChange={setDiagramPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || isEditing}
                  className="text-muted-foreground hover:text-foreground group"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Diagram
                  <Settings2 className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagram-instructions">Diagram Instructions</Label>
                    <Textarea
                      id="diagram-instructions"
                      placeholder="E.g., Use flowchart, Focus on system architecture..."
                      value={diagramInstructions}
                      onChange={(e) => setDiagramInstructions(e.target.value)}
                    />
                  </div>
                  <Button size="sm" onClick={handleGenerateDiagram} disabled={isProcessing || isEditing}>
                    Generate Diagram
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={extractPopoverOpen} onOpenChange={setExtractPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing || isEditing}
                  className="text-muted-foreground hover:text-foreground group"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Extract
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  {isExtracting ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Extracting...</span>
                    </div>
                  ) : extractedItems.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium">Found items to add:</div>
                      <TreeView items={extractedItems} />
                      <Button size="sm" className="w-full" onClick={() => setExtractPopoverOpen(false)}>
                        Add to Knowledge Graph
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={handleExtract} disabled={isProcessing || isEditing}>
                      Start Extraction
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {isProcessing && (
              <div className="ml-auto flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  {processingAction === "Saving" ? "Saving..." : "Processing..."}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
