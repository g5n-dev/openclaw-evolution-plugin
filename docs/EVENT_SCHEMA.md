# OpenClaw Evolution Plugin - 事件模式文档

## 版本: 0.1.0
## 最后更新: 2026-03-10

---

## 事件架构概览

OpenClaw Evolution Plugin 使用事件驱动架构。事件从 OpenClaw 运行时流向插件运行时，再到进化服务，驱动整个进化闭环。

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Event Flow                                    │
│                                                                        │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────┐     │
│  │   OpenClaw   │─────▶│   Plugin     │─────▶│   Evolution      │     │
│  │   Runtime    │      │   Runtime    │      │   Service        │     │
│  └──────────────┘      └──────────────┘      └──────────────────┘     │
│                                │                        │              │
│                                │                        ▼              │
│                                │              ┌──────────────────┐     │
│                                │              │  Trigger Engine  │     │
│                                │              └──────────────────┘     │
│                                │                        │              │
│                                │                        ▼              │
│                                │              ┌──────────────────┐     │
│                                │              │  Avatar System   │     │
│                                │              └──────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 事件分类

### 1. 运行时事件 (Runtime Events)

从 OpenClaw 主机运行时产生的原始事件。

### 2. 进化事件 (Evolution Events)

由进化服务触发的内部事件。

### 3. Avatar 事件 (Avatar Events)

由 OpenClaw Evolution System 产生的视觉状态事件。

### 4. 系统事件 (System Events)

插件和服务级别的管理事件。

---

## 运行时事件 (Runtime Events)

### user_message

用户发送消息到对话时触发。

```typescript
interface UserMessageEvent {
  id: string
  type: 'user_message'
  timestamp: Date
  sessionId: string
  data: {
    content: string
    messageId: string
    context?: {
      previousMessages?: number
      topic?: string
    }
  }
}
```

**示例:**
```json
{
  "id": "evt_1",
  "type": "user_message",
  "timestamp": "2026-03-10T10:30:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "content": "帮我创建一个 TypeScript 接口",
    "messageId": "msg_user_001",
    "context": {
      "previousMessages": 5,
      "topic": "programming"
    }
  }
}
```

### assistant_response

AI 助手生成响应时触发。

```typescript
interface AssistantResponseEvent {
  id: string
  type: 'assistant_response'
  timestamp: Date
  sessionId: string
  data: {
    content: string
    responseId: string
    model: string
    tokensUsed: {
      prompt: number
      completion: number
      total: number
    }
    finishReason: 'stop' | 'length' | 'content_filter'
    metadata?: {
      reasoning?: string
      confidence?: number
    }
  }
}
```

**示例:**
```json
{
  "id": "evt_2",
  "type": "assistant_response",
  "timestamp": "2026-03-10T10:30:05Z",
  "sessionId": "sess_abc123",
  "data": {
    "content": "这是一个 TypeScript 接口示例...",
    "responseId": "msg_assistant_001",
    "model": "claude-sonnet-4-6",
    "tokensUsed": {
      "prompt": 150,
      "completion": 200,
      "total": 350
    },
    "finishReason": "stop",
    "metadata": {
      "confidence": 0.95
    }
  }
}
```

### tool_call

AI 助手调用工具时触发。

```typescript
interface ToolCallEvent {
  id: string
  type: 'tool_call'
  timestamp: Date
  sessionId: string
  data: {
    toolName: string
    toolId: string
    parameters: Record<string, unknown>
    callId: string
    context?: {
      reason?: string
      relatedMessage?: string
    }
  }
}
```

**示例:**
```json
{
  "id": "evt_3",
  "type": "tool_call",
  "timestamp": "2026-03-10T10:30:10Z",
  "sessionId": "sess_abc123",
  "data": {
    "toolName": "Bash",
    "toolId": "builtin_bash",
    "parameters": {
      "command": "npm test"
    },
    "callId": "call_001",
    "context": {
      "reason": "运行测试套件"
    }
  }
}
```

### tool_result

工具调用返回结果时触发。

```typescript
interface ToolResultEvent {
  id: string
  type: 'tool_result'
  timestamp: Date
  sessionId: string
  data: {
    toolName: string
    callId: string
    result: {
      success: boolean
      data?: unknown
      error?: string
      output?: string
    }
    executionTime: number
  }
}
```

