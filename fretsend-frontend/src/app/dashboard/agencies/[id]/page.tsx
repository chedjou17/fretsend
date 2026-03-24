'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { agencyApi, pkgApi } from '@/lib/api';
import { STATUS_LABEL, STATUS_COLOR, STATUS_ICON, fmtDateTime, type PackageStatus } from '@/lib/utils';

export default function AgencyDetailPage() {
  const { id } = useParams<{id:string}>();
  const { data: agency } = useQuery({ queryKey:['agency',id], queryFn:()=>agencyApi.byId(id) });
  const { data: pkgs }   = useQuery({ queryKey:['packages',{agency_id:id}], queryFn:()=>pkgApi.list({agency_id:id,limit:10}) });
  if (!agency) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin"/></div>;
  const ag = agency as any;
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agencies" className="btn-icon"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{ag.name}</h1>
            {ag.is_hub&&<span className="badge bg-blue-100 text-[#1C4AA6]">HUB</span>}
            <span className={`badge ${ag.is_active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{ag.is_active?'● Actif':'○ Inactif'}</span>
          </div>
          <p className="page-sub">{ag.country==='FR'?'🇫🇷 France':'🇨🇲 Cameroun'} — {ag.city}</p>
        </div>
      </div>
      <div className="card p-5 space-y-2">
        <h2 className="font-bold text-gray-800">Informations</h2>
        <p className="text-sm text-gray-600">📍 {ag.address}</p>
        {ag.phone&&<p className="text-sm text-gray-600">📞 {ag.phone}</p>}
        {ag.email&&<p className="text-sm text-gray-600">✉️ {ag.email}</p>}
      </div>
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800">Colis récents ({(pkgs as any)?.count||0})</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['N° Suivi','Expéditeur','Destinataire','Statut','Date'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {(pkgs as any)?.data?.map((p:any)=>(
                <tr key={p.id} className="hover:bg-[#F2F2F2]">
                  <td className="td"><Link href={`/dashboard/packages/${p.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{p.tracking_number}</Link></td>
                  <td className="td text-xs">{p.sender_name}</td>
                  <td className="td text-xs">{p.recipient_name}</td>
                  <td className="td"><span className={`badge ${STATUS_COLOR[p.status as PackageStatus]}`}>{STATUS_ICON[p.status as PackageStatus]} {STATUS_LABEL[p.status as PackageStatus]}</span></td>
                  <td className="td text-xs text-gray-400">{fmtDateTime(p.created_at)}</td>
                </tr>
              ))}
              {!(pkgs as any)?.data?.length&&<tr><td colSpan={5} className="td text-center py-8 text-gray-400">Aucun colis</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
