"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Source {
  id: number
  url: string
  domain: string
  icon: string
}

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
  sources?: Source[]
}

const initialSources: Source[] = [
  { id: 1, url: "https://npmjs.com/redux", domain: "npmjs.com", icon: "N" },
  { id: 2, url: "https://github.com/pmndrs/zustand", domain: "github.com", icon: "G" },
  { id: 3, url: "https://recoiljs.org", domain: "recoiljs.org", icon: "R" },
  { id: 4, url: "https://mobx.js.org", domain: "mobx.js.org", icon: "M" },
  { id: 5, url: "https://jotai.org", domain: "jotai.org", icon: "J" },
]

const initialMessages: Message[] = [
  {
    id: 1,
    content: "How can I assist you with your ADR on state management libraries?",
    sender: "ai",
  },
  {
    id: 2,
    content: "Can you find usage stats for the popular state management libraries?",
    sender: "user",
  },
  {
    id: 3,
    content: `Based on recent sources, here are the usage statistics for popular state management libraries in React:

1. Redux: Used in approximately 50% of React projects
2. MobX: Used in about 15% of React projects
3. Recoil: Gaining popularity, used in roughly 8% of React projects
4. Zustand: Growing quickly, used in about 5% of React projects
5. Jotai: Newer but promising, used in approximately 3% of React projects

Please note that these figures are approximate and can vary based on the source and time of data collection.`,
    sender: "ai",
    sources: initialSources,
  },
]

function SourceBadges({ sources }: { sources: Source[] }) {
  const displayedSources = sources.slice(0, 4)
  const remainingCount = sources.length - displayedSources.length

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {displayedSources.map((source) => (
        <a
          key={source.id}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center"
        >
          <Badge
            variant="secondary"
            className="bg-muted hover:bg-muted/80 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
              {source.icon}
            </span>
            <span className="text-xs">{source.domain}</span>
            <span className="text-xs text-muted-foreground ml-1">{source.id}</span>
          </Badge>
        </a>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className="bg-muted cursor-default">
          <span className="text-xs text-muted-foreground">+{remainingCount}</span>
        </Badge>
      )}
    </div>
  )
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
    }

    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInputMessage("")

    setTimeout(() => {
      const newAIMessage: Message = {
        id: Date.now() + 1,
        content: "This is a simulated AI response to your message.",
        sender: "ai",
      }
      setMessages((prevMessages) => [...prevMessages, newAIMessage])
    }, 1000)
  }

  useEffect(() => {
    const scrollArea = document.querySelector(".scroll-area")
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [])

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow px-4 scroll-area">
        <div className="space-y-6 py-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 items-start">
              <Avatar className={`h-8 w-8 ${message.sender === "ai" ? "bg-muted" : "bg-primary/10"}`}>
                <AvatarFallback>{message.sender === "ai" ? "AI" : "US"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2.5 flex-1">
                <div className="text-sm text-muted-foreground">{message.content}</div>
                {message.sources && <SourceBadges sources={message.sources} />}
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-2">
        <form
          className="flex items-center space-x-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          <Textarea
            placeholder="Type your message..."
            className="flex-grow"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