**示例:**
```json
{
  "id": "evt_4",
  "type": "tool_result",
  "timestamp": "2026-03-10T10:30:15Z",
  "sessionId": "sess_abc123",
  "data": {
    "toolName": "Bash",
    "callId": "call_001",
    "result": {
      "success": true,
      "output": "PASS: All tests passed\n14 tests completed"
    },
    "executionTime": 2500
  }
}
```

### feedback

用户提供反馈时触发（显式反馈）。

```typescript
interface FeedbackEvent {
  id: string
  type: 'feedback'
  timestamp: Date
  sessionId: string
  data: {
    feedbackType: 'positive' | 'negative' | 'neutral'
    targetId: string  // responseId 或 messageId
    targetType: 'response' | 'action' | 'suggestion'
    content?: string
    rating?: number
    metadata?: Record<string, unknown>
  }
}
```

**示例:**
```json
{
  "id": "evt_5",
  "type": "feedback",
  "timestamp": "2026-03-10T10:31:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "feedbackType": "positive",
    "targetId": "msg_assistant_001",
    "targetType": "response",
    "content": "非常有帮助，谢谢！",
    "rating": 5
  }
}
```

### correction

用户纠正 AI 助手时触发。

```typescript
interface CorrectionEvent {
  id: string
  type: 'correction'
  timestamp: Date
  sessionId: string
  data: {
    targetId: string
    originalContent: string
    correctedContent: string
    correctionType: 'factual' | 'code' | 'approach' | 'style'
    reason?: string
  }
}
```

**示例:**
```json
{
  "id": "evt_6",
  "type": "correction",
  "timestamp": "2026-03-10T10:32:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "targetId": "msg_assistant_001",
    "originalContent": "使用 var 声明变量",
    "correctedContent": "使用 const 或 let 声明变量",
    "correctionType": "code",
    "reason": "var 已经过时，不再推荐使用"
  }
}
```

### session_end

会话结束时触发。

```typescript
interface SessionEndEvent {
  id: string
  type: 'session_end'
  timestamp: Date
  sessionId: string
  data: {
    duration: number
    messageCount: number
    toolCallCount: number
    summary?: {
      topics?: string[]
      completedTasks?: number
      userSatisfaction?: number
    }
  }
}
```

**示例:**
```json
{
  "id": "evt_7",
  "type": "session_end",
  "timestamp": "2026-03-10T11:00:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "duration": 1800000,
    "messageCount": 24,
    "toolCallCount": 8,
    "summary": {
      "topics": ["programming", "typescript", "testing"],
      "completedTasks": 3,
      "userSatisfaction": 5
    }
  }
}
```

---

## 进化事件 (Evolution Events)

### candidate_detected

触发引擎检测到候选改进时触发。

```typescript
interface CandidateDetectedEvent {
  id: string
  type: 'candidate_detected'
  timestamp: Date
  sessionId: string
  data: {
    candidateId: string
    candidateType: 'skill' | 'rule' | 'memory'
    source: 'pattern' | 'feedback' | 'correction' | 'discovery'
    triggerEvent: string
    confidence: number
    summary: string
  }
}
```

**示例:**
```json
{
  "id": "evt_8",
  "type": "candidate_detected",
  "timestamp": "2026-03-10T10:35:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "candidateId": "cand_001",
    "candidateType": "skill",
    "source": "correction",
    "triggerEvent": "evt_6",
    "confidence": 0.85,
    "summary": "用户纠正: 应使用 const/let 而非 var"
  }
}
```

### evaluation_started

开始评估候选改进时触发。

```typescript
interface EvaluationStartedEvent {
  id: string
  type: 'evaluation_started'
  timestamp: Date
  sessionId: string
  data: {
    candidateId: string
    evaluationId: string
    evaluationType: 'automated' | 'manual' | 'hybrid'
    tests: string[]
  }
}
```

### evaluation_passed

评估通过时触发。

```typescript
interface EvaluationPassedEvent {
  id: string
  type: 'evaluation_passed'
  timestamp: Date
  sessionId: string
  data: {
    candidateId: string
    evaluationId: string
    score: number
    results: TestResult[]
    recommendations?: string[]
  }
}
```

### evaluation_failed

评估失败时触发。

