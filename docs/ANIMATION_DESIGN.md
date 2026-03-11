# OpenClaw Evolution Avatar - 动画设计系统

## 设计理念

**有机进化 + 科技美学** - 结合生物有机形态与未来科技感

### 视觉隐喻：龙虾 (Lobster)
- **分节结构**: 代表进化阶段
- **钳子**: 代表技能获取和能力
- **外骨骼**: 代表系统保护和防御
- **触须**: 代表感知和连接

---

## 🎨 设计系统

### 1. 颜色系统 (Biomimetic + Space Tech)

```typescript
const COLOR_SYSTEM = {
  // 进化阶段颜色 (Bioluminescent 渐变)
  stages: {
    base: {
      primary: '#3B82F6',      // 蓝色 (潜力)
      secondary: '#60A5FA',    // 浅蓝
      glow: 'rgba(59, 130, 246, 0.3)',
    },
    awakened: {
      primary: '#8B5CF6',      // 紫色 (觉醒)
      secondary: '#A78BFA',    // 浅紫
      glow: 'rgba(139, 92, 246, 0.4)',
    },
    learned: {
      primary: '#A855F7',      // 紫罗兰 (学习)
      secondary: '#C084FC',    // 浅紫罗兰
      glow: 'rgba(168, 85, 247, 0.5)',
    },
    evolved: {
      primary: '#EC4899',      // 粉色 (完全进化)
      secondary: '#F472B6',    // 浅粉
      glow: 'rgba(236, 72, 153, 0.6)',
    },
  },

  // 背景色 (Deep Space)
  background: {
    primary: '#0B0B10',      // 深空黑
    secondary: '#151520',    // 次级深色
    accent: '#1E293B',       // 强调色
  },

  // 粒子和效果
  effects: {
    particle: 'rgba(255, 255, 255, 0.6)',
    glow: 'rgba(59, 130, 246, 0.5)',
    energy: 'rgba(251, 191, 36, 0.8)',  // 金色能量
  },
};
```

### 2. 动画曲线 (基于 UX 最佳实践)

```typescript
const EASING = {
  // 进入动画 (快速启动，平滑结束)
  enter: 'cubic-bezier(0.23, 1, 0.32, 1)',  // ease-out

  // 离开动画 (平滑开始，快速结束)
  exit: 'cubic-bezier(0.4, 0, 0.2, 1)',    // ease-in

  // 呼吸动画 (平滑循环)
  breathe: 'cubic-bezier(0.4, 0, 0.6, 1)',   // ease-in-out

  // 弹性效果 (庆祝动画)
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // 线性 (数据驱动)
  linear: 'linear',
};
```

### 3. 动画时长 (Motion-Driven 原则)

```typescript
const DURATION = {
  // 微交互 (150-300ms)
  micro: 150,           // 悬停效果
  hover: 200,

  // UI 过渡 (300-500ms)
  transition: 300,      // 页面切换
  stageChange: 500,    // 阶段过渡

  // 复杂动画 (800-2000ms)
  evolution: 1200,     // 进化动画
  celebration: 2000,   // 庆祝动画

  // 循环动画 (1000-3000ms)
  pulse: 2000,         // 脉动周期
  breathe: 3000,       // 呼吸周期
  orbit: 4000,         // 轨道周期
};
```

---

## 🦞 龙虾元素设计映射

### 核心隐喻

| 龙虾特征 | Avatar 表现 | 实现方式 |
|---------|------------|---------|
| **分节身体** | 4 个进化阶段 | 颜色渐进 + 形态变化 |
| **钳子** | 技能节点 | 2→4→8 个节点扩展 |
| **外骨骼** | 保护层 | 光晕效果 (shell_glow) |
| **触须** | 感知连接 | 粒子环绕系统 |
| **进化蜕壳** | 进化过程 | 粒子爆发 + 变形动画 |

---

## 🎬 动画序列设计

### Sequence 1: 待机状态 (Idle Pulse)

**目的**: 表现生命力和准备状态

```typescript
// 龙虾呼吸感
{
  animation: 'breathe',
  duration: 3000,
  easing: 'ease-in-out',
  loop: true,
  keyframes: {
    0%: {
      scale: 1,
      opacity: 1,
      particleOrbitRadius: 60,
    },
    50%: {
      scale: 1.05,      // 膨胀
      opacity: 0.9,
      particleOrbitRadius: 65,  // 粒子扩散
    },
    100%: {
      scale: 1,
      opacity: 1,
      particleOrbitRadius: 60,
    },
  },
}
```

### Sequence 2: 进化动画 (Evolution)

**目的**: 表现突破和成长

