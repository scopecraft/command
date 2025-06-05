import { ScrollArea } from "@/components/ui/scroll-area"
import { TreeView, type TreeItem } from "@/components/ui/tree-view"

const relationships: TreeItem[] = [
  {
    id: "1",
    type: "goal",
    name: "Best story editor in the world",
    children: [
      {
        id: "2",
        type: "feature",
        name: "AI Editor",
        children: [
          {
            id: "3",
            type: "requirement",
            name: "editor must remember state of every pane on reload",
            children: [
              {
                id: "4",
                type: "screen",
                name: "DocumentEditor",
                children: [
                  {
                    id: "5",
                    type: "component",
                    name: "AI Panel",
                  },
                ],
              },
              {
                id: "6",
                type: "screen",
                name: "DocumentViewer",
              },
            ],
          },
        ],
      },
    ],
  },
]

export default function RelationshipTree() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <TreeView items={relationships} />
      </div>
    </ScrollArea>
  )
}
