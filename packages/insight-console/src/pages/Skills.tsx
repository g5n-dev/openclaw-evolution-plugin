import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { formatRelativeTime } from '../lib/utils';
import { CheckCircle, Trash2 } from 'lucide-react';

interface Skill {
  skillId: string;
  skillName: string;
  skillType: string;
  version: string;
  status: string;
  createdAt: number;
}

export function SkillsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.getSkills({ limit: 50 }),
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
        Error loading skills: {data?.error || 'Unknown error'}
      </div>
    );
  }

  const response = data.data as { skills: Skill[]; count: number };
  const skills = response.skills;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skills Registry</h1>
        <p className="text-muted-foreground">Promoted skills and rules currently active in the system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.length === 0 ? (
          <div className="col-span-full card p-8 text-center text-muted-foreground">
            No skills registered yet
          </div>
        ) : (
          skills.map((skill) => (
            <div key={skill.skillId} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{skill.skillName}</h3>
                  <p className="text-sm text-muted-foreground">v{skill.version}</p>
                </div>
                {skill.status === 'active' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Trash2 className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{skill.skillType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">{skill.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatRelativeTime(skill.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
