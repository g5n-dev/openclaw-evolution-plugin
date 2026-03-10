# OpenClaw Evolution Plugin - 兼容性管理文档

## 版本: 0.1.0
## 最后更新: 2026-03-10

---

## 概述

CompatibilityManager 确保插件能够在不同版本的 OpenClaw 主机上稳定运行。通过适配器模式、版本检测和降级策略，系统可以透明地处理版本差异。

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Compatibility Architecture                      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     CompatibilityManager                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │  Version     │  │  Capability  │  │   Adapter    │           │  │
│  │  │  Detector    │  │  Loader      │  │  Selector    │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │   Event     │  │    Fallback  │  │    Status    │           │  │
│  │  │   Mapper    │  │  Manager     │  │  Reporter    │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ uses
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Adapter Profiles                                │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  V1 Adapter (for OpenClaw 1.x)                                  │    │
│  │  - Event schema mapping                                         │    │
│  │  - API compatibility layer                                      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  V2 Adapter (for OpenClaw 2.x)                                  │    │
│  │  - Bidirectional streaming                                     │    │
│  │  - Enhanced card rendering                                      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Fallback Adapter (for unsupported versions)                    │    │
│  │  - Minimal event capture                                        │    │
│  │  - External card rendering                                      │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件

### 1. Version Detector

检测主机版本和基本信息。

```typescript
interface HostInfo {
  version: string              // 语义版本 "1.2.3"
  buildNumber?: string         // 构建号
  channel: 'stable' | 'beta' | 'dev'
  apiVersion: string           // API 版本
  capabilities: string[]       // 支持的能力列表
}

class VersionDetector {
  async detect(): Promise<HostInfo> {
    // 通过握手或 API 获取主机信息
  }

  parseVersion(version: string): SemVer {
    // 解析语义版本
  }

  compareVersions(v1: string, v2: string): number {
    // 版本比较: -1, 0, 1
  }

  isSupported(version: string): boolean {
    // 检查是否在支持范围内
  }
}
```

### 2. Capability Loader

加载和解析能力配置。

```typescript
interface CapabilityProfile {
  version: string
  features: {
    // 卡片渲染能力
    inlineCards: boolean
    sidebarCards: boolean
    consoleCards: boolean
    externalCards: boolean

    // 事件流能力
    eventStreaming: boolean
    bidirectional: boolean
    batching: boolean
    websocket: boolean

    // API 能力
    restApi: boolean
    graphql: boolean

    // 其他功能
    fileAccess: boolean
    networkAccess: boolean
  }
  eventSchema: EventSchemaVersion
  apiVersion: string
  limits: {
    maxEventSize: number
    maxBatchSize: number
    maxConnections: number
  }
}

class CapabilityLoader {
  async loadProfile(version: string): Promise<CapabilityProfile> {
    // 从配置文件或 API 加载能力配置
  }

  async loadFromHost(hostInfo: HostInfo): Promise<CapabilityProfile> {
    // 直接从主机获取能力信息
  }

  mergeProfiles(
    local: CapabilityProfile,
    remote: CapabilityProfile
  ): CapabilityProfile {
    // 合并本地和远程能力配置
  }
}
```

### 3. Adapter Selector

选择合适的适配器。

```typescript
interface AdapterProfile {
  name: string
  supportedHostVersions: SemVerRange[]
  eventMapping: EventMapping
  apiMapping: ApiMapping
  degradedFeatures: string[]
  fallbackStrategies: FallbackConfig
  metadata: {
    author: string
    version: string
    createdAt: Date
    notes?: string
  }
}

type SemVerRange = string  // "^1.0.0", ">=2.0.0 <3.0.0"

class AdapterSelector {
  private adapters: AdapterProfile[]

  selectAdapter(hostInfo: HostInfo): AdapterProfile {
    // 根据主机版本选择最佳适配器
    const version = parseVersion(hostInfo.version)

    // 查找支持该版本的适配器
    const matching = this.adapters.filter(adapter =>
      adapter.supportedHostVersions.some(range =>
        semver.satisfies(version, range)
      )
    )

    // 选择最新的匹配适配器
    return matching.sort((a, b) =>
      semver.rcompare(a.metadata.version, b.metadata.version)
    )[0]
  }

  registerAdapter(adapter: AdapterProfile): void {
    this.adapters.push(adapter)
  }
}
```

