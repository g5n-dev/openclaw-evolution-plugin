# 🚀 OpenClaw Evolution Plugin - 快速入门

欢迎来到 OpenClaw Evolution Plugin！本指南将帮助你快速上手并体验核心功能。

---

## 📋 前置要求

在开始之前，请确保你的环境满足以下要求：

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.10.0
- **OpenClaw**: v2026.3.x (可选，用于插件集成)
- **现代浏览器**: Chrome, Firefox, Safari, Edge

---

## ⚡ 5 分钟快速体验

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-org/openclaw-evolution-plugin.git
cd openclaw-evolution-plugin

# 安装依赖
pnpm install
```

### 2. 构建项目

```bash
# 构建所有包
pnpm build

# 验证构建成功
pnpm typecheck
```

### 3. 启动服务

```bash
# 终端 1: 启动进化服务
pnpm --filter @openclaw-evolution/evolution-service start

# 终端 2: 启动洞察控制台
pnpm --filter @openclaw-evolution/insight-console dev
```

### 4. 体验 Avatar 动画 🦞

打开浏览器访问: **http://localhost:3000/avatar**

#### 体验步骤：

1. **查看基础状态**
   - 观察 base 阶段的蓝色 Avatar
   - 注意没有节点的初始状态

2. **切换到专业渲染器**
   - 点击 "✨ Pro Mode" 按钮
   - 观察更丰富的视觉效果
   - 注意深空黑背景 (#0B0B10)

3. **触发进化**
   - 点击 "Evolve to Next" 按钮
   - 观察从 base → awakened 的颜色变化（蓝色→紫色）
   - 注意出现的 2 个节点（龙虾钳子隐喻）

4. **继续进化**
   - 再次点击 "Evolve to Next"
   - 观察 awakened → learned 的变化（紫色→紫罗兰）
   - 注意节点扩展到 4 个，出现内核

5. **完全进化**
   - 最后一次点击 "Evolve to Next"
   - 观察 learned → evolved 的变化（紫罗兰→粉色）
   - 注意：
     - 8 个节点完整系统
     - 生物发光金色光环
     - 旋转的六边形徽章

6. **查看突变**
   - 滚动到页面底部的 "Active Mutations" 区域
   - 观察已激活的突变效果：
     - `shell_glow` - 外骨骼光晕
     - `node_expand` - 节点扩展
     - `badge_attach` - 徽章附加

---

## 🎮 核心功能演示

### Dashboard 概览

访问: **http://localhost:3000**

查看实时指标：
- 📊 总事件数
- 🎯 进化候选数
- ✅ 已激活技能
- 🔄 系统健康状态

### 进化漏斗

访问: **http://localhost:3000/funnel**

了解完整的进化流程：
```
Events → Candidates → Evaluations → Cards → Decisions → Skills
```

### 候选管理

访问: **http://localhost:3000/candidates**

查看和管理改进建议：
- 待处理的候选
- 评估中的候选
- 已接受的技能
- 已拒绝的建议

---

## 🔧 开发模式

### 运行测试

```bash
# 运行所有测试
pnpm test

# 单元测试
pnpm test:unit

# 集成测试
pnpm test:integration

# 测试覆盖率
pnpm test:coverage
```

### 代码检查

```bash
# ESLint 检查
pnpm lint

# 类型检查
pnpm typecheck

