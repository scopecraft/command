import { PanelResizeHandle } from "react-resizable-panels"

interface ResizeHandleProps {
  className?: string
  orientation?: "horizontal" | "vertical"
}

export default function ResizeHandle({ className = "", orientation = "horizontal" }: ResizeHandleProps) {
  return (
    <PanelResizeHandle className={className}>
      {orientation === "horizontal" ? (
        <div className="group relative h-0.5 w-full cursor-row-resize">
          <div className="absolute inset-y-0 left-0 w-full bg-border group-hover:bg-primary/20 group-data-[dragging]:bg-primary/20 transition-colors" />
        </div>
      ) : (
        <div className="group relative h-full w-0.5 cursor-col-resize">
          <div className="absolute inset-0 h-full bg-border group-hover:bg-primary/20 group-data-[dragging]:bg-primary/20 transition-colors" />
        </div>
      )}
    </PanelResizeHandle>
  )
}
