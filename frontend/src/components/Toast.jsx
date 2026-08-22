import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { message, type = 'info', title } = toast;

  let bg = 'bg-white border-stone-200 text-ink';
  let Icon = Info;
  let iconColor = 'text-primary';

  if (type === 'success') {
    bg = 'bg-white border-sticker-green/30 text-ink';
    Icon = CheckCircle2;
    iconColor = 'text-sticker-green';
  } else if (type === 'error') {
    bg = 'bg-white border-sticker-red/30 text-ink';
    Icon = XCircle;
    iconColor = 'text-sticker-red';
  } else if (type === 'warning' || type === 'loading') {
    bg = 'bg-white border-sticker-orange/30 text-ink';
    Icon = AlertTriangle;
    iconColor = 'text-sticker-orange';
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-elevated max-w-md ${bg}`}>
        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
          <Icon className={`w-5 h-5 ${type === 'loading' ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1 pr-2">
          {title && <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-0.5">{title}</h4>}
          <p className="text-sm font-medium text-ink">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-ink-faint hover:text-ink transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
