"use client"

import { useState, useRef, useCallback } from "react"
import { Panel, PanelGroup } from "react-resizable-panels"
import DocumentContent from "@/components/document-content"
import AIAssistant from "@/components/ai-assistant"
import AIGeneratedQuestion from "@/components/ai-generated-question"
import SourceManagement from "@/components/source-management"
import ResizeHandle from "@/components/panel-resize-handle"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { mockAiAction } from "@/utils/mockAiAction"

export default function DocumentEditor() {
  const [isQuestionCollapsed, setIsQuestionCollapsed] = useState(false)
  const [isSourcesCollapsed, setIsSourcesCollapsed] = useState(false)
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false)

  const questionPanelRef = useRef<Panel>(null)
  const sourcesPanelRef = useRef<Panel>(null)
  const rightPanelRef = useRef<Panel>(null)

  const toggleQuestion = () => {
    if (questionPanelRef.current) {
      if (isQuestionCollapsed) {
        questionPanelRef.current.expand()
      } else {
        questionPanelRef.current.collapse()
      }
      setIsQuestionCollapsed(!isQuestionCollapsed)
    }
  }

  const toggleSources = () => {
    if (sourcesPanelRef.current) {
      if (isSourcesCollapsed) {
        sourcesPanelRef.current.expand()
      } else {
        sourcesPanelRef.current.collapse()
      }
      setIsSourcesCollapsed(!isSourcesCollapsed)
    }
  }

  const toggleRightPane = () => {
    if (rightPanelRef.current) {
      if (isRightPaneCollapsed) {
        rightPanelRef.current.expand()
      } else {
        rightPanelRef.current.collapse()
      }
      setIsRightPaneCollapsed(!isRightPaneCollapsed)
    }
  }

  const handleToneChange = useCallback(async (tone: string) => {
    console.log("Changing document tone to:", tone)
    await mockAiAction("document", `change tone to ${tone}`)
  }, [])

  const handleImprove = useCallback(async () => {
    console.log("Improving document")
    await mockAiAction("document", "improve")
  }, [])

  const handleDiagram = useCallback(async () => {
    console.log("Generating diagram")
    await mockAiAction("document", "generate diagram")
  }, [])

  const handleExtract = useCallback(async () => {
    console.log("Extracting knowledge")
    await mockAiAction("document", "extract knowledge")
  }, [])

  return (
    <>
      <CommandMenu
        onToneChange={handleToneChange}
        onImprove={handleImprove}
        onDiagram={handleDiagram}
        onExtract={handleExtract}
      />
      <div className="h-screen w-full">
        <PanelGroup direction="horizontal">
          {/* Left Pane: Document and Sources */}
          <Panel defaultSize={65} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Document Content */}
              <Panel defaultSize={85}>
                <DocumentContent />
              </Panel>

              <ResizeHandle orientation="horizontal" />

              {/* Sources */}
              <Panel
                ref={sourcesPanelRef}
                defaultSize={15}
                collapsible={true}
                collapsedSize={5}
                onCollapse={() => setIsSourcesCollapsed(true)}
                onExpand={() => setIsSourcesCollapsed(false)}
              >
                <SourceManagement isCollapsed={isSourcesCollapsed} onToggle={toggleSources} />
              </Panel>
            </PanelGroup>
          </Panel>

          <ResizeHandle orientation="vertical" />

          {/* Right Pane: AI Assistant and Questions */}
          <Panel
            ref={rightPanelRef}
            defaultSize={35}
            minSize={5}
            collapsible={true}
            collapsedSize={5}
            onCollapse={() => setIsRightPaneCollapsed(true)}
            onExpand={() => setIsRightPaneCollapsed(false)}
          >
            <div className="h-full flex flex-col">
              <div className="p-2 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">AI</h2>
                <Button variant="ghost" size="sm" className="w-9 p-0" onClick={toggleRightPane}>
                  {isRightPaneCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
              {!isRightPaneCollapsed && (
                <div className="flex-1">
                  <PanelGroup direction="vertical">
                    {/* AI Assistant */}
                    <Panel defaultSize={65}>
                      <div className="h-full">
                        <AIAssistant />
                      </div>
                    </Panel>

                    <ResizeHandle orientation="horizontal" />

                    {/* Questions */}
                    <Panel
                      ref={questionPanelRef}
                      defaultSize={35}
                      collapsible={true}
                      collapsedSize={10}
                      onCollapse={() => setIsQuestionCollapsed(true)}
                      onExpand={() => setIsQuestionCollapsed(false)}
                    >
                      <AIGeneratedQuestion isCollapsed={isQuestionCollapsed} onToggle={toggleQuestion} />
                    </Panel>
                  </PanelGroup>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </>
  )
}
