# OpenClaw Evolution Plugin - 产品需求文档

## 版本: 0.1.0
## 最后更新: 2026-03-10

---

## 执行摘要

OpenClaw Evolution Plugin 是一个插件优先的进化层，为 OpenClaw 提供持续改进能力。系统通过事件捕获、评估触发、候选改进生成、进化卡片展示、决策和注册更新的闭环流程，使 OpenClaw 能够从运行时经验中学习和进化。

---

## 核心价值主张

1. **插件优先架构** - 作为 OpenClaw 原生插件运行，而非独立平台
2. **事件驱动进化** - 基于真实运行时事件的智能改进
3. **评估驱动决策** - 重要改进需要显式确认和评估
4. **可视化进化** - 通过 OpenClaw Evolution System 展示系统进化状态
5. **兼容性感知** - 通过 CompatibilityManager 支持主机版本升级

---

## 核心功能模块

### 1. 插件运行时 (Plugin Runtime)

**职责:**
- 作为 OpenClaw 原生插件安装和运行
- 实现运行时握手协议
- 检测主机能力和版本
- 提供事件桥接功能
- 渲染进化卡片

**核心接口:**
```typescript
interface PluginRuntime {
  // 运行时握手
  handshake(hostInfo: HostInfo): Promise<HandshakeResult>

  // 事件监听
  on(event: RuntimeEvent): void

  // 卡片渲染
  renderCard(card: EvolutionCard): RenderResult

  // 兼容性检查
  checkCompatibility(): CompatibilityStatus
}
```

### 2. 进化服务 (Evolution Service)

**职责:**
- 接收和存储运行时事件
- 运行触发引擎
- 生成候选改进
- 协调评估流程
- 管理技能/规则/记忆注册表
- 处理卡片决策

**核心 API:**
- `POST /v1/runtime/handshake` - 运行时握手
- `POST /v1/events` - 事件提交
- `POST /v1/candidates` - 候选改进创建
- `POST /v1/evaluations/run` - 运行评估
- `GET /v1/cards` - 查询进化卡片
- `POST /v1/cards/:id/decision` - 卡片决策
- `POST /v1/skills/promote` - 技能提升
- `POST /v1/skills/rollback` - 技能回滚

### 3. 洞察控制台 (Insight Console)

**职责:**
- 可视化仪表板
- 进化漏斗展示
- 候选改进审查
- 技能注册表管理
- 兼容性状态监控
- OpenClaw Avatar 进化可视化

**核心页面:**
1. 仪表板 (Dashboard) - 系统概览和关键指标
2. 进化漏斗 (Funnel) - 从事件到技能提升的转化漏斗
3. 候选列表 (Candidates) - 待审查的候选改进
4. 评估运行 (Evaluations) - 评估历史和状态
5. 技能注册表 (Skills) - 已注册技能/规则/记忆
6. 兼容性状态 (Compatibility) - 主机兼容性报告
7. Avatar 视图 (Avatar) - OpenClaw 进化状态可视化

### 4. OpenClaw Evolution System

**职责:**
- 管理 OpenClaw Avatar 状态
- 处理进化动画事件
- 暴露稳定的运行时动画协议
- 支持重放和洞察分析

**核心概念:**
- **OpenClaw Avatar** - OpenClaw 的视觉化表征
- **进化阶段** - base → awakened → learned → evolved
- **动画事件** - pulse, evaluating, activation
- **状态机** - 管理阶段转换和动画触发
- **事件重放** - 持久化进化事件用于重放

### 5. 兼容性管理器 (CompatibilityManager)

**职责:**
- 检测主机版本
- 加载能力配置
- 选择适配器配置
- 跨版本字段映射
- 支持降级模式
- 暴露兼容性状态

**降级策略:**
- 内联卡片渲染 → 侧边栏卡片
- 侧边栏卡片 → 控制台审查项
- 控制台审查项 → 外部 H5 卡片链接

---

## 核心工作流程

### 进化闭环

