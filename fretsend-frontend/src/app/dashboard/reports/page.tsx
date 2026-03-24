'use client';
import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp, BarChart2 } from 'lucide-react';
import { trackApi, pkgApi } from '@/lib/api';
import { STATUS_LABEL, formatPrice, downloadCSV, type PackageStatus } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BRAND_COLORS = ['#1C4AA6','#F26E22','#F2561D','#F2C49B','#27AE60','#8B5CF6'];

export default function ReportsPage() {
  const { data: stats }   = useQuery({ queryKey:['global-stats'],  queryFn:()=>trackApi.globalStats() });
  const { data: monthly } = useQuery({ queryKey:['monthly-stats'], queryFn:()=>trackApi.monthlyStats() });
  const { data: all }     = useQuery({ queryKey:['packages',{}],   queryFn:()=>pkgApi.list({ limit:1000 }) });

  const s = stats as any;

  const pieData = s ? [
    { name:'Créés',       value:s.total_created     ||0 },
    { name:'Transit',     value:s.total_in_transit  ||0 },
    { name:'Disponibles', value:s.total_available   ||0 },
    { name:'Livrés',      value:s.total_delivered   ||0 },
  ].filter(d => d.value > 0) : [];

  function handleExport() {
    const data = (all as any)?.data || [];
    downloadCSV(data.map((p: any) => ({
      'N° Suivi': p.tracking_number, 'Statut': STATUS_LABEL[p.status as PackageStatus],
      'Transport': p.transport_type==='air'?'Aérien':'Maritime',
      'Expéditeur': p.sender_name, 'Destinataire': p.recipient_name,
      'Agence origine': p.origin_agency_name, 'Agence dest.': p.destination_agency_name,
      'Poids (kg)': p.weight_kg, 'Prix': p.price, 'Devise': p.currency,
      'Paiement': p.payment_status||'', 'Date': p.created_at,
    })), 'fretsend-rapport-complet');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="page-header">
        <div><h1 className="page-title">Rapports & Statistiques</h1><p className="page-sub">Vue d'ensemble de l'activité FretSend</p></div>
        <button onClick={handleExport} className="btn-ghost btn-sm"><Download className="w-4 h-4" />Export CSV</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Total colis',    v:s?.total_all??0,          e:'📦', c:'bg-blue-50 text-[#1C4AA6]' },
          { l:'En transit',     v:s?.total_in_transit??0,   e:'🚀', c:'bg-amber-50 text-amber-600' },
          { l:'Livrés',         v:s?.total_delivered??0,    e:'✅', c:'bg-green-50 text-green-600' },
          { l:"Aujourd'hui",    v:s?.created_today??0,      e:'📬', c:'bg-purple-50 text-purple-600' },
        ].map((k,i) => (
          <div key={i} className="kpi-card">
            <div className={`w-10 h-10 rounded-2xl ${k.c} flex items-center justify-center text-xl`}>{k.e}</div>
            <div><p className="text-2xl font-black text-gray-900">{k.v}</p><p className="text-sm text-gray-500">{k.l}</p></div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1C4AA6]" />Volume mensuel 2025
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={(monthly as any)||[]}>
              <defs>
                <linearGradient id="rT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C4AA6" stopOpacity={0.15}/><stop offset="95%" stopColor="#1C4AA6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="rD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F26E22" stopOpacity={0.15}/><stop offset="95%" stopColor="#F26E22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/>
              <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid #e5e7eb',fontSize:'12px'}}/>
              <Legend/>
              <Area type="monotone" dataKey="total"     stroke="#1C4AA6" fill="url(#rT)" name="Total"  strokeWidth={2}/>
              <Area type="monotone" dataKey="delivered" stroke="#F26E22" fill="url(#rD)" name="Livrés" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#F26E22]" />Répartition statuts
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i) => <Cell key={i} fill={BRAND_COLORS[i%BRAND_COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Données insuffisantes</div>}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 mb-4">Revenus mensuels (€)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={(monthly as any)||[]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/>
            <Tooltip formatter={(v:number)=>[formatPrice(v,'EUR'),'Revenus']} contentStyle={{borderRadius:'12px',fontSize:'12px'}}/>
            <Bar dataKey="revenue" fill="#F26E22" name="Revenus" radius={[6,6,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