```typescript
interface EvaluationFailedEvent {
  id: string
  type: 'evaluation_failed'
  timestamp: Date
  sessionId: string
  data: {
    candidateId: string
    evaluationId: string
    failureReason: string
    failedTests: TestResult[]
    suggestions?: string[]
  }
}
```

### skill_promoted

技能被提升到注册表时触发。

```typescript
interface SkillPromotedEvent {
  id: string
  type: 'skill_promoted'
  timestamp: Date
  sessionId: string
  data: {
    skillId: string
    candidateId: string
    skillType: 'skill' | 'rule' | 'memory'
    name: string
    version: number
    confidence: number
    cardId?: string
  }
}
```

**示例:**
```json
{
  "id": "evt_9",
  "type": "skill_promoted",
  "timestamp": "2026-03-10T10:40:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "skillId": "skill_001",
    "candidateId": "cand_001",
    "skillType": "rule",
    "name": "prefer-const-over-var",
    "version": 1,
    "confidence": 0.85,
    "cardId": "card_001"
  }
}
```

### skill_rolled_back

技能被回滚时触发。

```typescript
interface SkillRolledBackEvent {
  id: string
  type: 'skill_rolled_back'
  timestamp: Date
  sessionId: string
  data: {
    skillId: string
    fromVersion: number
    toVersion: number
    reason: string
    rollbackBy?: string
  }
}
```

### memory_saved

记忆被保存时触发。

```typescript
interface MemorySavedEvent {
  id: string
  type: 'memory_saved'
  timestamp: Date
  sessionId: string
  data: {
    memoryId: string
    memoryType: 'user_preference' | 'project_context' | 'pattern' | 'knowledge'
    content: unknown
    importance: 'low' | 'medium' | 'high'
    expiresAt?: Date
  }
}
```

### card_presented

进化卡片被展示时触发。

```typescript
interface CardPresentedEvent {
  id: string
  type: 'card_presented'
  timestamp: Date
  sessionId: string
  data: {
    cardId: string
    cardType: CardType
    candidateId: string
    renderingMode: 'inline' | 'sidebar' | 'console' | 'external'
    urgency: 'low' | 'medium' | 'high'
  }
}
```

### card_decision

用户对进化卡片做出决策时触发。

```typescript
interface CardDecisionEvent {
  id: string
  type: 'card_decision'
  timestamp: Date
  sessionId: string
  data: {
    cardId: string
    decision: 'approve' | 'reject' | 'defer'
    notes?: string
    decisionTime: number
    followedByAction?: boolean
  }
}
```

---

## Avatar 事件 (Avatar Events)

### avatar_initialized

Avatar 初始化时触发。

```typescript
interface AvatarInitializedEvent {
  id: string
  type: 'avatar_initialized'
  timestamp: Date
  sessionId: string
  data: {
    avatarId: string
    initialStage: 'base'
    configuration: AvatarConfig
  }
}
```

**示例:**
```json
{
  "id": "evt_avatar_1",
  "type": "avatar_initialized",
  "timestamp": "2026-03-10T09:00:00Z",
  "sessionId": "sess_init",
  "data": {
    "avatarId": "avatar_001",
    "initialStage": "base",
    "configuration": {
      "theme": "dark",
      "animationSpeed": "normal",
      "enableParticles": true
    }
  }
}
```

### avatar_stage_changed

Avatar 阶段变化时触发。

```typescript
interface AvatarStageChangedEvent {
  id: string
  type: 'avatar_stage_changed'
  timestamp: Date
  sessionId: string
  data: {
    avatarId: string
    fromStage: AvatarStage
    toStage: AvatarStage
    triggerEvent: string
    transitionType: 'promotion' | 'demotion'
    mutations: string[]
  }
}
```

**示例:**
```json
{
  "id": "evt_avatar_2",
  "type": "avatar_stage_changed",
  "timestamp": "2026-03-10T10:40:00Z",
  "sessionId": "sess_abc123",
  "data": {
    "avatarId": "avatar_001",
    "fromStage": "learned",
    "toStage": "evolved",
    "triggerEvent": "evt_9",
    "transitionType": "promotion",
    "mutations": ["shell_glow", "node_expand", "badge_attach"]
  }
}
```

### animation_triggered

动画触发时触发。

```typescript
interface AnimationTriggeredEvent {
  id: string
  type: 'animation_triggered'
  timestamp: Date
  sessionId: string
  data: {
    avatarId: string
    animationType: AnimationType
    stage: AvatarStage
    intensity: 'low' | 'medium' | 'high'
    duration: number
    metadata?: Record<string, unknown>
  }
}
```

