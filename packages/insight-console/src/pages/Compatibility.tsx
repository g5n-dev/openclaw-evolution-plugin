import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CompatibilityInfo } from '../types';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export function CompatibilityPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['compatibility'],
    queryFn: () => api.getCompatibility(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="text-red-500">
        Error loading compatibility info: {data?.error || 'Unknown error'}
      </div>
    );
  }

  const info = data.data as CompatibilityInfo;

  const getCompatibilityIcon = () => {
    switch (info.compatibilityLevel) {
      case 'full':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
      case 'degraded':
        return <XCircle className="h-12 w-12 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compatibility</h1>
        <p className="text-muted-foreground">OpenClaw runtime compatibility information</p>
      </div>

      <div className="card p-8">
        <div className="flex items-center gap-6 mb-8">
          {getCompatibilityIcon()}
          <div>
            <h2 className="text-2xl font-bold capitalize">{info.compatibilityLevel} Compatibility</h2>
            <p className="text-muted-foreground">
              Plugin v{info.pluginVersion} • OpenClaw v{info.hostVersion}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-4">Supported Features</h3>
            <div className="space-y-2">
              {info.supportedFeatures.length === 0 ? (
                <p className="text-muted-foreground text-sm">No supported features</p>
              ) : (
                info.supportedFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Unsupported Features</h3>
            <div className="space-y-2">
              {info.unsupportedFeatures.length === 0 ? (
                <p className="text-muted-foreground text-sm">All features supported</p>
              ) : (
                info.unsupportedFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm capitalize">{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {info.degradedModes.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Degraded Modes</h3>
            <div className="space-y-2">
              {info.degradedModes.map((mode) => (
                <div key={mode.feature} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{mode.feature}</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fallback: {mode.fallback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