### 4. Event Mapper

映射不同版本的事件格式。

```typescript
type EventMapping = {
  [eventType: string]: string | EventMapper | EventMappingChain
}

type EventMapper = (rawEvent: any) => NormalizedEvent
type EventMappingChain = EventMapper[]

class EventMapper {
  constructor(
    private adapter: AdapterProfile,
    private targetSchema: EventSchemaVersion
  ) {}

  mapEvent(rawEvent: any): NormalizedEvent {
    const eventType = rawEvent.type
    const mapping = this.adapter.eventMapping[eventType]

    if (typeof mapping === 'string') {
      // 直接类型重命名
      return { ...rawEvent, type: mapping }
    } else if (typeof mapping === 'function') {
      // 使用映射函数
      return mapping(rawEvent)
    } else if (Array.isArray(mapping)) {
      // 映射链
      return mapping.reduce((event, mapper) => mapper(event), rawEvent)
    }

    // 默认: 不做转换
    return rawEvent
  }

  mapEventBatch(events: any[]): NormalizedEvent[] {
    return events.map(event => this.mapEvent(event))
  }
}
```

### 5. Fallback Manager

管理降级策略。

```typescript
interface FallbackConfig {
  cardRendering: FallbackChain<RenderingMode>
  eventStreaming: FallbackChain<StreamingMode>
  communication: FallbackChain<CommunicationMode>
}

type FallbackChain<T> = {
  primary: T
  fallbacks: T[]
  conditions: FallbackCondition[]
}

type FallbackCondition = (context: FallbackContext) => boolean

class FallbackManager {
  private strategies: Map<string, FallbackChain<any>>

  execute<T>(
    feature: string,
    context: FallbackContext
  ): T {
    const chain = this.strategies.get(feature)
    if (!chain) {
      throw new Error(`No fallback strategy for ${feature}`)
    }

    // 尝试主要方式
    if (this.canUse(chain.primary, context)) {
      return chain.primary
    }

    // 尝试降级方式
    for (const fallback of chain.fallbacks) {
      if (this.canUse(fallback, context)) {
        this.logFallback(feature, chain.primary, fallback)
        return fallback
      }
    }

    // 没有可用的方式
    throw new Error(`All fallback strategies failed for ${feature}`)
  }

  private canUse(mode: any, context: FallbackContext): boolean {
    // 检查模式是否可用
    return true
  }

  private logFallback(
    feature: string,
    primary: any,
    fallback: any
  ): void {
    console.warn(`Fallback: ${feature} from ${primary} to ${fallback}`)
  }
}
```

### 6. Status Reporter

报告兼容性状态。

```typescript
interface CompatibilityStatus {
  hostVersion: string
  pluginVersion: string
  adapterName: string
  compatibilityLevel: 'full' | 'partial' | 'minimal'
  supportedFeatures: string[]
  unsupportedFeatures: string[]
  degradedFeatures: string[]
  warnings: CompatibilityWarning[]
  recommendations: string[]
}

interface CompatibilityWarning {
  level: 'info' | 'warning' | 'error'
  feature: string
  message: string
  impact: string
  suggestedAction?: string
}

class StatusReporter {
  generateReport(
    hostInfo: HostInfo,
    adapter: AdapterProfile,
    capabilities: CapabilityProfile
  ): CompatibilityStatus {
    // 生成详细的兼容性报告
  }

  getStatusLevel(status: CompatibilityStatus): 'full' | 'partial' | 'minimal' {
    if (status.unsupportedFeatures.length === 0) {
      return 'full'
    } else if (status.degradedFeatures.length > 0) {
      return 'partial'
    } else {
      return 'minimal'
    }
  }
}
```

---

## 适配器实现

### V1 Adapter (OpenClaw 1.x)

