'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrackBar({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  const [value, setValue] = useState('');
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const t = value.trim().toUpperCase();
    if (t) router.push(`/track/${t}`);
  }

  return (
    <form onSubmit={go} className={cn('flex gap-2 w-full max-w-xl mx-auto', className)}>
      <div className="relative flex-1">
        <Package className={cn('absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4', dark ? 'text-white/50' : 'text-gray-400')} />
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="N° de suivi — ex: FS-FR-20250315-00042"
          className={cn(
            'w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-all',
            dark
              ? 'bg-white/15 border border-white/25 text-white placeholder-white/50 focus:ring-white/30 focus:bg-white/20'
              : 'bg-white border border-surface-border text-gray-900 placeholder-gray-400 focus:ring-primary-400 shadow-card',
          )}
        />
      </div>
      <button
        type="submit"
        className="bg-[#F26E22] hover:bg-[#F2561D] text-white font-bold px-5 py-3.5 rounded-2xl transition-colors flex items-center gap-2 whitespace-nowrap shadow-orange text-sm"
      >
        <Search className="w-4 h-4" /> Suivre
      </button>
    </form>
  );
}