**示例:**
```json
{
  "id": "evt_anim_1",
  "type": "animation_triggered",
  "timestamp": "2026-03-10T10:40:01Z",
  "sessionId": "sess_abc123",
  "data": {
    "avatarId": "avatar_001",
    "animationType": "activation",
    "stage": "evolved",
    "intensity": "high",
    "duration": 2000,
    "metadata": {
      "color": "#00ff88",
      "particles": true
    }
  }
}
```

### mutation_applied

视觉突变应用时触发。

```typescript
interface MutationAppliedEvent {
  id: string
  type: 'mutation_applied'
  timestamp: Date
  sessionId: string
  data: {
    avatarId: string
    mutationId: string
    mutationType: string
    properties: Record<string, unknown>
    intensity: 'low' | 'medium' | 'high'
    permanent: boolean
  }
}
```

**示例:**
```json
{
  "id": "evt_mut_1",
  "type": "mutation_applied",
  "timestamp": "2026-03-10T10:40:02Z",
  "sessionId": "sess_abc123",
  "data": {
    "avatarId": "avatar_001",
    "mutationId": "mut_001",
    "mutationType": "shell_glow",
    "properties": {
      "color": "#00ff88",
      "glowIntensity": 0.8,
      "pulseFrequency": 2
    },
    "intensity": "high",
    "permanent": true
  }
}
```

### replay_event_logged

重放事件记录时触发。

```typescript
interface ReplayEventLoggedEvent {
  id: string
  type: 'replay_event_logged'
  timestamp: Date
  sessionId: string
  data: {
    replayId: string
    originalEventId: string
    eventType: string
    replayTimestamp: Date
    metadata?: Record<string, unknown>
  }
}
```

---

## 系统事件 (System Events)

### plugin_installed

插件安装时触发。

```typescript
interface PluginInstalledEvent {
  id: string
  type: 'plugin_installed'
  timestamp: Date
  data: {
    pluginVersion: string
    hostVersion: string
    installationId: string
  }
}
```

### plugin_error

插件发生错误时触发。

```typescript
interface PluginErrorEvent {
  id: string
  type: 'plugin_error'
  timestamp: Date
  sessionId?: string
  data: {
    errorType: 'handshake_failed' | 'event_bridge_failed' | 'card_render_failed'
    errorMessage: string
    stackTrace?: string
    context?: Record<string, unknown>
  }
}
```

### compatibility_warning

兼容性警告时触发。

```typescript
interface CompatibilityWarningEvent {
  id: string
  type: 'compatibility_warning'
  timestamp: Date
  data: {
    level: 'info' | 'warning' | 'error'
    hostVersion: string
    feature: string
    message: string
    fallbackActivated?: string
  }
}
```

---

## 事件标准化

### 标准化接口

所有事件必须实现标准化接口：

```typescript
interface NormalizedEvent {
  id: string
  type: string
  timestamp: Date
  sessionId: string
  data: unknown
  metadata?: {
    sourceVersion?: string
    normalizedAt?: Date
    mappingApplied?: boolean
  }
}
```

### 版本映射

不同版本的 OpenClaw 可能有不同的事件格式。适配器负责映射：

```typescript
interface EventMapping {
  [eventType: string]: {
    [hostVersion: string]: EventSchema | EventMapper
  }
}

type EventMapper = (rawEvent: any) => NormalizedEvent
```

---

## 事件验证

### Schema 验证

所有事件必须通过 Zod schema 验证：

```typescript
import { z } from 'zod'

const UserMessageEventSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('user_message'),
  timestamp: z.date(),
  sessionId: z.string(),
  data: z.object({
    content: z.string(),
    messageId: z.string(),
    context: z.object({
      previousMessages: z.number().optional(),
      topic: z.string().optional()
    }).optional()
  })
})

function validateEvent(event: unknown): NormalizedEvent {
  return UserMessageEventSchema.parse(event)
}
```

---

## 事件存储

### 存储策略

