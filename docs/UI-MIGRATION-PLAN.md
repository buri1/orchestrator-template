# UI Migration Plan: Overspark → ADWO-2

> **Status:** Ready for Implementation
> **Created:** 2026-02-01
> **Purpose:** Port sophisticated UI components from overspark to adwo-2 dashboard

---

## Executive Summary

The adwo-2 dashboard currently has a basic event stream working. The overspark project has a sophisticated 3-panel layout with virtualized lists, 8 message types, and advanced state management. This plan ports the best of overspark's UI to adwo-2.

**Current State (adwo-2):**
- Basic EventStreamPanel (no virtualization)
- Simple event-store + connection-store
- WebSocket working, events flowing
- Basic question/cost components

**Target State:**
- 3-panel resizable layout
- Virtualized event stream (@tanstack/react-virtual)
- O-Agent chat panel with 8 message types
- Advanced filtering and search
- Proper agent/cost panels

---

## Phase 1: Foundation - Stores & Types (Day 1)

### 1.1 Enhance Existing Stores

**Files to update:**
- `src/stores/event-store.ts` - Add filtering, search, deduplication
- `src/stores/connection-store.ts` - Add reconnection state machine

**New stores to create:**
- `src/stores/chat-store.ts` - O-Agent chat messages
- `src/stores/settings-store.ts` - User preferences (localStorage)

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/stores/`

### 1.2 Add Missing Types

**File:** `@adwo/shared` or `src/types/`

```typescript
// Message types for chat
export type MessageContentType =
  | "text"
  | "question"
  | "question_critical"
  | "diff"
  | "code"
  | "task_summary"
  | "agent_handoff"
  | "file_created"
  | "file_modified"
  | "thinking";

// Agent status for cards
export type AgentStatus = "idle" | "executing" | "paused" | "completed" | "failed";

// Extended event types
export interface ChatMessage {
  id: string;
  sender: "user" | "orchestrator" | "system";
  content: MessageContent;
  timestamp: string;
}
```

---

## Phase 2: Layout System (Day 1-2)

### 2.1 Install Dependencies

```bash
pnpm add react-resizable-panels @tanstack/react-virtual --filter @adwo/dashboard
```

### 2.2 Create 3-Panel Layout

**New files:**
```
src/components/layout/
├── DashboardLayout.tsx     # Main orchestrator with panels
├── LeftPanel.tsx           # Agent sidebar (collapsible)
├── CenterPanel.tsx         # Event stream (main view)
├── RightPanel.tsx          # O-Agent chat (collapsible)
└── index.ts
```

**Layout Structure:**
```
┌──────────────────────────────────────────────────────────┐
│ Header (status bar, connection indicator, cost summary)   │
├────────┬────────────────────────────────┬────────────────┤
│        │                                │                │
│ Left   │         Center                 │     Right      │
│ Panel  │         Panel                  │     Panel      │
│ (18%)  │         (62%)                  │     (20%)      │
│        │                                │                │
│ Agents │     Event Stream               │  O-Agent Chat  │
│        │     (virtualized)              │  (messages)    │
│        │                                │                │
├────────┴────────────────────────────────┴────────────────┤
│ Footer (optional: command bar)                           │
└──────────────────────────────────────────────────────────┘
```

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/layout/DashboardLayout.tsx`

---

## Phase 3: Virtualized Event Stream (Day 2)

### 3.1 Update EventStreamPanel

**Migrate:**
- Add `@tanstack/react-virtual` for virtualization
- Add filter toolbar (type filters, search)
- Add expandable event rows with JSON detail
- Add auto-follow with manual scroll detection

**Key patterns from overspark:**
```typescript
// Virtualization setup
const rowVirtualizer = useVirtualizer({
  count: filteredEvents.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 44,
  overscan: 10,
});

// Auto-follow with programmatic scroll detection
const isAutoScrollingRef = useRef(false);
virtualizer.scrollToIndex(events.length - 1, { align: "end" });
requestAnimationFrame(() => { isAutoScrollingRef.current = false });
```

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/events/event-stream.tsx`

---

## Phase 4: O-Agent Chat Panel (Day 2-3)

### 4.1 Create Chat Components

**New files:**
```
src/components/o-agent-chat/
├── OAgentChatPanel.tsx         # Main container
├── ChatHeader.tsx              # Status + controls
├── MessageList.tsx             # Auto-scroll container
├── MessageBubble.tsx           # Message type router
├── messages/
│   ├── TextMessage.tsx         # Plain text/markdown
│   ├── QuestionMessage.tsx     # With timeout + options
│   ├── CodeMessage.tsx         # Syntax highlighted
│   ├── DiffMessage.tsx         # Unified diffs
│   ├── TaskSummaryMessage.tsx  # Task checklist
│   ├── ThinkingMessage.tsx     # Animated dots
│   └── index.ts
└── index.ts
```

### 4.2 Message Type Routing

The `MessageBubble` component routes based on content type:

```typescript
function MessageBubble({ message }: { message: ChatMessage }) {
  const { content } = message;

  switch (content.type) {
    case "question":
    case "question_critical":
      return <QuestionMessage message={message} />;
    case "code":
      return <CodeMessage content={content} />;
    case "diff":
      return <DiffMessage content={content} />;
    case "task_summary":
      return <TaskSummaryMessage content={content} />;
    case "thinking":
      return <ThinkingMessage />;
    default:
      return <TextMessage content={content} />;
  }
}
```

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/o-agent-chat/`

