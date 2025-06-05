"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownDocument } from "@/components/MarkdownDocument"

const initialContent = `
# ADR: Implementing the Block‑Based Editor with XState

**Status:** Accepted  
**Date:** February 18, 2025

## Context

We are building a modern, block‑based Markdown editor where each block (e.g., text, diagram, image) can operate in several modes (view, edit, diff, asynchronous AI processing, etc.), while the document itself has a global state (view, edit, saving, diff mode). Key challenges include:
  
- **Granular Control:** Each block needs to maintain its own state independently.
- **Complex Transitions:** Global actions (like diff mode) must coordinate with per‑block state.
- **Asynchronous Actions:** Integration with AI services (tone change, diagram generation) requires clear handling of asynchronous transitions.
- **Predictability:** As the editor grows in complexity, we require a model that makes state transitions explicit, debuggable, and maintainable.

## Decision

We will use **XState** as our state management solution to model both the document‑level and block‑level states. This decision is driven by the need to:

- **Explicitly Model States & Transitions:** XState allows us to define both global (document) and local (block) state machines with clear, declarative transitions.
- **Parallel State Management:** With XState's support for parallel states, we can run document‑level state and individual block machines concurrently.
- **Asynchronous Handling:** XState's built‑in support for invoked services and transitions based on promise resolution (or failure) fits our need to handle asynchronous AI actions.
- **Visual Debugging:** XState's visualizer enables the team to interactively view and debug the state machines, reducing integration issues.

### Implementation Approach

1. **Document Machine:**  
   Create a state machine (or parallel machine) that governs the global document state. It will include states such as:
   - \`view\`
   - \`edit\`
   - \`saving\`
   - \`diff\`

2. **Block Machine:**  
   Define a separate state machine for each block. Each block machine will handle states like:
   - \`view\`
   - \`edit\`
   - \`processingTone\` (for AI tone change)
   - \`processingDiagram\` (for generating a diagram)
   - \`diff\`
  
   These machines can be spawned as actors when a new block is created.

3. **Parallel State Configuration:**  
   Use XState's parallel state features to run both the document machine and block machines concurrently. This design ensures that global state changes (e.g., switching the document to diff mode) can signal all block machines to transition into a corresponding state.

4. **Custom Actions & Guards:**  
   Within the block machines, register events (like \`TONE_CHANGE\` and \`GENERATE_DIAGRAM\`) along with guards (conditions based on block type) to ensure that only applicable actions are processed.

5. **Integration & Services:**  
   Integrate asynchronous services (AI calls, diagram generation) within the block machine as invoked services. When the service resolves, update the block's context with the new content and transition back to the editing state.

## Alternatives Considered

- **General-purpose State Libraries (Redux, Zustand, Recoil):**  
  While these libraries are excellent for sharing global state, they lack a native mechanism to explicitly model state transitions and asynchronous side effects. This could lead to scattered logic and harder-to-debug flows.

- **Form Libraries (React Hook Form):**  
  These libraries are optimized for managing form input states and validations. They don't natively support complex state transitions (such as diff mode or asynchronous AI actions) and therefore wouldn't be a good fit for our use case.

- **Custom State Management:**  
  Building a bespoke state management solution was considered; however, it would likely lack the declarative clarity and visual debugging tools that XState provides.

## Consequences

- **Pros:**  
  - Clear, explicit modeling of both document and block states.
  - Simplified debugging and maintenance using the XState Visualizer.
  - Natural handling of asynchronous actions through invoked services.
  - Modular design, allowing individual blocks to be managed as separate actors.

- **Cons:**  
  - Increased initial complexity and learning curve for developers unfamiliar with state machines.
  - Potential overhead in configuring and coordinating multiple parallel machines, which may require careful planning.

## Conclusion

Using XState to manage both document-level and block-level states provides a robust, scalable, and maintainable solution for our block-based editor. This approach enables clear state transitions, effective asynchronous handling, and a modular architecture that is well-suited for our complex UI interactions.

*This ADR documents the rationale and planned implementation approach, and will serve as a reference point as we build and iterate on the editor.*
`.trim()

export default function DocumentContent() {
  const [content, setContent] = useState(initialContent)

  const handleSave = async (newContent: string) => {
    console.log("Saving document content:", newContent)
    setContent(newContent)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Document content saved successfully")
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="p-4">
          <MarkdownDocument initialContent={content} onSave={handleSave} />
        </div>
      </ScrollArea>
    </div>
  )
}
