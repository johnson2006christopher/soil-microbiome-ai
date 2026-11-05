import React from 'react';
import { Sprout } from './illustrations/SpotIllustrations';

// Friendly empty state: what is missing, plus an optional next action
export default function EmptyState({ title, body, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center text-center rounded-2xl border border-dashed border-primary-200 bg-mist/60 ${compact ? 'px-4 py-6' : 'px-6 py-10'}`}>
      <Sprout className={compact ? 'w-20 h-auto' : 'w-28 h-auto'} />
      <p className="mt-3 font-display font-semibold text-mlima">{title}</p>
      {body && <p className="mt-1 text-sm text-ink/65 max-w-sm">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
