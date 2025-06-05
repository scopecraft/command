"use client"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AIChat from "./ai-chat"
import RelationshipTree from "./relationship-tree"

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("chat")

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {activeTab === "chat" ? (
        <div className="flex-1">
          <AIChat />
        </div>
      ) : (
        <div className="flex-1">
          <RelationshipTree />
        </div>
      )}
    </div>
  )
}