```typescript
// 龙虾蜕壳感
{
  animation: 'evolution',
  duration: 1200,
  easing: 'ease-out',
  phases: [
    // Phase 1: 收缩准备 (0-30%)
    {
      scale: 1 → 0.8,
      opacity: 1 → 0.7,
      shake: { intensity: 0.3 },
    },

    // Phase 2: 能量爆发 (30-60%)
    {
      particleBurst: true,
      particleCount: 50,
      burstRadius: 150,
      colorShift: true,
    },

    // Phase 3: 新形态展开 (60-100%)
    {
      scale: 0.8 → 1.1,
      nodesExpand: true,
      glowIntensity: 0 → 1,
    },
  ],
}
```

### Sequence 3: 庆祝动画 (Celebration)

**目的**: 表现成就和喜悦

```typescript
// 龙虾胜利姿态
{
  animation: 'celebration',
  duration: 2000,
  easing: 'elastic',
  effects: [
    'particle_explosion',
    'badge_appearance',
    'color_spectrum_cycle',
  ],
}
```

---

## 🎨 视觉效果详细设计

### 1. 核心球体 (Core Sphere)

**龙虾头部隐喻**

```typescript
{
  base: {
    radius: 50,
    color: stageColor.primary,
    gradient: 'radial',
    glow: false,
  },
  awakened: {
    radius: 50,
    color: stageColor.primary,
    gradient: 'radial + pulse',
    glow: { intensity: 0.3, blur: 20 },
  },
  learned: {
    radius: 52,
    color: stageColor.primary,
    gradient: 'radial + inner_core',
    glow: { intensity: 0.5, blur: 30 },
    innerCore: { radius: 30, opacity: 0.8 },
  },
  evolved: {
    radius: 55,
    color: stageColor.primary,
    gradient: 'complex_multi_layer',
    glow: { intensity: 0.7, blur: 40 },
    innerCore: { radius: 35, opacity: 0.9 },
    surface: 'bioluminescent',  // 生物发光
  },
}
```

### 2. 节点系统 (Claw Metaphor)

**龙虾钳子 - 技能获取**

```typescript
{
  node: {
    base: 0,
    awakened: 2,    // 一对钳子
    learned: 4,     // 双钳发展
    evolved: 8,     // 完整钳子系统

    layout: 'orbital_symmetric',
    orbitRadius: 80,

    node: {
      size: 10,
      shape: 'hexagon',    // 六边形 (科技感)
      pulse: true,          // 呼吸动画
      connection: 'lines_to_center',
    },
  },
}
```

### 3. 粒子系统 (Tentacle Metaphor)

**龙虾触须 - 感知连接**

```typescript
{
  particles: {
    count: 30,
    type: 'orbital',

    // 粒子类型混合
    types: [
      { type: 'dust', ratio: 0.6, size: 2, opacity: 0.5 },
      { type: 'spark', ratio: 0.3, size: 3, opacity: 0.8, glow: true },
      { type: 'orb', ratio: 0.1, size: 4, opacity: 1, trail: true },
    ],

    // 轨道运动
    motion: {
      type: 'lissajous',       // 利萨如图形 (有机感)
      speed: 'variable',      // 不同速度
      direction: 'mixed',     // 混合方向
    },

    // 进化时增强
    evolution: {
      base: { count: 10, speed: 1 },
      awakened: { count: 20, speed: 1.5 },
      learned: { count: 30, speed: 2 },
      evolved: { count: 50, speed: 2.5 },
    },
  },
}
```

### 4. 光晕效果 (Exoskeleton Metaphor)

**龙虾外骨骼 - 保护层**

```typescript
{
  glow: {
    type: 'radial_gradient',

    base: {
      enabled: false,
    },
    awakened: {
      enabled: true,
      radius: 100,
      opacity: 0.3,
      blur: 20,
      color: stageColor.primary,
      pulse: true,        // 呼吸光晕
    },
    learned: {
      enabled: true,
      radius: 120,
      opacity: 0.5,
      blur: 30,
      layers: 2,          // 多层光晕
    },
    evolved: {
      enabled: true,
      radius: 150,
      opacity: 0.6,
      blur: 40,
      layers: 3,
      bioluminescent: true,  // 生物发光效果
      pulse: 'complex',
    },
  },
}
```

### 5. 徽章 (Achievement Badge)

**龙虾蜕壳 - 进化证明**

```typescript
{
  badge: {
    enabled: 'evolved',
    position: 'top_center',
    offset: { y: -80 },

    design: {
      shape: 'hexagon_with_points',
      size: 30,
      color: '#FBBF24',      // 金色
      effects: [
        'rotate',
        'glow',
        'particle_emission',
      ],

      // 动画进入
      entrance: {
        type: 'scale_in + rotate',
        duration: 600,
        easing: 'elastic',
      },
    },
  },
}
```

---

## 📐 Remotion 组件实现

现在让我创建 Remotion 动画组件用于预渲染高质量动画...

