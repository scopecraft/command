"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Wand2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const stateManagementLibraries = [
  { id: "redux", label: "Redux" },
  { id: "mobx", label: "MobX" },
  { id: "recoil", label: "Recoil" },
  { id: "jotai", label: "Jotai" },
  { id: "zustand", label: "Zustand" },
]

const effortEstimations = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
  { id: "xlarge", label: "X-Large" },
]

type AgentStatus = {
  state: "waiting" | "generating" | "completed"
  message: string
}

const statusConfig: Record<AgentStatus["state"], { color: string; dotColor: string }> = {
  waiting: { color: "bg-muted", dotColor: "bg-muted-foreground" },
  generating: { color: "bg-yellow-100 dark:bg-yellow-900", dotColor: "bg-yellow-500" },
  completed: { color: "bg-green-100 dark:bg-green-900", dotColor: "bg-green-500" },
}

interface Question {
  id: number
  content: string
  type: "libraries" | "effort"
}

const questions: Question[] = [
  {
    id: 1,
    content: "Which state management libraries do you want to consider?",
    type: "libraries",
  },
  {
    id: 2,
    content: "What's your estimation of the effort required for this project?",
    type: "effort",
  },
]

interface AIGeneratedQuestionProps {
  isCollapsed: boolean
  onToggle: () => void
}

export default function AIGeneratedQuestion({ isCollapsed, onToggle }: AIGeneratedQuestionProps) {
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>([])
  const [selectedEffort, setSelectedEffort] = useState<string>("")
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    state: "waiting",
    message: "Waiting for input",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions[0])

  const simulateStatusChange = useCallback(() => {
    setAgentStatus({ state: "generating", message: "Processing..." })

    setTimeout(() => {
      setAgentStatus({ state: "completed", message: "Ready" })
      setIsSubmitting(false)
    }, 1000)
  }, [])

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true)
    simulateStatusChange()
  }, [simulateStatusChange])

  useEffect(() => {
    if (agentStatus.state === "completed") {
      const timer = setTimeout(() => {
        setAgentStatus({ state: "waiting", message: "Waiting for input" })
        setCurrentQuestion((prevQuestion) => (prevQuestion.id === 1 ? questions[1] : questions[0]))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [agentStatus])

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <Button variant="ghost" size="sm" onClick={onToggle}>
          Expand Questions
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow p-4">
        <Alert className="mb-4">
          <Wand2 className="h-4 w-4 mr-2" />
          <AlertDescription>The AI will refine the document based on your answers.</AlertDescription>
        </Alert>
        <div className="relative mb-4">
          <h3 className="text-lg font-semibold mb-2">{currentQuestion.content}</h3>
        </div>
        {currentQuestion.type === "libraries" ? (
          <div className="space-y-3 mb-4">
            {stateManagementLibraries.map((library) => (
              <div key={library.id} className="flex items-center space-x-3">
                <Checkbox
                  id={library.id}
                  checked={selectedLibraries.includes(library.id)}
                  onCheckedChange={(checked) => {
                    setSelectedLibraries((prev) =>
                      checked ? [...prev, library.id] : prev.filter((id) => id !== library.id),
                    )
                  }}
                />
                <label
                  htmlFor={library.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {library.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup value={selectedEffort} onValueChange={setSelectedEffort} className="flex flex-col space-y-2 mb-4">
            {effortEstimations.map((effort) => (
              <div key={effort.id} className="flex items-center space-x-3">
                <RadioGroupItem value={effort.id} id={effort.id} />
                <Label htmlFor={effort.id}>{effort.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <div className="flex justify-center mt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
        <Badge
          variant="secondary"
          className={`${
            statusConfig[agentStatus.state].color
          } absolute bottom-4 right-4 flex items-center gap-2.5 py-2 px-3 text-sm z-10`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[agentStatus.state].dotColor}`} />
          {agentStatus.message}
        </Badge>
      </ScrollArea>
    </div>
  )
}