```typescript
const V1_ADAPTER: AdapterProfile = {
  name: 'v1-adapter',
  supportedHostVersions: ['>=1.0.0 <2.0.0'],
  eventMapping: {
    // 重命名事件类型
    'UserMessage': 'user_message',
    'AssistantResponse': 'assistant_response',
    'ToolInvocation': 'tool_call',
    'ToolResult': 'tool_result',

    // 复杂映射
    'ConversationEnd': (rawEvent) => ({
      id: rawEvent.id,
      type: 'session_end',
      timestamp: new Date(rawEvent.timestamp),
      sessionId: rawEvent.conversationId,
      data: {
        duration: rawEvent.duration,
        messageCount: rawEvent.messageCount,
        toolCallCount: rawEvent.toolCallCount || 0
      }
    })
  },
  apiMapping: {
    '/api/v1/events': '/v1/events',
    '/api/v1/cards': '/v1/cards'
  },
  degradedFeatures: [
    'inlineCards',           // V1 不支持内联卡片
    'bidirectional',         // V1 不支持双向通信
    'websocket'              // V1 不支持 WebSocket
  ],
  fallbackStrategies: {
    cardRendering: {
      primary: 'external',
      fallbacks: ['console'],
      conditions: []
    },
    eventStreaming: {
      primary: 'polling',
      fallbacks: [],
      conditions: []
    },
    communication: {
      primary: 'http',
      fallbacks: [],
      conditions: []
    }
  },
  metadata: {
    author: 'OpenClaw Evolution Team',
    version: '1.0.0',
    createdAt: new Date('2026-03-10'),
    notes: 'Initial adapter for OpenClaw 1.x'
  }
}
```

### V2 Adapter (OpenClaw 2.x)

```typescript
const V2_ADAPTER: AdapterProfile = {
  name: 'v2-adapter',
  supportedHostVersions: ['>=2.0.0 <3.0.0'],
  eventMapping: {
    // V2 事件名称已标准化，无需重命名
    'user_message': (rawEvent) => rawEvent,
    'assistant_response': (rawEvent) => rawEvent,
    'tool_call': (rawEvent) => rawEvent,
    'tool_result': (rawEvent) => rawEvent
  },
  apiMapping: {
    '/v1/events': '/v1/events',
    '/v1/cards': '/v1/cards',
    '/v1/stream': '/v1/stream'
  },
  degradedFeatures: [],
  fallbackStrategies: {
    cardRendering: {
      primary: 'inline',
      fallbacks: ['sidebar', 'external'],
      conditions: [
        (ctx) => ctx.screenSize.width < 800  // 小屏幕降级到侧边栏
      ]
    },
    eventStreaming: {
      primary: 'websocket',
      fallbacks: ['polling'],
      conditions: [
        (ctx) => !ctx.websocketAvailable  // WebSocket 不可用时降级
      ]
    },
    communication: {
      primary: 'websocket',
      fallbacks: ['http'],
      conditions: []
    }
  },
  metadata: {
    author: 'OpenClaw Evolution Team',
    version: '2.0.0',
    createdAt: new Date('2026-03-10'),
    notes: 'Enhanced adapter for OpenClaw 2.x with full feature support'
  }
}
```

### Fallback Adapter (未知版本)

```typescript
const FALLBACK_ADAPTER: AdapterProfile = {
  name: 'fallback-adapter',
  supportedHostVersions: ['*'],
  eventMapping: {
    // 尝试映射任何事件
    '*': (rawEvent) => ({
      id: rawEvent.id || generateId(),
      type: rawEvent.type || 'unknown',
      timestamp: rawEvent.timestamp ? new Date(rawEvent.timestamp) : new Date(),
      sessionId: rawEvent.sessionId || rawEvent.conversationId || 'unknown',
      data: rawEvent.data || rawEvent
    })
  },
  apiMapping: {},
  degradedFeatures: [
    'inlineCards',
    'sidebarCards',
    'websocket',
    'bidirectional'
  ],
  fallbackStrategies: {
    cardRendering: {
      primary: 'external',
      fallbacks: ['console'],
      conditions: []
    },
    eventStreaming: {
      primary: 'polling',
      fallbacks: [],
      conditions: []
    },
    communication: {
      primary: 'http',
      fallbacks: [],
      conditions: []
    }
  },
  metadata: {
    author: 'OpenClaw Evolution Team',
    version: '0.1.0',
    createdAt: new Date('2026-03-10'),
    notes: 'Minimal fallback adapter for unsupported versions'
  }
}
```

---

## 降级场景

### 场景 1: 内联卡片不可用

**条件:** 主机不支持内联卡片渲染

