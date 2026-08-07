interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'slate';
  className?: string;
}

const variants = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  slate: 'bg-slate-100 text-slate-600',
};

export default function Badge({ children, variant = 'blue', className = '' }: BadgeProps) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    draft: 'slate',
    submitted: 'blue',
    under_review: 'amber',
    approved: 'green',
    rejected: 'red',
    withdrawn: 'slate',
    pending: 'amber',
    verified: 'green',
    expired: 'red',
    documents_required: 'amber',
    offer_letter_sent: 'blue',
    waiting_for_signature: 'amber',
    offer_accepted: 'green',
    waiting_for_payment: 'amber',
    paid_coe_issued: 'green',
    enrolled: 'green',
    cancelled: 'slate',
  };

  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    pending: 'Pending',
    verified: 'Verified',
    expired: 'Expired',
    documents_required: 'Documents Required',
    offer_letter_sent: 'Offer Letter Sent',
    waiting_for_signature: 'Waiting for Signature',
    offer_accepted: 'Offer Accepted',
    waiting_for_payment: 'Waiting for Payment',
    paid_coe_issued: 'Paid / COE Issued',
    enrolled: 'Enrolled',
    cancelled: 'Cancelled',
  };

  return (
    <Badge variant={map[status] ?? 'slate'}>
      {labels[status] ?? status}
    </Badge>
  );
}
