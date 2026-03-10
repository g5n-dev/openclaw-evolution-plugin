# OpenClaw Evolution Plugin

A plugin-first evolution layer for OpenClaw v2026.3.x.

## Overview

OpenClaw Evolution Plugin enables continuous improvement of OpenClaw through:

- **Event Capture**: Captures runtime events for analysis
- **Candidate Detection**: Identifies potential improvements
- **Evaluation Framework**: Tests candidates before promotion
- **Evolution Cards**: User-decision interface for changes
- **Skill Registry**: Manages promoted skills and rules
- **Insight Console**: Visual dashboard for analytics

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  OpenClaw       │────▶│  Plugin Runtime  │────▶│ Evolution       │
│  v2026.3.x      │     │  (Event Bridge)  │     │ Service         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Evolution      │◀────│  Evolution       │◀────│  Insight        │
│  System         │     │  Cards           │     │  Console        │
│  (Avatar)       │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Packages

- **@openclaw-evolution/shared-types**: Shared TypeScript types
- **@openclaw-evolution/plugin-runtime**: OpenClaw plugin
- **@openclaw-evolution/evolution-service**: Evolution API & engines
- **@openclaw-evolution/insight-console**: Web dashboard (React + Vite)
- **@openclaw-evolution/evolution-engine**: Avatar & animation system (Three.js)

## Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Development

```bash
# Start evolution service
pnpm --filter @openclaw-evolution/evolution-service start

# Start insight console
pnpm --filter @openclaw-evolution/insight-console dev

# Run type checking
pnpm typecheck
```

## Documentation

- [PRD](./docs/PRD.md) - Product Requirements
- [ARCHITECTURE](./docs/ARCHITECTURE.md) - System Architecture
- [EVENT_SCHEMA](./docs/EVENT_SCHEMA.md) - Event Types
- [COMPATIBILITY](./docs/COMPATIBILITY.md) - Compatibility Strategy
- [EVOLUTION_SYSTEM](./docs/EVOLUTION_SYSTEM.md) - Avatar System

## OpenClaw Version Compatibility

- **Minimum**: v2026.3.0
- **Tested**: v2026.3.8
- **Adapter**: Automatic compatibility negotiation

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Status

🚧 **Alpha Development** - Active development in progress.

- ✅ Phase 1: Project Structure
- ✅ Phase 2: Plugin Runtime
- ✅ Phase 3: Evolution Service MVP
- ⏳ Phase 4: Insight Console (pending)
- ⏳ Phase 5: Evolution System (pending)
- ⏳ Phase 6: Testing (pending)