**降级链:**
1. `inline` → 尝试内联渲染
2. `sidebar` → 降级到侧边栏
3. `external` → 降级到外部 H5 页面

```typescript
class CardRenderer {
  renderCard(card: EvolutionCard): RenderResult {
    const mode = fallbackManager.execute('cardRendering', {
      hostCapabilities: capabilityProfile.features
    })

    switch (mode) {
      case 'inline':
        return this.renderInline(card)
      case 'sidebar':
        return this.renderSidebar(card)
      case 'external':
        return this.renderExternal(card)
      default:
        throw new Error('No rendering mode available')
    }
  }
}
```

### 场景 2: WebSocket 不可用

**条件:** 主机或网络不支持 WebSocket

**降级链:**
1. `websocket` → 尝试 WebSocket 连接
2. `polling` → 降级到 HTTP 轮询

```typescript
class EventStream {
  connect(): StreamConnection {
    const mode = fallbackManager.execute('eventStreaming', {
      websocketAvailable: this.checkWebSocket()
    })

    switch (mode) {
      case 'websocket':
        return new WebSocketConnection(this.serviceUrl)
      case 'polling':
        return new PollingConnection(this.serviceUrl, {
          interval: 1000
        })
      default:
        throw new Error('No streaming mode available')
    }
  }
}
```

### 场景 3: 双向通信不可用

**条件:** 主机不支持服务端推送

**降级策略:**
- 使用单向通信 + 客户端轮询
- 增加轮询频率补偿延迟

```typescript
class BidirectionalChannel {
  send(data: any): void {
    // 总是可以发送
    this.httpClient.post('/v1/events', data)
  }

  subscribe(handler: (data: any) => void): void {
    if (capabilityProfile.features.bidirectional) {
      // 使用 WebSocket 或 SSE
      this.serverSentEvents.subscribe(handler)
    } else {
      // 降级到轮询
      this.polling.subscribe(handler, { interval: 500 })
    }
  }
}
```

---

## 兼容性测试

### 测试矩阵

```typescript
interface CompatibilityTestCase {
  hostVersion: string
  pluginVersion: string
  expectedLevel: 'full' | 'partial' | 'minimal'
  expectedFeatures: string[]
  unexpectedFeatures: string[]
}

const COMPATIBILITY_TESTS: CompatibilityTestCase[] = [
  {
    hostVersion: '1.5.0',
    pluginVersion: '0.1.0',
    expectedLevel: 'partial',
    expectedFeatures: ['eventStreaming', 'restApi'],
    unexpectedFeatures: ['inlineCards', 'websocket']
  },
  {
    hostVersion: '2.0.0',
    pluginVersion: '0.1.0',
    expectedLevel: 'full',
    expectedFeatures: ['inlineCards', 'websocket', 'bidirectional'],
    unexpectedFeatures: []
  },
  {
    hostVersion: '0.9.0',
    pluginVersion: '0.1.0',
    expectedLevel: 'minimal',
    expectedFeatures: ['restApi'],
    unexpectedFeatures: ['inlineCards', 'websocket']
  }
]
```

### 测试运行器

```typescript
class CompatibilityTestRunner {
  async runTests(): Promise<TestResult[]> {
    const results: TestResult[] = []

    for (const testCase of COMPATIBILITY_TESTS) {
      const result = await this.runTest(testCase)
      results.push(result)
    }

    return results
  }

  private async runTest(test: CompatibilityTestCase): Promise<TestResult> {
    // 模拟特定版本的主机
    const mockHost = this.createMockHost(test.hostVersion)

    // 创建 CompatibilityManager
    const manager = new CompatibilityManager(mockHost)

    // 执行握手和检测
    const status = await manager.getCompatibilityStatus()

    // 验证结果
    const passed = this.validateResult(status, test)

    return {
      test,
      status,
      passed,
      errors: passed ? [] : this.collectErrors(status, test)
    }
  }
}
```

---

## 版本迁移指南

### 从 V1 迁移到 V2

**新功能:**
- 内联卡片渲染
- WebSocket 双向通信
- 增强的事件流

**迁移步骤:**

1. **更新插件清单**
```json
{
  "minHostVersion": "2.0.0",
  "capabilities": ["inlineCards", "websocket", "bidirectional"]
}
```