---

## Phase 5: Agent Cards (Day 3)

### 5.1 Create Agent Components

**New files:**
```
src/components/agents/
├── AgentList.tsx           # Scrollable agent list
├── AgentCard.tsx           # Individual agent card
├── AgentStatusBadge.tsx    # Status indicator
└── index.ts
```

**Agent Card Features:**
- Status-based styling (executing = pulse animation)
- Context window usage bar
- Metrics (tool calls, files read/written)
- Model name + cost

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/agents/agent-card.tsx`

---

## Phase 6: Enhanced Cost Panel (Day 3)

### 6.1 Update Cost Components

**Enhance existing:**
- `src/components/cost/cost-panel.tsx` - Add expandable breakdown
- `src/components/cost/cost-indicator.tsx` - Add budget progress bar

**New components:**
```
src/components/cost/
├── budget-progress.tsx         # Progress bar with thresholds
├── agent-cost-breakdown.tsx    # Per-agent costs
├── model-cost-chart.tsx        # Model usage percentages
└── index.ts
```

**Reference:** `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/cost/`

---

## Phase 7: Integration (Day 4)

### 7.1 Update Main Page

Replace current page layout with DashboardLayout:

```typescript
// src/app/page.tsx
export default function Home() {
  return <DashboardLayout />;
}
```

### 7.2 Wire Up WebSocket

Ensure WebSocket messages route correctly:
- `event` → EventStore
- `question` → ChatStore + QuestionStore
- `chat_message` → ChatStore
- `cost_update` → CostStore
- `agent_update` → AgentStore (new)

### 7.3 Add Keyboard Shortcuts

**Hook:** `src/hooks/useKeyboardShortcuts.ts`

Shortcuts:
- `Cmd+1/2/3` - Focus panels
- `Cmd+E` - Toggle event filters
- `Cmd+/` - Focus command bar
- `Esc` - Close modals

---

## Files to Port (Priority Order)

### High Priority (Core UI)
| From Overspark | To ADWO-2 | Notes |
|----------------|-----------|-------|
| `components/layout/DashboardLayout.tsx` | `components/layout/DashboardLayout.tsx` | Adapt panel content |
| `components/events/event-stream.tsx` | `components/event-stream/event-stream-panel.tsx` | Add virtualization |
| `stores/event-store.ts` | `stores/event-store.ts` | Add filters, dedup |
| `stores/chat-store.ts` | `stores/chat-store.ts` | New |

### Medium Priority (Enhanced Features)
| From Overspark | To ADWO-2 | Notes |
|----------------|-----------|-------|
| `components/o-agent-chat/*` | `components/o-agent-chat/*` | New directory |
| `components/agents/agent-card.tsx` | `components/agents/agent-card.tsx` | New |
| `hooks/useKeyboardShortcuts.ts` | `hooks/useKeyboardShortcuts.ts` | New |

### Lower Priority (Polish)
| From Overspark | To ADWO-2 | Notes |
|----------------|-----------|-------|
| `components/cost/*` | `components/cost/*` | Enhance existing |
| Message type components | `components/o-agent-chat/messages/*` | New |

---

## Dependencies to Add

```bash
# Required for this migration
pnpm add react-resizable-panels @tanstack/react-virtual react-markdown remark-gfm --filter @adwo/dashboard
```

Already present in adwo-2:
- zustand
- @radix-ui/* (via shadcn)
- lucide-react
- tailwindcss
- clsx, tailwind-merge

---

## Estimated Effort

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Stores & Types | 2-3 hours | None |
| Phase 2: Layout System | 3-4 hours | Phase 1 |
| Phase 3: Virtualized Events | 2-3 hours | Phase 2 |
| Phase 4: O-Agent Chat | 4-5 hours | Phase 1, 2 |
| Phase 5: Agent Cards | 2-3 hours | Phase 1, 2 |
| Phase 6: Cost Panel | 1-2 hours | Phase 1 |
| Phase 7: Integration | 2-3 hours | All |

**Total:** ~16-23 hours of focused work

---

## Success Criteria

- [ ] 3-panel layout renders correctly with resizable panels
- [ ] Event stream uses virtualization (handles 1000+ events smoothly)
- [ ] Event filtering works (by type, by pane, by search)
- [ ] Chat panel displays messages with proper type routing
- [ ] Question messages show countdown timer
- [ ] Agent cards show status and metrics
- [ ] Cost panel shows breakdown with budget warnings
- [ ] Keyboard shortcuts work
- [ ] Auto-follow scroll works correctly
- [ ] WebSocket reconnection is robust

---

## Reference Paths

**Overspark (source):**
- `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/components/`
- `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/stores/`
- `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/hooks/`
- `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/src/types/`

**ADWO-2 (target):**
- `/Users/buraksmac/Desktop/code2/adwo-2/apps/dashboard/src/components/`
- `/Users/buraksmac/Desktop/code2/adwo-2/apps/dashboard/src/stores/`
- `/Users/buraksmac/Desktop/code2/adwo-2/apps/dashboard/src/hooks/`
