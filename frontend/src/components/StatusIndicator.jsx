import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck } from 'lucide-react';

export const StatusIndicator = ({ status, size = 'sm' }) => {
  const normalized = (status || 'on_track').toLowerCase();
  
  let bg = 'bg-stone-100';
  let text = 'text-ink-secondary';
  let border = 'border-stone-200';
  let label = status ? status.replace(/_/g, ' ') : 'Unknown';
  let Icon = Clock;

  switch (normalized) {
    case 'on_track':
    case 'resolved':
    case 'confirmed':
    case 'healthy':
    case 'executed':
      bg = 'bg-sticker-green-bg';
      text = 'text-sticker-green';
      border = 'border-sticker-green/20';
      Icon = CheckCircle2;
      break;

    case 'at_risk':
    case 'pending':
    case 'backup_candidate':
    case 'warning':
      bg = 'bg-sticker-orange-bg';
      text = 'text-sticker-orange';
      border = 'border-sticker-orange/20';
      Icon = AlertTriangle;
      break;

    case 'critical':
    case 'cancelled':
    case 'rejected':
    case 'failed':
      bg = 'bg-sticker-red-bg';
      text = 'text-sticker-red';
      border = 'border-sticker-red/20';
      Icon = XCircle;
      break;

    default:
      bg = 'bg-stone-100';
      text = 'text-ink-muted';
      border = 'border-stone-200';
      Icon = Clock;
  }

  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium tracking-normal border rounded-full uppercase transition-all duration-150 ${bg} ${text} ${border} ${
      isSmall ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
    }`}>
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="capitalize">{label}</span>
    </span>
  );
};

export default StatusIndicator;
