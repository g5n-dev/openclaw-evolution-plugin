import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { createAvatarManager, createSimpleRenderer } from '@openclaw-evolution/evolution-engine';

type AvatarStage = 'base' | 'awakened' | 'learned' | 'evolved';

export function AvatarPage() {
  const [stage, setStage] = useState<AvatarStage>('base');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarRef = useRef(createAvatarManager({ baseColor: '#3b82f6', size: 200 }));
  const rendererRef = useRef<ReturnType<typeof createSimpleRenderer> | null>(null);

  // 初始化渲染器
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const renderer = createSimpleRenderer({
      width: 400,
      height: 400,
      backgroundColor: '#0f172a',
    });

    renderer.initialize(canvasRef.current);
    rendererRef.current = renderer;

    // 启动动画循环
    renderer.startAnimation((progress: number) => ({
      stage: avatarRef.current.getStage(),
      mutations: avatarRef.current.getMutations(),
      animationProgress: progress,
      isAnimating: true,
    }));

    return () => {
      renderer.dispose();
    };
  }, []);

  // 更新 Avatar 状态
  useEffect(() => {
    avatarRef.current.evolveToStage(stage as any);
  }, [stage]);

  const stages: AvatarStage[] = ['base', 'awakened', 'learned', 'evolved'];

  const handleEvolve = () => {
    const currentIndex = stages.indexOf(stage);
    if (currentIndex < stages.length - 1) {
      setStage(stages[currentIndex + 1]);

      // 触发庆祝动画
      if (rendererRef.current) {
        const avatar = avatarRef.current;

        // 添加突变效果
        if (stage === 'base') {
          avatar.addMutations(['shell_glow']);
        } else if (stage === 'awakened') {
          avatar.addMutations(['node_expand']);
        } else if (stage === 'learned') {
          avatar.addMutations(['badge_attach']);
        }
      }
    }
  };

  const handleReset = () => {
    setStage('base');
    avatarRef.current.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evolution Avatar</h1>
        <p className="text-muted-foreground">Real-time Canvas 2D rendering with animation effects</p>
      </div>

      <div className="card p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Canvas Avatar */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="rounded-lg border-2 border-primary/20"
            />
          </div>

          {/* Stage info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold capitalize">{stage} Stage</h2>
            <p className="text-muted-foreground">
              {stage === 'base' && 'Initial OpenClaw state - Clean slate'}
              {stage === 'awakened' && 'System becomes self-aware'}
              {stage === 'learned' && 'Knowledge base grows'}
              {stage === 'evolved' && 'Fully optimized system'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-wrap justify-center">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  stage === s
                    ? 'bg-primary text-primary-foreground scale-105'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleEvolve}
              disabled={stage === 'evolved'}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-5 w-5" />
              {stage === 'evolved' ? 'Fully Evolved' : 'Evolve to Next'}
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Reset
            </button>
          </div>
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
          <p className="text-2xl font-bold">{avatarRef.current.getMutations().length}</p>
        </div>
      </div>

      {/* Mutation Info */}
      <div className="card p-6">
        <h3 className="font-semibold mb-3">Active Mutations</h3>
        <div className="flex flex-wrap gap-2">
          {avatarRef.current.getMutations().length > 0 ? (
            avatarRef.current.getMutations().map((mutation: string) => (
              <span key={mutation} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {mutation}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">No mutations yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
