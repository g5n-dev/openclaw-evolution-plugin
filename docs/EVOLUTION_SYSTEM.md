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

## MVP Implementation

For the MVP, we use:

- **Simple Canvas 2D Renderer** instead of Three.js
  - Faster implementation
  - Sufficient for core visualization
  - Easy to upgrade later

- **In-Memory Event Storage**
  - No database dependency
  - Session-scoped replay
  - Can upgrade to persistent storage

- **Basic Animation System**
  - No complex physics
  - Easing-based animations
  - Frame generation protocol ready

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
