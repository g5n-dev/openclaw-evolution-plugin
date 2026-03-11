import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { DashboardMetrics } from '../types';
import { formatNumber, formatPercent } from '../lib/utils';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.getDashboard(),
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
        Error loading dashboard: {data?.error || 'Unknown error'}
      </div>
    );
  }

  const metrics = data.data as DashboardMetrics;

  const statCards = [
    {
      title: 'Total Sessions',
      value: formatNumber(metrics.totalSessions),
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Events',
      value: formatNumber(metrics.totalEvents),
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'Candidates',
      value: formatNumber(metrics.totalCandidates),
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      title: 'Promoted Skills',
      value: formatNumber(metrics.promotedSkills),
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of evolution system activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Event Rate</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Hourly</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.eventRate.hourly)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Daily</p>
              <p className="text-2xl font-bold">{formatNumber(metrics.eventRate.daily)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Evaluation Score</h2>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {formatPercent(metrics.avgEvaluationScore)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Average Score</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
