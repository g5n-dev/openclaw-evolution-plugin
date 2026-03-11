# OpenClaw Evolution System

## Overview

The OpenClaw Evolution System is the visual and stateful evolution layer of OpenClaw. It provides real-time visual feedback about the system's evolution progress through Avatar stages and animations.

## Core Concepts

### Avatar

The Avatar is the visual representation of OpenClaw's evolution state. It progresses through four stages:

1. **Base**: Initial state - clean slate, no accumulated knowledge
2. **Awakened**: First evolution triggered - system becomes self-aware
3. **Learned**: Multiple skills acquired - knowledge base grows
4. **Evolved**: Peak performance - fully optimized system

Each stage has distinct visual characteristics:
- **Color progression**: Blue → Purple → Pink
- **Node count**: 0 → 2 → 4 → 8 (representing skill connections)
- **Particle effects**: Increasing number and complexity
- **Glow intensity**: Growing ambient effect

### Mutations

Mutations are visual changes applied to the Avatar during evolution:

| Mutation | Description | Stage |
|----------|-------------|-------|
| `shell_glow` | Ambient glow effect appears | Awakened+ |
| `node_expand` | Network nodes expand outward | Learned+ |
| `badge_attach` | Achievement badge displayed | Evolved |
| `color_shift` | Hue shifts through spectrum | Evolved |
| `particle_emit` | Particle burst effects | Evolved |
| `geometry_transform` | Shape morphing | Evolved |

### State Machine

The Avatar State Machine manages:

1. **Stage Transitions**
   - Validates evolution requests
   - Enforces forward-only progression
   - Tracks transition history

2. **Animation Triggers**
   - Responds to system events
   - Controls animation intensity
   - Manages animation lifecycle

3. **State Serialization**
   - Exports complete state for replay
   - Maintains event history
   - Enables rollback capability

### Animation Protocol

Animations follow a structured protocol:

```typescript
interface AnimationProtocol {
  type: AnimationType;      // pulse, evaluating, activation, mutation, celebration, error
  intensity: AnimationIntensity; // low, medium, high
  duration: number;            // milliseconds
  easing: EasingFunction;      // linear, easeIn, easeOut, easeInOut, elastic
  loop: boolean;
  interruptible: boolean;
}
```

**Animation Types**:
- **Pulse**: Gentle pulsing effect (idle state)
- **Evaluating**: Active evaluation indication
- **Activation**: New skill activation
- **Mutation**: Evolution mutation occurring
- **Celebration**: Successful evolution
- **Error**: Error state indication

**Intensity Levels**:
- **Low**: Subtle effects, minimal distraction
- **Medium**: Balanced visibility
- **High**: Prominent effects, clear feedback

### Replay System

The replay system enables:

1. **Event Logging**
   - All evolution events captured
   - Avatar snapshots at key moments
   - Timestamp-synchronized recording

2. **Replay Playback**
   - Play/pause/stop controls
   - Speed adjustment (0.5x - 2x)
   - Progress-based navigation
   - Event callbacks for visualization

3. **Data Export**
   - JSON format for storage
   - Complete session reconstruction
   - Shareable replay files

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Avatar Manager                      │
│  - Current stage tracking                              │
│  - Mutation collection                                 │
│  - Evolution history                                    │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│ State Machine    │    │   Replay Logger      │
│ - Transitions    │    │ - Event recording   │
│ - Animations     │    │ - Snapshots         │
└─────────────────┘    └─────────────────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌─────────────────────┐
         │   Renderer (MVP)     │
         │ - Canvas 2D rendering│
         │ - Animation loop     │
         │ - Visual effects     │
         └─────────────────────┘
```

## Usage Example

```typescript
import { createAvatarManager } from '@openclaw-evolution/evolution-engine';

// Create avatar
const avatar = createAvatarManager({
  baseColor: '#3b82f6',
  size: 200,
});

// Get current state
const state = avatar.getState();
console.log(state.currentStage); // 'base'

// Evolve to next stage
avatar.evolveToStage('awakened');

// Add mutations
avatar.addMutations(['particle_emit', 'color_shift']);