```
┌─────────────────────────────────────────────────────────────────┐
│                     Evolution Loop                               │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Event   │───▶│  Trigger │───▶│ Candidate│───▶│   Card   │  │
│  │ Capture  │    │  Engine  │    │Extractor │    │ Present  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│        │                                │              │        │
│        │                                ▼              ▼        │
│        │                         ┌──────────┐    ┌──────────┐  │
│        │                         │Evaluation│    │ Decision │  │
│        │                         │   Run    │    │   Made   │  │
│        │                         └──────────┘    └──────────┘  │
│        │                                │              │        │
│        │                                ▼              ▼        │
│        │                         ┌──────────┐    ┌──────────┐  │
│        └─────────────────────────│  Update  │◀───│  Promote │  │
│                                  │ Registry │    │   Skill  │  │
│                                  └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 事件流

```
OpenClaw Runtime
       │
       │ user_message, tool_call, etc.
       ▼
┌──────────────┐
│ Plugin       │ normalize and forward
│ Runtime      │────────────────────┐
└──────────────┘                    │
                                    ▼
                          ┌──────────────────┐
                          │ Evolution        │
                          │ Service          │
                          └──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              ┌─────────┐    ┌──────────┐    ┌──────────┐
              │ Trigger │    │ Evaluate │    │ Register │
              │ Engine  │    │ Candidate│    │  Skill   │
              └─────────┘    └──────────┘    └──────────┘
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ Insight          │
                          │ Console          │
                          │ + Avatar         │
                          └──────────────────┘
```

---

## 事件模式

### 运行时事件

| 事件类型 | 描述 | 触发时机 |
|---------|------|---------|
| `user_message` | 用户消息 | 用户发送消息时 |
| `assistant_response` | 助手响应 | AI 生成响应时 |
| `tool_call` | 工具调用 | 调用工具时 |
| `tool_result` | 工具结果 | 工具返回结果时 |
| `feedback` | 用户反馈 | 用户提供反馈时 |
| `correction` | 用户纠正 | 用户纠正 AI 时 |
| `session_end` | 会话结束 | 会话结束时 |

### 进化事件

| 事件类型 | 描述 | 触发时机 |
|---------|------|---------|
| `candidate_detected` | 候选改进检测 | 触发引擎匹配时 |
| `evaluation_started` | 评估开始 | 启动评估时 |
| `evaluation_passed` | 评估通过 | 评估成功时 |
| `evaluation_failed` | 评估失败 | 评估失败时 |
| `skill_promoted` | 技能提升 | 注册技能时 |
| `skill_rolled_back` | 技能回滚 | 回滚技能时 |
| `memory_saved` | 记忆保存 | 保存记忆时 |
| `card_presented` | 卡片展示 | 展示卡片时 |
| `card_decision` | 卡片决策 | 用户决策时 |

### OpenClaw Evolution System 事件

| 事件类型 | 描述 | 动画效果 |
|---------|------|---------|
| `avatar_initialized` | Avatar 初始化 | 基础形态显现 |
| `avatar_stage_changed` | 阶段变化 | 形态转换动画 |
| `animation_triggered` | 动画触发 | 特定动画播放 |
| `mutation_applied` | 突变应用 | 视觉突变效果 |
| `replay_event_logged` | 重放事件记录 | 事件持久化 |

---

## 进化卡片类型

### 1. Skill Candidate Card
**内容:** 建议的新技能
**字段:** 技能名称、描述、示例、置信度
**操作:** 提升、拒绝、延后

### 2. Rule Update Card
**内容:** 规则更新建议
**字段:** 规则类型、旧值、新值、理由
**操作:** 应用、拒绝、编辑

### 3. Memory Card
**内容:** 长期记忆存储建议
**字段:** 记忆类型、内容、重要性、过期时间
**操作:** 保存、忽略、编辑

### 4. Evaluation Failed Card
**内容:** 评估失败通知
**字段:** 失败原因、候选详情、建议修复
**操作:** 重试、放弃、修改

---

## 兼容性策略

### 主机版本检测

```typescript
interface HostInfo {
  version: string           // 语义版本 (如 "1.2.3")
  capabilities: string[]    // 支持的能力列表
  apiVersion: string        // API 版本
}
```

### 能力配置

```typescript
interface CapabilityProfile {
  version: string
  features: {
    inlineCards: boolean
    sidebarCards: boolean
    eventStreaming: boolean
    bidirectional: boolean
  }
  eventSchema: EventSchemaVersion
}
```

### 适配器选择

```typescript
interface AdapterProfile {
  name: string
  supportedHostVersions: string[]
  eventMapping: Record<string, string>
  degradedFeatures: string[]
}
```

---

## 数据模型

### 候选改进 (Candidate)

```typescript
interface Candidate {
  id: string
  sessionId: string
  type: 'skill' | 'rule' | 'memory'
  source: 'pattern' | 'feedback' | 'correction' | 'discovery'
  content: unknown
  confidence: number
  createdAt: Date
  status: 'pending' | 'evaluating' | 'passed' | 'failed' | 'promoted'
}
```

### 进化卡片 (EvolutionCard)

```typescript
interface EvolutionCard {
  id: string
  sessionId: string
  type: CardType
  candidateId: string
  content: CardContent
  status: 'pending' | 'approved' | 'rejected' | 'deferred'
  createdAt: Date
  expiresAt?: Date
}
```

### 技能注册表项 (SkillRegistryItem)

```typescript
interface SkillRegistryItem {
  id: string
  type: 'skill' | 'rule' | 'memory'
  name: string
  content: unknown
  version: number
  promotedAt: Date
  lastEvaluatedAt?: Date
  rollbackVersion?: number
}
```

### OpenClaw Avatar

```typescript
interface OpenClawAvatar {
  id: string
  currentStage: AvatarStage
  stageHistory: StageTransition[]
  activeMutations: Mutation[]
  stats: AvatarStats
}

