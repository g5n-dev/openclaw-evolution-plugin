# CLAUDE.md

## Project
OpenClaw Evolution Plugin

## Mission
Build a plugin-first evolution layer for OpenClaw.

This project should start as an OpenClaw-native plugin, not as a standalone platform. The first goal is to create a working closed loop:

event capture -> evaluation trigger -> candidate improvement -> evolution card -> decision -> registry/update

A second goal is to implement the OpenClaw Evolution System, which is the visual and stateful evolution layer of OpenClaw:
- initialize an OpenClaw Avatar
- evolve avatar stages over time
- trigger runtime evolution animations
- persist evolution events for replay and insight analysis

---

## Core Product Scope

### 1. OpenClaw Evolution Plugin
The plugin must:
- run as an OpenClaw plugin
- listen to conversation and tool events
- normalize and forward events to Evolution Service
- request evaluation when triggers match
- receive and render evolution cards
- support compatibility handshake with the host runtime

### 2. Evolution Service
The service must:
- receive runtime events
- create candidate improvements
- orchestrate evaluations
- generate evolution card suggestions
- register promoted skills/rules/memory
- support rollout and rollback
- expose compatibility and insight APIs

### 3. Insight Console
The console must visualize:
- dashboard metrics
- evolution funnel
- candidate improvements
- evaluation runs
- skill registry
- compatibility status
- evolution events for avatar and animation

### 4. OpenClaw Evolution System
This subsystem must:
- manage OpenClaw Avatar states
- process evolution animation events
- expose a stable runtime animation protocol
- support replay-ready event persistence

---

## Build Order

Always follow this implementation order:

1. plugin skeleton
2. runtime handshake and compatibility layer
3. event bridge and normalized event schema
4. evolution service APIs
5. evolution cards
6. skill/memory/rule registry
7. insight console MVP
8. OpenClaw Evolution System MVP
9. rollout/rollback
10. advanced automation only after the above is stable

Do not jump to advanced autonomous evolution before the core loop is working.

---

## Product Principles

### Plugin-first
Do not start with a large standalone platform. Start with a working plugin.

### Event-first
Do not overbuild intelligence before event capture is reliable.

### Explicit decisions first
Important changes should require explicit confirmation in MVP. Do not silently promote global skills by default.

### Evaluation before persistence
No long-term persistence without evaluation or explicit confirmation.

### Compatibility-aware
All plugin behavior must tolerate OpenClaw upgrades through a compatibility layer.

### Visual evolution must be stateful
Animation is not decoration. It must reflect actual system state changes.

---

## Architecture Constraints

Use a monorepo.

Recommended structure:

/openclaw-evolution-plugin
  /packages
    /plugin-runtime
    /evolution-service
    /insight-console
    /evolution-engine
    /shared-types
  /docs
    PRD.md
    ARCHITECTURE.md
    EVENT_SCHEMA.md
    COMPATIBILITY.md
    EVOLUTION_SYSTEM.md
  /examples
  /scripts
  /tests

---

## Required APIs

Implement at least these endpoints:

### Runtime
POST /v1/runtime/handshake

### Events
POST /v1/events

### Candidates
POST /v1/candidates

### Evaluations
POST /v1/evaluations/run

### Cards
GET /v1/cards?session_id=...
POST /v1/cards/{card_id}/decision

### Skills
POST /v1/skills/promote
POST /v1/skills/rollback

### Insights
GET /v1/insights/dashboard
GET /v1/insights/funnel
GET /v1/insights/skills
GET /v1/insights/compatibility

---

## Event Model

The plugin runtime must normalize and forward these core event types:

- user_message
- assistant_response
- tool_call
- tool_result
- feedback
- correction
- session_end
- candidate_detected
- evaluation_started
- evaluation_passed
- evaluation_failed
- skill_promoted
- skill_rolled_back
- memory_saved
- card_presented
- card_decision

The OpenClaw Evolution System must also support visual/evolution event types:

- avatar_initialized
- avatar_stage_changed
- animation_triggered
- mutation_applied
- replay_event_logged

---

## OpenClaw Compatibility Requirements

Create a CompatibilityManager.

Responsibilities:
- detect host version
- load capability profile
- choose adapter profile
- map event fields across versions
- support degraded modes if needed
- expose compatibility status to Insight Console

If inline card rendering is unavailable, degrade to:
- sidebar card
- console review item
- external H5 card link

Never hardcode only one host version assumption.

---

## OpenClaw Evolution System Requirements

The visual system should be called OpenClaw Evolution System.

### Core concepts
- OpenClaw Avatar
- OpenClaw State Machine
- Evolution Event Protocol
- Evolution Replay

### Minimum avatar stages
- base
- awakened
- learned
- evolved

### Minimum runtime animation types
- pulse
- evaluating
- activation

### Example visual event
{
  "event": "skill_promoted",
  "fromStage": "learned",
  "toStage": "evolved",
  "mutations": ["shell_glow", "node_expand", "badge_attach"],
  "intensity": "high"
}

All visual changes must be event-driven and stateful.

---

## Coding Standards

- Prefer TypeScript for shared interfaces and runtime/plugin code.
- Keep API contracts explicit and versioned.
- Keep types centralized in /shared-types.
- Avoid hidden coupling between plugin runtime and console UI.
- Prefer composition over framework lock-in.
- Keep compatibility logic isolated.
- Keep animation protocol independent from rendering engine choice.

---

## Documentation Standards

Any significant implementation must update docs.

At minimum keep these files current:
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/EVENT_SCHEMA.md
- docs/COMPATIBILITY.md
- docs/EVOLUTION_SYSTEM.md

If an API changes, update examples.

If a UI flow changes, update the relevant docs.

If animation state changes, update the evolution system docs.

---

## Testing Standards

A task is not done unless:
1. code is implemented
2. typecheck passes
3. tests pass
4. docs are updated
5. example payloads exist for APIs
6. UI changes have a basic demo or screenshot
7. evolution/animation changes document state -> event -> result

At minimum include:
- unit tests for event normalization
- tests for trigger logic
- tests for card decision flow
- tests for compatibility mapping
- tests for avatar state transitions

---

## Team Workflow

Split work into clear modules:
- Plugin Architect
- Runtime/Event Engineer
- Evolution Service Engineer
- Insight Frontend Engineer
- OpenClaw Evolution System Engineer
- QA/Release Engineer

Parallelize where possible, but maintain a single source of truth for:
- shared types
- event schema
- compatibility contracts

---

## Completion Behavior

Never claim completion early.

Before marking a milestone complete:
- run typecheck
- run tests
- verify docs updated
- verify examples still work

If something is partial, state clearly what is complete and what is missing.

---

## What Not To Do

Do not:
- start with a giant autonomous self-evolving platform
- tightly couple to one OpenClaw version
- bury logic in UI-only components
- store unevaluated improvements as global truth
- treat animation as cosmetic only
- skip docs because the code “is obvious”
- mark tasks done without verification

---

## Milestone Targets

### Milestone 1
- plugin skeleton
- manifest/config
- runtime handshake
- basic event bridge

### Milestone 2
- evolution service MVP
- trigger engine
- evaluator stub
- cards API
- plugin card rendering

### Milestone 3
- insight console MVP
- dashboard
- candidate review
- skill registry
- compatibility page

### Milestone 4
- OpenClaw Evolution System MVP
- avatar base asset
- 4-stage state machine
- runtime animation events

### Milestone 5
- compatibility manager
- adapter mapping
- degraded rendering
- compatibility report

### Milestone 6
- tests
- docs
- example flows
- integrated demo

---

## Final Goal
The final outcome is not “a smarter chatbot”.

It is a plugin-native, evaluation-driven, insight-visible, compatibility-aware evolution layer for OpenClaw, where useful improvements can be detected, assessed, reviewed, activated, visualized, and replayed.
