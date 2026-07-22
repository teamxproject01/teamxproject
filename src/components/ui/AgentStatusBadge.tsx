import { AGENT_APP_STATUS_LABELS, AGENT_APPLICATION_STATUSES, AgentApplicationStatus } from '../../types';

const colorMap: Record<AgentApplicationStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  documents_required: 'bg-orange-100 text-orange-700',
  documents_approved: 'bg-green-100 text-green-700',
  sent_to_college: 'bg-cyan-100 text-cyan-700',
  offer_pending: 'bg-purple-100 text-purple-700',
  offer_received: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  enrolled: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

export function AgentAppStatusBadge({ status }: { status: AgentApplicationStatus }) {
  return (
    <span className={`badge ${colorMap[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {AGENT_APP_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function DocStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    required: 'bg-amber-100 text-amber-700',
    uploaded: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    missing: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    required: 'Required',
    uploaded: 'Uploaded',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    missing: 'Missing',
  };
  return <span className={`badge ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>{labels[status] ?? status}</span>;
}

export { AGENT_APPLICATION_STATUSES };