# 修复 ESLint 问题
pnpm lint --fix
```

### 开发工具

```bash
# 启动开发模式（带热更新）
pnpm --filter @openclaw-evolution/insight-console dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm --filter @openclaw-evolution/insight-console preview
```

---

## 📖 下一步

### 了解架构

- 📐 [ARCHITECTURE.md](./ARCHITECTURE.md) - 系统架构设计
- 🎨 [ANIMATION_DESIGN.md](./ANIMATION_DESIGN.md) - 动画设计系统
- 🦞 [EVOLUTION_SYSTEM.md](./EVOLUTION_SYSTEM.md) - 进化系统详解

### API 文档

- 📡 [API.md](./API.md) - REST API 文档（待完善）
- 🔌 [EVENT_SCHEMA.md](./EVENT_SCHEMA.md) - 事件类型定义
- 🛡️ [COMPATIBILITY.md](./COMPATIBILITY.md) - 兼容性策略

### 深入学习

- 🎯 [PRD.md](./PRD.md) - 产品需求文档
- 🧪 [TESTING.md](./TESTING.md) - 测试指南（待完善）
- 🤝 [CONTRIBUTING.md](../CONTRIBUTING.md) - 贡献指南

---

## 🎨 自定义配置

### 修改 Avatar 颜色

```typescript
// packages/insight-console/src/pages/Avatar.tsx
const avatarRef = useRef(createAvatarManager({
  baseColor: '#3b82f6',  // 修改这里
  size: 200,
}));
```

### 调整 Canvas 大小

```typescript
const renderer = createProfessionalRenderer({
  width: 800,   // 修改宽度
  height: 800,  // 修改高度
  backgroundColor: '#0B0B10',
});
```

### 自定义动画速度

```typescript
// packages/evolution-engine/src/animations/protocol.ts
export const ANIMATION_DURATION = {
  pulse: 2000,      // 修改脉动周期
  breathe: 3000,    // 修改呼吸周期
  orbit: 4000,      // 修改轨道周期
};
```

---

## 🐛 常见问题

### Q: 端口冲突怎么办？

```bash
# 使用不同端口启动服务
PORT=3002 pnpm --filter @openclaw-evolution/insight-console dev
```

### Q: 如何清除所有数据？

```bash
# 清理构建文件和依赖
pnpm clean

# 重新安装
pnpm install
```

### Q: 浏览器控制台有错误？

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签
3. 检查是否有网络错误（API 调用失败）
4. 确认进化服务正在运行（端口 3001）

### Q: Avatar 动画不流畅？

- 确认使用现代浏览器
- 检查硬件加速是否开启
- 降低粒子数量（修改 `particles` 配置）
- 关闭浏览器其他标签页

---

## 💡 提示和技巧

### 性能优化

```typescript
// 使用 Simple Renderer 提升性能
const [useProfessionalRenderer, setUseProfessionalRenderer] = useState(false);
```

### 调试动画

```typescript
// 在浏览器控制台查看状态
console.log(avatarRef.current.getState());
console.log(avatarRef.current.getStage());
console.log(avatarRef.current.getMutations());
```

### 截图 Avatar

```javascript
// 在浏览器控制台执行
const canvas = document.querySelector('canvas');
const link = document.createElement('a');
link.download = 'avatar.png';
link.href = canvas.toDataURL();
link.click();
```

---

## 🚀 部署

### 构建 Docker 镜像

```bash
# 构建镜像
docker build -t openclaw-evolution-plugin .

# 运行容器
docker run -p 3000:3000 openclaw-evolution-plugin
```

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd packages/insight-console
vercel
```

---

## ☕ 支持我们

如果这个项目对你有帮助，欢迎请我喝一杯咖啡！

### 快速捐赠

访问赞助页面：**http://localhost:3000/sponsor**

### 加密货币

- **Ethereum**: `0x2FbF8091585cB317b131CCF7116a5F5F8080eBa3`
- **Bitcoin**: `bc1qlgx69s3t7e99f3yzaw26aqspewrkzvks5wluc9`
- **Solana**: `2ezLjrXS6hjYmu3J85asQdEi6Zo6DB6EcsLneSHdrSvb`
- **TON**: `TVS23vWDprEZHFoofzixHNFCid5sMaTX71`

详细地址请查看：[CRYPTO_WALLET.md](./CRYPTO_WALLET.md)

---

## 📮 获取帮助

- **文档**: 查看 `/docs` 目录
- **Issues**: [GitHub Issues](https://github.com/your-org/openclaw-evolution-plugin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/openclaw-evolution-plugin/discussions)
- **邮件**: support@openclaw-evolution.org

---

**祝你在 OpenClaw 进化之旅中玩得开心！** 🦞✨

<div align="center">

Made with ❤️ by the OpenClaw Evolution Community

</div>