2. **更新事件映射**
```typescript
// 移除旧的事件重命名
eventMapping: {
  'user_message': (rawEvent) => rawEvent,  // 直接使用
  'assistant_response': (rawEvent) => rawEvent
}
```

3. **启用新功能**
```typescript
// 使用内联卡片
const renderer = new CardRenderer({ mode: 'inline' })

// 使用 WebSocket
const stream = new WebSocketStream(serviceUrl)
```

---

## 最佳实践

### 1. 始终检查兼容性

```typescript
async function initializePlugin() {
  const manager = new CompatibilityManager()
  const status = await manager.getCompatibilityStatus()

  if (status.compatibilityLevel === 'minimal') {
    console.warn('Running with minimal compatibility')
    showCompatibilityWarning(status)
  }

  // 根据兼容性级别调整功能
  configureFeatures(status)
}
```

### 2. 使用渐进增强

```typescript
function renderCard(card: EvolutionCard) {
  // 基础功能: 外部卡片
  let mode: RenderingMode = 'external'

  // 增强功能: 根据能力升级
  if (capabilities.inlineCards) {
    mode = 'inline'
  } else if (capabilities.sidebarCards) {
    mode = 'sidebar'
  }

  return renderer.render(card, mode)
}
```

### 3. 记录兼容性问题

```typescript
class CompatibilityLogger {
  logIssue(issue: CompatibilityIssue): void {
    // 记录到日志
    console.error('[Compatibility]', issue)

    // 发送到分析服务
    analytics.track('compatibility_issue', {
      hostVersion: issue.hostVersion,
      feature: issue.feature,
      impact: issue.impact
    })

    // 通知用户
    if (issue.level === 'error') {
      notifyUser(issue.message)
    }
  }
}
```

### 4. 提供降级说明

```typescript
function showFallbackNotice(
  feature: string,
  from: string,
  to: string
): void {
  showNotification({
    title: '功能降级',
    message: `${feature} 从 ${from} 降级到 ${to}`,
    type: 'warning',
    actions: [
      {
        label: '了解更多',
        onClick: () => openHelpPage('compatibility')
      },
      {
        label: '更新 OpenClaw',
        onClick: () => openDownloadPage()
      }
    ]
  })
}
```

---

## 故障排除

### 问题: 握手失败

**症状:** 插件无法与主机建立连接

**诊断:**
1. 检查主机版本是否在支持范围内
2. 验证插件权限配置
3. 检查网络连接

**解决方案:**
- 使用 Fallback Adapter
- 引导用户更新 OpenClaw
- 记录详细错误日志

### 问题: 事件映射错误

**症状:** 事件数据丢失或格式错误

**诊断:**
1. 检查适配器的事件映射配置
2. 验证事件 schema 版本
3. 查看映射器日志

**解决方案:**
- 更新适配器配置
- 使用通用映射器
- 通知用户兼容性问题

### 问题: 卡片无法渲染

**症状:** 卡片不显示或显示异常

**诊断:**
1. 检查渲染能力
2. 验证降级策略
3. 查看控制台错误

**解决方案:**
- 启用降级渲染
- 使用外部卡片链接
- 提供控制台输出

---

## API 参考

### CompatibilityManager

```typescript
class CompatibilityManager {
  constructor(hostRuntime: HostRuntime)

  // 检测和初始化
  async initialize(): Promise<CompatibilityStatus>

  // 版本检测
  detectHostVersion(): HostInfo
  parseVersion(version: string): SemVer

  // 能力管理
  getCapabilities(): CapabilityProfile
  hasCapability(capability: string): boolean

  // 适配器管理
  selectAdapter(hostInfo: HostInfo): AdapterProfile
  getCurrentAdapter(): AdapterProfile

  // 事件映射
  mapEvent(rawEvent: any): NormalizedEvent
  mapEventBatch(events: any[]): NormalizedEvent[]

  // 降级管理
  executeFallback<T>(
    feature: string,
    context: FallbackContext
  ): T

  // 状态报告
  getCompatibilityStatus(): CompatibilityStatus
  generateReport(): CompatibilityReport
}
```

---

**文档版本:** 0.1.0
**最后更新:** 2026-03-10
**维护者:** OpenClaw Evolution Team
