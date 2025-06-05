"use client"

import { useState, useCallback, useEffect } from "react"
import { DualUseMarkdown } from "./DualUseMarkdown"

interface MarkdownDocumentProps {
  initialContent: string
  onSave?: (content: string) => Promise<void>
}

interface Section {
  id: string
  title: string
  content: string
  level: number
}

export function MarkdownDocument({ initialContent, onSave }: MarkdownDocumentProps) {
  const [sections, setSections] = useState<Section[]>(parseMarkdown(initialContent))
  const [fullContent, setFullContent] = useState(initialContent)

  useEffect(() => {
    const newFullContent = sections
      .map((section) => `${"#".repeat(section.level)} ${section.title}\n\n${section.content}`)
      .join("\n\n")
    setFullContent(newFullContent)
  }, [sections])

  const handleSectionSave = useCallback(async (sectionId: string, newContent: string) => {
    setSections((prevSections) => {
      const updatedSections = prevSections.map((section) => {
        if (section.id === sectionId) {
          const firstLine = newContent.split("\n")[0]
          const headerMatch = firstLine.match(/^(#+)\s*(.+)/)
          return {
            ...section,
            level: headerMatch ? headerMatch[1].length : section.level,
            title: headerMatch ? headerMatch[2].trim() : firstLine.trim(),
            content: newContent.split("\n").slice(1).join("\n").trim(),
          }
        }
        return section
      })
      return updatedSections
    })
  }, [])

  const handleSectionEmpty = useCallback((sectionId: string) => {
    setSections((prevSections) => {
      if (prevSections.length === 1) {
        return prevSections
      }
      return prevSections.filter((section) => {
        if (section.id === sectionId) {
          const isEmpty = section.content.trim() === ""
          return !isEmpty
        }
        return true
      })
    })
  }, [])

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="mb-8 last:mb-0">
          <DualUseMarkdown
            key={section.id}
            initialContent={`${"#".repeat(section.level)} ${section.title}\n\n${section.content}`}
            onSave={(content) => handleSectionSave(section.id, content)}
            onEmpty={() => handleSectionEmpty(section.id)}
          />
        </div>
      ))}
    </div>
  )
}

function parseMarkdown(markdown: string): Section[] {
  const lines = markdown.split("\n")
  const sections: Section[] = []
  let currentSection: Section | null = null

  lines.forEach((line, index) => {
    const headerMatch = line.match(/^(#+)\s+(.+)/)
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        id: `section-${index}`,
        title: headerMatch[2].trim(),
        content: "",
        level: headerMatch[1].length,
      }
    } else if (currentSection) {
      currentSection.content += line + "\n"
    } else {
      currentSection = {
        id: `section-${index}`,
        title: "Section",
        content: line + "\n",
        level: 2,
      }
    }
  })

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections.map((section) => ({
    ...section,
    content: section.content.trim(),
  }))
}