type AvatarStage = 'base' | 'awakened' | 'learned' | 'evolved'

interface StageTransition {
  from: AvatarStage
  to: AvatarStage
  timestamp: Date
  triggerEvent: string
}

interface Mutation {
  id: string
  type: string
  appliedAt: Date
  intensity: 'low' | 'medium' | 'high'
}
```

---

## 成功指标

### 技术指标
- 插件安装成功率 > 95%
- 事件捕获准确率 > 99%
- API 响应时间 P99 < 200ms
- 评估准确率 > 80%
- 系统可用性 > 99.5%

### 产品指标
- 进化卡片展示率
- 卡片决策响应率
- 技能提升率
- 技能回滚率
- 用户满意度

---

## MVP 范围

### 包含
- ✅ 插件运行时基础功能
- ✅ 核心事件捕获和标准化
- ✅ Evolution Service MVP APIs
- ✅ 基础进化卡片
- ✅ Insight Console 核心页面
- ✅ OpenClaw Evolution System MVP
- ✅ CompatibilityManager
- ✅ 基础测试和文档

### 不包含 (未来版本)
- ❌ 高级自主进化
- ❌ 多租户支持
- ❌ 分布式评估
- ❌ 复杂动画引擎
- ❌ 机器学习优化

---

## 发布计划

### Milestone 1: 插件骨架
- 插件包结构
- Manifest/配置
- 运行时握手协议

### Milestone 2: 事件桥接
- 事件监听器
- 事件标准化
- 事件转发

### Milestone 3: Evolution Service
- 服务 API
- 触发引擎
- 评估流程

### Milestone 4: 进化卡片
- 卡片生成
- 卡片渲染
- 决策流程

### Milestone 5: Insight Console
- 仪表板
- 候选列表
- 技能注册表

### Milestone 6: OpenClaw Evolution System
- Avatar 模型
- 状态机
- 动画事件

### Milestone 7: Compatibility
- 版本检测
- 适配器
- 降级模式

### Milestone 8: 测试与文档
- 完整测试套件
- API 文档
- 集成演示

---

## 附录: 关键决策记录

### 为什么选择插件优先架构？
1. **更低进入门槛** - 用户无需迁移现有系统
2. **原生集成** - 直接访问运行时事件
3. **渐进式采用** - 可以逐步启用功能
4. **更好的兼容性** - 通过适配器模式支持版本升级

### 为什么需要显式决策？
1. **安全第一** - 避免自动应用有害更改
2. **用户控制** - 保持用户对系统的控制权
3. **质量保证** - 通过评估流程过滤低质量改进

### 为什么需要 OpenClaw Evolution System？
1. **可视化反馈** - 让进化过程可见
2. **状态持久化** - 支持重放和分析
3. **情感连接** - 增强 AI 进化的可感知性

---

**文档版本:** 0.1.0
**最后更新:** 2026-03-10
**下次审查:** Milestone 4 完成后