```typescript
interface EventStore {
  // 批量写入
  writeBatch(events: NormalizedEvent[]): Promise<void>

  // 查询
  queryBySession(sessionId: string): Promise<NormalizedEvent[]>
  queryByType(type: string, limit?: number): Promise<NormalizedEvent[]>
  queryByTimeRange(start: Date, end: Date): Promise<NormalizedEvent[]>

  // 聚合
  aggregateByType(sessionId: string): Promise<Record<string, number>>
  getEventCount(sessionId: string): Promise<number>
}
```

---

## 事件流处理

### 批量处理

```typescript
interface BatchConfig {
  maxSize: number
  maxWait: number  // ms
  flushOnSessionEnd: boolean
}

class EventBatcher {
  private buffer: NormalizedEvent[] = []
  private timer?: NodeJS.Timeout

  add(event: NormalizedEvent): void
  flush(): Promise<void>
  start(config: BatchConfig): void
  stop(): void
}
```

### 优先级处理

```typescript
type EventPriority = 'critical' | 'high' | 'normal' | 'low'

interface PriorityConfig {
  critical: string[]  // 立即发送
  high: string[]      // 优先发送
  normal: string[]    // 批量发送
  low: string[]       // 延迟发送
}

const DEFAULT_PRIORITIES: PriorityConfig = {
  critical: ['session_end', 'card_decision'],
  high: ['candidate_detected', 'skill_promoted'],
  normal: ['user_message', 'assistant_response', 'tool_call'],
  low: ['avatar_stage_changed', 'animation_triggered']
}
```

---

## 事件分析

### 触发模式

```typescript
interface TriggerPattern {
  name: string
  eventTypes: string[]
  condition: (events: NormalizedEvent[]) => boolean
  extractor: (events: NormalizedEvent[]) => Candidate
}

const EXAMPLE_PATTERNS: TriggerPattern[] = [
  {
    name: 'repeated_correction',
    eventTypes: ['correction'],
    condition: (events) => {
      const corrections = events.filter(e => e.type === 'correction')
      return corrections.length >= 3
    },
    extractor: (events) => {
      // 提取重复纠正作为规则候选
    }
  },
  {
    name: 'positive_feedback',
    eventTypes: ['feedback'],
    condition: (events) => {
      return events.some(e =>
        e.type === 'feedback' &&
        e.data.feedbackType === 'positive'
      )
    },
    extractor: (events) => {
      // 提取成功模式
    }
  }
]
```

---

## 附录: 事件生命周期

```
┌─────────────────────────────────────────────────────────────────┐
│                     Event Lifecycle                             │
│                                                                  │
│  1. CAPTURE                                                      │
│     ┌──────────────┐                                            │
│     │ OpenClaw     │ emits raw event                            │
│     │ Runtime      │────────────┐                               │
│     └──────────────┘            │                               │
│                                ▼                               │
│  2. NORMALIZE                  ┌──────────────┐                │
│     ┌──────────────┐           │  Plugin      │ detects version│
│     │  Adapter     │ maps event│  Runtime     │────────────┐   │
│     └──────────────┘           └──────────────┘            │   │
│                                │                            │   │
│                                ▼                            ▼   │
│  3. VALIDATE          ┌──────────────┐            ┌─────────────┐│
│     ┌──────────────┐  │    Zod       │            │   Event     ││
│     │    Schema    │  │   Schema     │            │   Batcher   ││
│     └──────────────┘  └──────────────┘            └─────────────┘│
│                                │                            │    │
│                                ▼                            ▼    │
│  4. FORWARD           ┌──────────────┐            ┌─────────────┐│
│     ┌──────────────┐  │    HTTP      │            │   Priority  ││
│     │    API       │  │   Request    │            │   Queue     ││
│     └──────────────┘  └──────────────┘            └─────────────┘│
│                                │                            │    │
│                                └────────────┬───────────────┘    │
│                                             ▼                    │
│  5. PROCESS                         ┌──────────────┐            │
│     ┌──────────────┐                │   Evolution  │            │
│     │    Event     │───────────────▶│   Service    │            │
│     │    Store     │                └──────────────┘            │
│     └──────────────┘                                             │
│                                             │                    │
│                                             ▼                    │
│  6. TRIGGER                          ┌──────────────┐           │
│     ┌──────────────┐                 │   Trigger    │           │
│     │    Engine    │─────────────────│   Engine     │           │
│     └──────────────┘                 └──────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**文档版本:** 0.1.0
**最后更新:** 2026-03-10
**维护者:** OpenClaw Evolution Team
