import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { FunnelMetrics } from '../types';
import { formatNumber, formatPercent } from '../lib/utils';
import { ArrowRight } from 'lucide-react';

export function FunnelPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['funnel'],
    queryFn: () => api.getFunnel(),
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
        Error loading funnel: {data?.error || 'Unknown error'}
      </div>
    );
  }

  const metrics = data.data as FunnelMetrics;

  const stages = [
    { name: 'Events Captured', value: metrics.eventsCaptured, color: 'bg-blue-500' },
    { name: 'Candidates Detected', value: metrics.candidatesDetected, color: 'bg-green-500' },
    { name: 'Evaluations Run', value: metrics.evaluationsRun, color: 'bg-yellow-500' },
    { name: 'Cards Presented', value: metrics.cardsPresented, color: 'bg-orange-500' },
    { name: 'Skills Promoted', value: metrics.skillsPromoted, color: 'bg-purple-500' },
  ];

  const conversionRates = [
    { label: 'Event → Candidate', value: metrics.conversionRates.eventToCandidate },
    { label: 'Candidate → Evaluation', value: metrics.conversionRates.candidateToEvaluation },
    { label: 'Evaluation → Card', value: metrics.conversionRates.evaluationToCard },
    { label: 'Card → Promotion', value: metrics.conversionRates.cardToPromotion },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evolution Funnel</h1>
        <p className="text-muted-foreground">Track the evolution pipeline from events to promoted skills</p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">Pipeline Stages</h2>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <span className="text-sm text-muted-foreground">{formatNumber(stage.value)}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`${stage.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(stage.value / metrics.eventsCaptured) * 100}%` }}
                  />
                </div>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-6">Conversion Rates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {conversionRates.map((rate) => (
            <div key={rate.label} className="text-center">
              <p className="text-sm text-muted-foreground mb-1">{rate.label}</p>
              <p className="text-2xl font-bold">{formatPercent(rate.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
