"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Github, Cloud, ChevronUp, ChevronDown, File, FileText, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Document {
  id: number
  name: string
  source: string
  icon: typeof File | typeof FileText
}

const initialDocuments: Document[] = [
  { id: 1, name: "Project Proposal.docx", source: "local", icon: FileText },
  { id: 2, name: "Meeting Notes.md", source: "github", icon: File },
  { id: 3, name: "Budget.xlsx", source: "drive", icon: FileText },
]

interface SourceManagementProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function SourceManagement({ isCollapsed, onToggle }: SourceManagementProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [hoveredDocument, setHoveredDocument] = useState<number | null>(null)

  const removeDocument = (id: number) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const addDocument = (source: string) => {
    const newDoc: Document = {
      id: Date.now(),
      name: `New Document ${documents.length + 1}.${source === "github" ? "md" : "docx"}`,
      source,
      icon: source === "github" ? File : FileText,
    }
    setDocuments([...documents, newDoc])
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center gap-2">
        <div className="flex items-center gap-2 mr-auto">
          <h2 className="text-lg font-semibold">Sources</h2>
          <Badge variant="secondary" className="text-xs font-normal">
            {documents.length}
          </Badge>
        </div>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => addDocument("local")}>
          <Upload className="w-4 h-4" />
          <span className="sr-only">Upload</span>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => addDocument("drive")}>
          <Cloud className="w-4 h-4" />
          <span className="sr-only">Drive</span>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => addDocument("github")}>
          <Github className="w-4 h-4" />
          <span className="sr-only">GitHub</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggle}>
          {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {!isCollapsed && (
        <ScrollArea className="flex-grow">
          <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="relative group"
                onMouseEnter={() => setHoveredDocument(doc.id)}
                onMouseLeave={() => setHoveredDocument(null)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  <doc.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{doc.name}</span>
                  {doc.source === "github" && <Github className="w-4 h-4 ml-auto flex-shrink-0" />}
                  {doc.source === "drive" && <Cloud className="w-4 h-4 ml-auto flex-shrink-0" />}
                </Button>
                {hoveredDocument === doc.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
