import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import {
  createAvatarManager,
  createSimpleRenderer,
  createProfessionalRenderer,
  createA2UIRenderer,
  type AvatarStage,
} from '@openclaw-evolution/evolution-engine';

type RendererType = 'simple' | 'professional' | 'a2ui';

export function AvatarPage() {
  const [stage, setStage] = useState<AvatarStage>('base');
  const [rendererType, setRendererType] = useState<RendererType>('professional');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarRef = useRef(createAvatarManager({ baseColor: '#3b82f6', size: 200 }));
  const rendererRef = useRef<ReturnType<typeof createSimpleRenderer> | ReturnType<typeof createProfessionalRenderer> | ReturnType<typeof createA2UIRenderer> | null>(null);

  // 初始化渲染器
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    let renderer: ReturnType<typeof createSimpleRenderer> | ReturnType<typeof createProfessionalRenderer> | ReturnType<typeof createA2UIRenderer>;

    switch (rendererType) {
      case 'professional':
        renderer = createProfessionalRenderer({
          width: 400,
          height: 400,
          backgroundColor: '#0B0B10',  // Deep Space Black
        });
        break;
      case 'a2ui':
        renderer = createA2UIRenderer({
          width: 400,
          height: 400,
          backgroundColor: '#0B0B10',
          registry: {
            register: () => {},
            get: () => undefined,
            getAvailableTypes: () => [],
            has: () => false,
            unregister: () => {},
          },
          enableIncrementalUpdates: true,
        });
        break;
      default:
        renderer = createSimpleRenderer({
          width: 400,
          height: 400,
          backgroundColor: '#0f172a',
        });
    }

    renderer.initialize(canvasRef.current);
    rendererRef.current = renderer;

    // 启动动画循环
    if (rendererType === 'professional' || rendererType === 'a2ui') {
      (renderer as ReturnType<typeof createProfessionalRenderer>).startAnimation((progress: number, time: number) => ({
        stage: avatarRef.current.getStage(),
        mutations: avatarRef.current.getMutations(),
        animationProgress: progress,
        isAnimating: true,
        time,
      }));
    } else {
      (renderer as ReturnType<typeof createSimpleRenderer>).startAnimation((progress: number) => ({
        stage: avatarRef.current.getStage(),
        mutations: avatarRef.current.getMutations(),
        animationProgress: progress,
        isAnimating: true,
      }));
    }

    return () => {
      renderer.dispose();
    };
  }, [rendererType]);

  // 更新 Avatar 状态
  useEffect(() => {
    avatarRef.current.evolveToStage(stage);
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
        <p className="text-muted-foreground">
          {rendererType === 'professional'
            ? '🦞 Professional rendering with organic evolution effects'
            : rendererType === 'a2ui'
            ? '🎨 A2UI declarative rendering with incremental updates'
            : 'Real-time Canvas 2D rendering with animation effects'}
        </p>
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
          <div className="flex gap-3 flex-wrap justify-center">
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

            <button
              onClick={() => {
                const types: RendererType[] = ['simple', 'professional', 'a2ui'];
                const currentIndex = types.indexOf(rendererType);
                const nextIndex = (currentIndex + 1) % types.length;
                setRendererType(types[nextIndex]);
              }}
              className={`px-6 py-3 rounded-lg transition-colors ${
                rendererType === 'simple'
                  ? 'bg-secondary text-secondary-foreground'
                  : rendererType === 'professional'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              }`}
            >
              {rendererType === 'simple' ? 'Simple Mode' : rendererType === 'professional' ? '✨ Pro Mode' : '🎨 A2UI Mode'}
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
