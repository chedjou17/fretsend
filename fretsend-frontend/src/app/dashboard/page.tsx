'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { Package, CheckCircle, AlertCircle, TrendingUp, Activity, Clock } from 'lucide-react';
import { pkgApi, trackApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { useDashboardSocket } from '@/lib/socket';
import { STATUS_LABEL, STATUS_COLOR, STATUS_ICON, fmtDateTime, formatPrice, type PackageStatus } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [liveEvents, setLive] = useState<any[]>([]);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['global-stats'],
    queryFn:  () => trackApi.globalStats(),
  });
  const { data: monthly } = useQuery({
    queryKey: ['monthly-stats'],
    queryFn:  () => trackApi.monthlyStats(),
  });
  const { data: recent } = useQuery({
    queryKey: ['packages', { limit: 8 }],
    queryFn:  () => pkgApi.list({ limit: 8 }),
  });

  useDashboardSocket((upd) => {
    setLive(prev => [upd, ...prev].slice(0, 8));
    toast.info(`${STATUS_ICON[upd.status as PackageStatus] || '📦'} ${upd.trackingNumber} → ${STATUS_LABEL[upd.status as PackageStatus]}`, { duration: 3000 });
    refetchStats();
  });

  const s = stats as any;
  const isAgent = profile?.role === 'agent';

  const kpis = [
    { label:'Total colis',  value:s?.total_all??'—',          icon:Package,      bg:'bg-blue-50',    icon_c:'text-[#1C4AA6]', sub:`+${s?.created_today??0} aujourd'hui` },
    { label:'En transit',   value:s?.total_in_transit??'—',   icon:TrendingUp,   bg:'bg-amber-50',   icon_c:'text-amber-600', sub:'' },
    { label:'Disponibles',  value:s?.total_available??'—',    icon:AlertCircle,  bg:'bg-emerald-50', icon_c:'text-emerald-600', sub:'En attente de retrait' },
    { label:'Livrés',       value:s?.total_delivered??'—',    icon:CheckCircle,  bg:'bg-green-50',   icon_c:'text-green-600', sub:`+${s?.delivered_today??0} aujourd'hui` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-title">Bonjour, {profile?.first_name} 👋</h1>
        <p className="page-sub">
          {isAgent ? `Agent — ${profile?.agency?.name}` : 'Tableau de bord FretSend'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="kpi-card">
            <div className={`w-11 h-11 rounded-2xl ${k.bg} flex items-center justify-center`}>
              <k.icon className={`w-5 h-5 ${k.icon_c}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{k.value}</p>
              <p className="text-sm text-gray-500">{k.label}</p>
              {k.sub && <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1C4AA6]" /> Volume mensuel 2025
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={(monthly as any) || []}>
              <defs>
                <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C4AA6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1C4AA6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26E22" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#F26E22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid #e5e7eb',fontSize:'12px'}}/>
              <Area type="monotone" dataKey="total"     stroke="#1C4AA6" fill="url(#gT)" name="Total"  strokeWidth={2}/>
              <Area type="monotone" dataKey="delivered" stroke="#F26E22" fill="url(#gD)" name="Livrés" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live feed */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#F26E22] animate-pulse" /> Activité live
          </h2>
          {liveEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Clock className="w-8 h-8 mb-2 opacity-30"/>
              <p className="text-xs">En attente d'événements…</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {liveEvents.map((ev, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-[#F2F2F2] rounded-xl text-xs">
                  <span className="text-base">{STATUS_ICON[ev.status as PackageStatus]||'📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-[#1C4AA6] truncate">{ev.trackingNumber}</p>
                    <p className="text-gray-500">{STATUS_LABEL[ev.status as PackageStatus]||ev.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent packages */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h2 className="font-bold text-gray-800">
            {isAgent ? 'Mes colis récents' : 'Colis récents'}
          </h2>
          <Link href="/dashboard/packages" className="text-sm text-[#1C4AA6] font-semibold hover:underline">Voir tout →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['N° Suivi','Expéditeur','Destinataire','Trajet','Transport','Statut','Date'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {(recent as any)?.data?.map((p: any) => (
                <tr key={p.id} className="hover:bg-[#F2F2F2] transition-colors">
                  <td className="td">
                    <Link href={`/dashboard/packages/${p.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{p.tracking_number}</Link>
                  </td>
                  <td className="td"><div className="text-xs font-semibold">{p.sender_name}</div><div className="text-xs text-gray-400">{p.sender_phone}</div></td>
                  <td className="td"><div className="text-xs font-semibold">{p.recipient_name}</div><div className="text-xs text-gray-400">{p.recipient_phone}</div></td>
                  <td className="td text-xs text-gray-500">{p.origin_city} → {p.destination_city}</td>
                  <td className="td text-sm">{p.transport_type==='air'?'✈️':'🚢'}</td>
                  <td className="td"><span className={`badge ${STATUS_COLOR[p.status as PackageStatus]}`}>{STATUS_ICON[p.status as PackageStatus]} {STATUS_LABEL[p.status as PackageStatus]}</span></td>
                  <td className="td text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(p.created_at)}</td>
                </tr>
              ))}
              {!(recent as any)?.data?.length && (
                <tr><td colSpan={7} className="td text-center py-12 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30"/>Aucun colis
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
