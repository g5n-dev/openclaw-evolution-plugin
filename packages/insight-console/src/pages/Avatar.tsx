import { useState } from 'react';
import { Box, Sparkles, Zap } from 'lucide-react';

type AvatarStage = 'base' | 'awakened' | 'learned' | 'evolved';

export function AvatarPage() {
  const [stage, setStage] = useState<AvatarStage>('base');
  const [isAnimating, setIsAnimating] = useState(false);

  const stages: AvatarStage[] = ['base', 'awakened', 'learned', 'evolved'];

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evolution Avatar</h1>
        <p className="text-muted-foreground">Visual representation of OpenClaw evolution progress</p>
      </div>

      <div className="card p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Avatar Visualization */}
          <div className={`relative w-64 h-64 ${isAnimating ? 'animate-pulse' : ''}`}>
            {/* Simple SVG Avatar - will be replaced with Three.js */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Base circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill={`hsl(${210 + stages.indexOf(stage) * 20}, 70%, 50%)`}
                opacity="0.2"
              />

              {/* Core */}
              <circle
                cx="100"
                cy="100"
                r="50"
                fill={`hsl(${210 + stages.indexOf(stage) * 20}, 70%, 60%)`}
              />

              {/* Inner detail */}
              <circle
                cx="100"
                cy="100"
                r="30"
                fill={`hsl(${210 + stages.indexOf(stage) * 20}, 70%, 70%)`}
              />

              {/* Nodes based on stage */}
              {stages.indexOf(stage) >= 1 && (
                <>
                  <circle cx="50" cy="100" r="10" fill="currentColor" className="text-primary" />
                  <circle cx="150" cy="100" r="10" fill="currentColor" className="text-primary" />
                </>
              )}
              {stages.indexOf(stage) >= 2 && (
                <>
                  <circle cx="100" cy="50" r="10" fill="currentColor" className="text-primary" />
                  <circle cx="100" cy="150" r="10" fill="currentColor" className="text-primary" />
                </>
              )}
              {stages.indexOf(stage) >= 3 && (
                <>
                  <circle cx="50" cy="50" r="8" fill="currentColor" className="text-accent" />
                  <circle cx="150" cy="50" r="8" fill="currentColor" className="text-accent" />
                  <circle cx="50" cy="150" r="8" fill="currentColor" className="text-accent" />
                  <circle cx="150" cy="150" r="8" fill="currentColor" className="text-accent" />
                </>
              )}
            </svg>

            {/* Animation overlay */}
            {isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Stage info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold capitalize">{stage} Stage</h2>
            <p className="text-muted-foreground">
              {stage === 'base' && 'Initial OpenClaw state'}
              {stage === 'awakened' && 'First evolution activated'}
              {stage === 'learned' && 'Multiple skills acquired'}
              {stage === 'evolved' && 'Fully evolved system'}
            </p>
          </div>

          {/* Stage selector */}
          <div className="flex gap-2">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  stage === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Animation trigger */}
          <button
            onClick={triggerAnimation}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Zap className="h-5 w-5" />
            Trigger Animation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6 text-center">
          <p className="text-sm text-muted-foreground">Current Stage</p>
          <p className="text-2xl font-bold capitalize">{stage}</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-muted-foreground">Stage Progress</p>
          <p className="text-2xl font-bold">{stages.indexOf(stage) + 1} / 4</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-muted-foreground">Active Mutations</p>
          <p className="text-2xl font-bold">{stages.indexOf(stage) * 2}</p>
        </div>
      </div>
    </div>
  );
}
