import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      <span className="text-xs text-slate-400 font-medium tracking-wide">
        Loading Doubtly...
      </span>
    </div>
  );
}

