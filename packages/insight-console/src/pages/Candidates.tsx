import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { formatRelativeTime } from '../lib/utils';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

type CandidateStatus = 'pending' | 'evaluating' | 'approved' | 'rejected';

interface Candidate {
  candidateId: string;
  sessionId: string;
  candidateType: string;
  status: CandidateStatus;
  description: string;
  confidence: number;
  createdAt: number;
}

export function CandidatesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates({ limit: 50 }),
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
        Error loading candidates: {data?.error || 'Unknown error'}
      </div>
    );
  }

  const response = data.data as { candidates: Candidate[]; count: number };
  const candidates = response.candidates;

  const getStatusIcon = (status: CandidateStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'evaluating':
        return <Loader className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">Potential improvements detected from runtime events</p>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Description</th>
                <th className="text-left p-4 font-medium">Confidence</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.candidateId} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {candidate.candidateType}
                      </span>
                    </td>
                    <td className="p-4">{candidate.description}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${candidate.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(candidate.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(candidate.status)}
                        <span className="capitalize text-sm">{candidate.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatRelativeTime(candidate.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
