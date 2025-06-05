import { Keyboard } from "lucide-react"

interface KeyboardShortcutProps {
  keys: string[]
}

export function KeyboardShortcut({ keys }: KeyboardShortcutProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Keyboard className="h-3 w-3" />
      {keys.map((key, index) => (
        <span key={key} className="flex items-center">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="mx-1">+</span>}
        </span>
      ))}
    </div>
  )
}
