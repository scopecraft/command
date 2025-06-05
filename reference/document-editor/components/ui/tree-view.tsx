import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TreeItem {
  id: string
  type: string
  name: string
  children?: TreeItem[]
}

interface TreeViewProps {
  items: TreeItem[]
  className?: string
}

interface TreeViewItemProps {
  item: TreeItem
  depth?: number
  isLast?: boolean
}

function TreeViewItem({ item, depth = 0, isLast = false }: TreeViewItemProps) {
  return (
    <div className={`relative ${depth > 0 ? "ml-4" : ""}`}>
      {depth > 0 && (
        <>
          <span className="absolute top-0 left-[-16px] bottom-0 w-px bg-border" />
          <span className="absolute top-[12px] left-[-16px] w-[12px] h-px bg-border" />
        </>
      )}
      {isLast && depth > 0 && <span className="absolute top-[13px] left-[-16px] bottom-0 w-px bg-background" />}
      <div className="flex items-center gap-2 py-1">
        <Badge variant="outline" className="text-[11px] font-normal px-2 h-5">
          {item.type}
        </Badge>
        <span className="text-sm text-muted-foreground">{item.name}</span>
        <span className="text-[10px] text-muted-foreground/30">#{item.id}</span>
      </div>
      {item.children && (
        <div className="mt-1">
          {item.children.map((child, index) => (
            <TreeViewItem key={child.id} item={child} depth={depth + 1} isLast={index === item.children!.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ items, className }: TreeViewProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <TreeViewItem key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </div>
  )
}