// Reset if needed
avatar.reset();
```

## Integration Points

### With Plugin Runtime

1. **Event Bridge → Replay Logger**
   - All events logged for replay
   - Avatar snapshots on stage changes

2. **State Machine → Animation Protocol**
   - Triggers animations based on events
   - Controls animation timing

3. **Avatar → Insight Console**
   - Real-time state updates
   - Visual feedback in UI

### With Evolution Service

1. **Skill Promotion → Avatar Evolution**
   - Successful promotions trigger stage checks
   - Automatic evolution when thresholds met

2. **Evaluation Events → Animations**
   - Evaluation started → 'evaluating' animation
   - Evaluation passed → 'celebration' animation
   - Evaluation failed → 'error' animation

## Rendering Systems

### Simple Renderer (MVP)

The Simple Renderer is a lightweight Canvas 2D implementation:

- **Fast implementation** - Minimal setup time
- **Core visualization** - Sufficient for basic Avatar display
- **Easy upgrade path** - Can be replaced with advanced renderer

**Features**:
- Basic circle-based Avatar
- Simple color transitions
- Minimal particle effects
- Basic glow effects

### Professional Renderer 🦞

The Professional Renderer is an advanced Canvas 2D implementation with organic, lobster-inspired design:

**Design Philosophy: Lobster Metaphor**

| Lobster Feature | System Representation | Visual Effect |
|----------------|----------------------|---------------|
| **Segmented Body** | 4 Evolution Stages | Blue → Purple → Violet → Pink gradient |
| **Claws** | Skill Nodes | 2 → 4 → 8 orbiting nodes in symmetric rotation |
| **Exoskeleton** | Protection Layer | Multi-layer breathing glow effects |
| **Tentacles** | Sensory Connection | Lissajous curve organic particle motion |
| **Molting** | Evolution Breakthrough | Particle burst + morphing animation |

**Technical Features**:

```typescript
// Stage Configuration
{
  base: {
    primary: '#3B82F6',      // Blue - Potential
    secondary: '#60A5FA',
    particles: 10,
    nodes: 0,
  },
  awakened: {
    primary: '#8B5CF6',      // Purple - Awakening
    secondary: '#A78BFA',
    particles: 20,
    nodes: 2,
    glow: { enabled: true, pulse: true },
  },
  learned: {
    primary: '#A855F7',      // Violet - Learning
    secondary: '#C084FC',
    particles: 30,
    nodes: 4,
    glow: { layers: 2 },
    innerCore: 30,
  },
  evolved: {
    primary: '#EC4899',      // Pink - Fully Evolved
    secondary: '#F472B6',
    particles: 50,
    nodes: 8,
    glow: { layers: 3, bioluminescent: true },
  },
}
```

**Animation Effects**:

1. **Lissajous Curve Particles**
   ```typescript
   // Organic, non-repeating motion
   const angleX = 3 * delta + (i * 0.1);
   const angleY = 2 * delta;
   const orbitRadius = 60 + Math.sin(delta + i) * 20;
   ```

2. **Multi-Layer Glow System**
   - Breathing pulse animation
   - Radial gradient with opacity fade
   - Stage-dependent intensity

3. **Bioluminescent Effects** (Evolved stage only)
   - Golden glow ring
   - Sine-wave pulsing
   - High-frequency animation

4. **Rotating Hexagon Badge** (Evolved stage)
   - Achievement indicator
   - Continuous rotation
   - Gradient fill with shadow glow

**Usage**:

```typescript
import { createProfessionalRenderer } from '@openclaw-evolution/evolution-engine';

const renderer = createProfessionalRenderer({
  width: 400,
  height: 400,
  backgroundColor: '#0B0B10',  // Deep Space Black
});

renderer.initialize(canvasElement);

renderer.startAnimation((progress: number, time: number) => ({
  stage: avatar.getStage(),
  mutations: avatar.getMutations(),
  animationProgress: progress,
  isAnimating: true,
  time,
}));
```

**Renderer Comparison**:

| Feature | Simple | Professional |
|---------|--------|-------------|
| Implementation Time | 2 hours | 8 hours |
| Visual Quality | Basic | Advanced |
| Performance | Excellent | Good (60 FPS) |
| Code Complexity | Low | Medium |
| Animation Effects | 3 basic | 10+ advanced |
| Particle Count | 10 fixed | 10-50 dynamic |
| Customization | Limited | Extensive |
| Production Ready | Yes | Yes |

## MVP Implementation

For the MVP, we provide both renderers:

- **Simple Canvas 2D Renderer** (Default)
  - Fast implementation
  - Sufficient for core visualization
  - Low resource usage

- **Professional Renderer** (Optional)
  - Enhanced visual experience
  - Organic, lobster-inspired design
  - Advanced animation effects
  - Toggle between renderers in UI

- **In-Memory Event Storage**
  - No database dependency
  - Session-scoped replay
  - Can upgrade to persistent storage

- **Basic Animation System**
  - Easing-based animations
  - Frame generation protocol ready
  - Support for both renderers

## Future Enhancements

1. **Three.js Renderer**
   - True 3D visualization
   - Complex particle systems
   - Shader-based effects

2. **Persistent Replay Storage**
   - Database-backed event storage
   - Shareable replay files
   - Cloud-based replay distribution

3. **Advanced Animations**
   - Physics-based particle systems
   - Procedural animation generation
   - Multi-layer composition

## Technical Details

### State Transitions

Stage evolution is strictly forward-only:
```
base → awakened → learned → evolved
```

Cannot skip stages (must evolve sequentially).

### Event Flow

```
System Event
    ↓
Replay Logger captures
    ↓
Avatar State Machine processes
    ↓
Animation Protocol generates frames
    ↓
Renderer visualizes
```

### Performance Considerations

- **Animation Frame Rate**: 60 FPS target
- **Replay Storage**: Approx 1KB per event
- **Memory Footprint**: < 50MB for typical session
- **CPU Usage**: Canvas rendering optimized with requestAnimationFrame
