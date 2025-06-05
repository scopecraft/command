import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddSectionButtonProps {
  onClick: () => void
}

export function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <div className="flex justify-center my-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:border-primary focus:border-primary"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add new section</span>
      </Button>
    </div>
  )
}
