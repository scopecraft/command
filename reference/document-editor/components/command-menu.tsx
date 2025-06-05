"use client"

import * as React from "react"
import { MessageSquare, Wand2, GitBranch, ExternalLink, Settings, User, CreditCard } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface CommandMenuProps {
  onToneChange: (tone: string) => void
  onImprove: () => void
  onDiagram: () => void
  onExtract: () => void
}

const tones = [
  { label: "Concise", value: "concise" },
  { label: "Formal", value: "formal" },
  { label: "Funny", value: "funny" },
  { label: "Engaging", value: "engaging" },
  { label: "Technical", value: "technical" },
  { label: "Casual", value: "casual" },
]

export function CommandMenu({ onToneChange, onImprove, onDiagram, onExtract }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="AI Actions">
          <CommandGroup heading="Change Tone">
            {tones.map((tone) => (
              <CommandItem
                key={tone.value}
                onSelect={() => {
                  onToneChange(tone.value)
                  setOpen(false)
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {tone.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandItem
            onSelect={() => {
              onImprove()
              setOpen(false)
            }}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Improve Document
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onDiagram()
              setOpen(false)
            }}
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Generate Diagram
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onExtract()
              setOpen(false)
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Extract Knowledge
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
