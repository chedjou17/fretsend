'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Package, RefreshCw } from 'lucide-react';
import { pkgApi, agencyApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { STATUS_LABEL, STATUS_COLOR, STATUS_ICON, fmtDateTime, formatPrice, downloadCSV, type PackageStatus } from '@/lib/utils';

const ALL_STATUSES: PackageStatus[] = ['created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered','returned'];

export default function PackagesPage() {
  const { isRole } = useAuth();
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<Record<string,string>>({});
  const [showF, setShowF]     = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['packages', filters, page],
    queryFn:  () => pkgApi.list({ ...filters, page, limit: 20 }),
  });
  const { data: agencies } = useQuery({ queryKey:['agencies'], queryFn:()=>agencyApi.list() });

  const items      = (data as any)?.data || [];
  const total      = (data as any)?.count || 0;
  const totalPages = Math.ceil(total / 20);

  function sf(k: string, v: string) { setFilters(f => ({ ...f, [k]: v||undefined as any })); setPage(1); }

  function handleExport() {
    downloadCSV(items.map((p: any) => ({
      'N° Suivi': p.tracking_number, 'Statut': STATUS_LABEL[p.status as PackageStatus],
      'Expéditeur': p.sender_name, 'Tél Exp.': p.sender_phone,
      'Destinataire': p.recipient_name, 'Tél Dest.': p.recipient_phone,
      'Agence origine': p.origin_agency_name, 'Agence dest.': p.destination_agency_name,
      'Transport': p.transport_type === 'air' ? 'Aérien' : 'Maritime',
      'Poids (kg)': p.weight_kg, 'Prix': p.price, 'Devise': p.currency,
      'Paiement': p.payment_status || 'pending', 'Date': p.created_at,
    })), 'fretsend-colis');
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Colis</h1>
          <p className="page-sub">{total} colis au total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => refetch()} className="btn-icon"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleExport} className="btn-ghost btn-sm"><Download className="w-4 h-4" />CSV</button>
          {isRole('admin','agency_manager','agent') && (
            <Link href="/dashboard/packages/new" className="btn-primary btn-sm">
              <Plus className="w-4 h-4" />Nouveau colis
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input pl-10" placeholder="N° suivi, nom, téléphone…" onChange={e => sf('search', e.target.value)} />
          </div>
          <button onClick={() => setShowF(!showF)} className={`btn-ghost btn-sm ${showF ? 'bg-blue-50 text-[#1C4AA6] border-[#1C4AA6]' : ''}`}>
            <Filter className="w-4 h-4" />Filtres
          </button>
        </div>
        {showF && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="label">Statut</label>
              <select className="select" onChange={e => sf('status', e.target.value)}>
                <option value="">Tous</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_ICON[s]} {STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Transport</label>
              <select className="select" onChange={e => sf('transport_type', e.target.value)}>
                <option value="">Tous</option>
                <option value="air">✈️ Aérien</option>
                <option value="sea">🚢 Maritime</option>
              </select>
            </div>
            <div>
              <label className="label">Du</label>
              <input type="date" className="input" onChange={e => sf('date_from', e.target.value)} />
            </div>
            <div>
              <label className="label">Au</label>
              <input type="date" className="input" onChange={e => sf('date_to', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>{['N° Suivi','Expéditeur','Destinataire','Trajet','Transport','Statut','Paiement','Prix','Date'].map(h => (
                <th key={h} className="th whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="td py-16 text-center">
                  <div className="w-10 h-10 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : items.map((p: any) => (
                <tr key={p.id} className="hover:bg-[#F2F2F2] transition-colors">
                  <td className="td">
                    <Link href={`/dashboard/packages/${p.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{p.tracking_number}</Link>
                    <div className="flex gap-1 mt-1">
                      {p.is_fragile && <span className="badge bg-orange-100 text-orange-600 text-[10px]">Fragile</span>}
                      {p.is_urgent  && <span className="badge bg-red-100 text-red-600 text-[10px]">Urgent</span>}
                    </div>
                  </td>
                  <td className="td"><div className="text-xs font-semibold">{p.sender_name}</div><div className="text-xs text-gray-400">{p.sender_phone}</div></td>
                  <td className="td"><div className="text-xs font-semibold">{p.recipient_name}</div><div className="text-xs text-gray-400">{p.recipient_phone}</div></td>
                  <td className="td text-xs text-gray-500">{p.origin_city} → {p.destination_city}</td>
                  <td className="td text-sm">{p.transport_type === 'air' ? '✈️' : '🚢'}</td>
                  <td className="td">
                    <span className={`badge ${STATUS_COLOR[p.status as PackageStatus]}`}>
                      {STATUS_ICON[p.status as PackageStatus]} {STATUS_LABEL[p.status as PackageStatus]}
                    </span>
                  </td>
                  <td className="td">
                    <span className={`badge text-[10px] ${
                      p.payment_status === 'paid'    ? 'bg-green-100 text-green-700' :
                      p.payment_status === 'unpaid'  ? 'bg-red-100 text-red-700' :
                      p.payment_status === 'problem' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.payment_status === 'paid' ? '✓ Payé' : p.payment_status === 'unpaid' ? '✗ Annulé' : p.payment_status === 'problem' ? '⚠ Problème' : '⏳ Attente'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-600 whitespace-nowrap">{formatPrice(p.price, p.currency)}</td>
                  <td className="td text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(p.created_at)}</td>
                </tr>
              ))}
              {!isLoading && !items.length && (
                <tr><td colSpan={9} className="td py-16 text-center text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />Aucun colis trouvé
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page}/{totalPages} · {total} résultats</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-ghost btn-sm">← Préc.</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="btn-ghost btn-sm">Suiv. →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
