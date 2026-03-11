# 🦞 OpenClaw Evolution Plugin

> **让 AI 像龙虾一样进化** - OpenClaw v2026.3.x 的插件优先进化层

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Version](https://img.shields.io/badge/OpenClaw-2026.3.x-blue)](https://openclaw.ai)
[![Status](https://img.shields.io/badge/Status-Alpha-orange)](https://github.com/openclaw-evolution/plugin)

---

## 🎯 项目愿景

OpenClaw Evolution Plugin 相信 **AI 系统应该像生物一样有机进化**，而不是静态配置。

我们的核心使命是构建一个**事件驱动、评估导向、视觉反馈**的进化层，让 OpenClaw 能够：

- 🔄 **从使用中学习** - 自动捕获运行时事件
- 🧪 **验证后改进** - 所有改进必须经过评估
- 🎨 **可视化进化** - 通过 Avatar 看见系统成长
- 🛡️ **安全回滚** - 随时可以撤销不良变更

---

## 🌟 核心特性

### 1. **事件捕获系统**
实时捕获 OpenClaw 的每一次对话、工具调用、用户反馈，为进化提供原始数据。

```typescript
// 事件示例
{
  type: "tool_call",
  tool: "browser_search",
  timestamp: "2026-03-11T10:30:00Z",
  metadata: { query: "最新 AI 进展", results: 42 }
}
```

### 2. **候选改进检测**
智能分析事件模式，自动识别潜在改进机会：

- 🔍 **重复模式检测** - 发现可以自动化的操作序列
- 📊 **性能瓶颈识别** - 找出耗时最长的操作
- 💡 **用户意图推断** - 理解用户真正的需求

### 3. **评估验证框架**
每个改进候选都必须通过严格的测试才能生效：

```typescript
// 评估流程
Candidate → [自动测试] → [人工审查] → [A/B 对比] → Promoted Skill
```

### 4. **进化卡片系统**
以卡片形式呈现改进建议，用户掌控每一次进化：

```
┌─────────────────────────────────┐
│ 🎯 新技能候选                     │
├─────────────────────────────────┤
│ 类型: Code Optimization         │
│ 来源: tool_call 事件分析         │
│ 预期收益: 减少 30% 响应时间      │
│                                 │
│ [✅ 接受]  [❌ 拒绝]  [🔍 详情]   │
└─────────────────────────────────┘
```

### 5. **🦞 OpenClaw Evolution System**

这是我们的**视觉进化核心**——一个有机的、科技感的 Avatar 系统：

#### 🎨 设计理念：龙虾隐喻

| 龙虾特征 | 系统表现 | 视觉效果 |
|---------|---------|---------|
| **分节身体** | 4 个进化阶段 | 蓝色 → 紫色 → 紫罗兰 → 粉色渐变 |
| **钳子** | 技能节点 | 2 → 4 → 8 个轨道旋转节点 |
| **外骨骼** | 保护层 | 多层呼吸光晕效果 |
| **触须** | 感知连接 | 利萨如曲线有机粒子运动 |
| **蜕壳** | 进化突破 | 粒子爆发 + 变形动画 |

#### 🎬 专业动画系统

```typescript
// 动画阶段
base → awakened → learned → evolved

// 颜色系统
base:     #3B82F6 (蓝色 - 潜力)
awakened: #8B5CF6 (紫色 - 觉醒)
learned:  #A855F7 (紫罗兰 - 学习)
evolved:  #EC4899 (粉色 - 完全进化)
```

#### ✨ 核心技术

- **Canvas 2D 渲染** - 高性能实时动画
- **Lissajous 曲线** - 有机粒子运动
- **生物发光效果** - 最终进化阶段的视觉亮点
- **多层光晕系统** - 外骨骼保护层隐喻
- **六边形徽章** - 进化成就证明

### 6. **洞察控制台 (Insight Console)**

React + Vite + Tailwind CSS 构建的现代化仪表盘：

- 📊 **Dashboard** - 实时指标监控
- 🔄 **进化漏斗** - 从事件到技能的完整流程
- 🎯 **候选管理** - 查看和管理所有改进建议
- 📚 **技能注册表** - 已激活的技能和规则
- 🎨 **Avatar 页面** - 可视化进化状态
- 🔧 **兼容性检查** - OpenClaw 版本兼容状态

---

## 🏗️ 系统架构

```
┌──────────────────────────────────────────────────────────────┐
│                        OpenClaw v2026.3.x                     │
│                     (AI Assistant Platform)                  │
└─────────────────────────┬────────────────────────────────────┘
                          │ Events
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    🦎 Plugin Runtime                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Handshake   │  │ Event Bridge │  │ Compatibility    │    │
│  │ Manager     │  │ (Normalize)  │  │ Layer            │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────┬────────────────────────────────────┘
                          │ Normalized Events
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                 ⚙️ Evolution Service (Hono)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Trigger     │  │ Candidate    │  │ Evaluation       │    │
│  │ Engine      │  │ Extractor    │  │ Engine           │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Card        │  │ Skill        │  │ Rollback         │    │
│  │ Generator   │  │ Registry     │  │ System           │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────┬────────────────────────────────────┘
                          │ Evolution Cards
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                    🎨 Insight Console                          │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐ │
│  │Dashboard │  │  Funnel   │  │ Candidates│  │   Avatar   │ │
│  └──────────┘  └───────────┘  └───────────┘  └────────────┘ │
└─────────────────────────┬────────────────────────────────────┘
                          │ State Changes
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              🦞 OpenClaw Evolution System                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Avatar      │  │ State        │  │ Animation        │    │
│  │ Manager     │  │ Machine      │  │ Protocol         │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Canvas 2D   │  │ Particle     │  │ Bioluminescent   │    │
│  │ Renderer    │  │ System       │  │ Effects          │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Monorepo 结构

```
openclaw-evolution-plugin/
├── packages/
│   ├── shared-types/          # 共享 TypeScript 类型
│   ├── plugin-runtime/        # OpenClaw 插件运行时
│   ├── evolution-service/     # 进化服务 API (Hono)
│   ├── insight-console/       # 洞察控制台 (React + Vite)
│   └── evolution-engine/      # 进化引擎 (Avatar + 动画)
├── docs/                      # 完整文档
├── tests/                     # 测试套件
└── scripts/                   # 构建脚本
```

---

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/your-org/openclaw-evolution-plugin.git
cd openclaw-evolution-plugin

# 安装依赖 (需要 pnpm >= 8.10.0)
pnpm install

# 构建所有包
pnpm build
```

### 开发模式

```bash
# 1. 启动进化服务 (端口 3001)
pnpm --filter @openclaw-evolution/evolution-service start

# 2. 启动洞察控制台 (端口 3000)
pnpm --filter @openclaw-evolution/insight-console dev

# 3. 访问控制台
open http://localhost:3000
```

### 查看 Avatar 动画

```bash
# 访问 Avatar 页面
open http://localhost:3000/avatar

# 体验专业渲染器（龙虾元素动画）
- 点击 "✨ Pro Mode" 切换到专业渲染器
- 点击 "Evolve to Next" 观看进化动画
- 观察 4 个阶段的颜色和形态变化
```

---

## 🎮 使用场景

### 场景 1: 自动优化代码生成

```typescript
// 1. 事件捕获
plugin.on('tool_call', (event) => {
  if (event.tool === 'code_generation') {
    // 2. 检测模式
    if (event.metadata.repeatedPattern) {
      // 3. 生成候选
      const candidate = {
        type: 'code_optimization',
        suggestion: '创建代码生成模板',
        expectedBenefit: '减少 40% 生成时间'
      };

      // 4. 创建进化卡片
      createEvolutionCard(candidate);
    }
  }
});
```

### 场景 2: 学习用户偏好

```typescript
// 系统学习用户喜欢简洁的代码风格
const userProfile = {
  codeStyle: 'minimal',
  documentationPreference: 'concise',
  responseLength: 'short'
};

// 自动调整 AI 行为
avatar.addMutation('style_adaptation');
```

### 场景 3: Avatar 进化可视化

```typescript
// 当用户学会使用新功能时
userMasteredFeature('advanced_search');

// Avatar 进化
avatar.evolveToStage('learned');

// 触发动画
animationSystem.trigger('celebration', {
  intensity: 'high',
  effects: ['particle_explosion', 'badge_appearance']
});

// 添加徽章
avatar.addMutations(['badge_attach']);
```

---

## 📊 技术栈

| 层级 | 技术选择 | 理由 |
|-----|---------|-----|
| **插件运行时** | TypeScript + OpenClaw SDK | 类型安全 + 官方支持 |
| **进化服务** | Hono + Node.js/Bun | 轻量级 + 高性能 |
| **数据库** | SQLite / PostgreSQL | 开发便利 + 生产可靠 |
| **前端框架** | React 18 + Vite | 现代 + 快速 |
| **状态管理** | Zustand | 简单 + 类型友好 |
| **UI 库** | shadcn/ui + Tailwind CSS | 美观 + 可定制 |
| **数据可视化** | Recharts | React 生态集成 |
| **动画引擎** | Canvas 2D | 性能 + 跨平台 |
| **测试框架** | Vitest + Playwright | 快速 + E2E 覆盖 |

---

## 📖 文档

- **[PRD](./docs/PRD.md)** - 产品需求文档
- **[ARCHITECTURE](./docs/ARCHITECTURE.md)** - 系统架构设计
- **[EVENT_SCHEMA](./docs/EVENT_SCHEMA.md)** - 事件类型定义
- **[COMPATIBILITY](./docs/COMPATIBILITY.md)** - 兼容性策略
- **[EVOLUTION_SYSTEM](./docs/EVOLUTION_SYSTEM.md)** - 进化系统详解
- **[ANIMATION_DESIGN](./docs/ANIMATION_DESIGN.md)** - 动画设计系统 🎨

---

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 单元测试
pnpm test:unit

# 集成测试
pnpm test:integration

# E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

**当前测试状态**:
- ✅ 47 个单元测试通过
- ✅ 业务流程验证通过
- ⏳ E2E 测试待完成

---

## 🔄 开发状态

### 🚧 Alpha 阶段 (当前)

- ✅ Phase 1: 项目结构和 Monorepo 配置
- ✅ Phase 2: 插件运行时和握手协议
- ✅ Phase 3: 进化服务 MVP
- ✅ Phase 4: 洞察控制台基础页面
- ✅ Phase 5: Evolution System 和专业动画
- ⏳ Phase 6: 完整测试覆盖
- ⏳ Phase 7: 文档完善
- ⏳ Phase 8: 性能优化

### 🎯 即将推出

- [ ] Remotion 视频导出功能
- [ ] 多租户支持
- [ ] 分布式评估系统
- [ ] 自主进化引擎
- [ ] WebGPU 渲染器

---

## 🤝 贡献

我们欢迎各种形式的贡献！

1. **报告 Bug** - [创建 Issue](https://github.com/your-org/openclaw-evolution-plugin/issues)
2. **提交代码** - 查看 [CONTRIBUTING.md](./CONTRIBUTING.md)
3. **改进文档** - 帮助我们完善文档
4. **分享想法** - 在 [Discussions](https://github.com/your-org/openclaw-evolution-plugin/discussions) 中讨论

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🙏 致谢

- **OpenClaw Team** - 提供强大的 AI 平台
- **Google A2UI** - Agent-to-User Interface 设计灵感
- **Remotion** - 视频生成框架参考
- **shadcn/ui** - 优秀的 UI 组件库

---

## 📮 联系方式

- **项目主页**: [github.com/your-org/openclaw-evolution-plugin](https://github.com/your-org/openclaw-evolution-plugin)
- **问题反馈**: [GitHub Issues](https://github.com/your-org/openclaw-evolution-plugin/issues)
- **讨论区**: [GitHub Discussions](https://github.com/your-org/openclaw-evolution-plugin/discussions)

---

<div align="center">

**🦞 让 AI 有机进化 🦞**

Made with ❤️ by the OpenClaw Evolution Community

</div>
