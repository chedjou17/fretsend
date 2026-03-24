'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { shipApi } from '@/lib/api';
import { STATUS_LABEL, STATUS_COLOR, STATUS_ICON, SHIP_LABEL, fmtDate, type PackageStatus } from '@/lib/utils';
export default function ShipmentDetailPage() {
  const { id } = useParams<{id:string}>();
  const { data: s } = useQuery({ queryKey:['shipment',id], queryFn:()=>shipApi.byId(id) });
  if (!s) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin"/></div>;
  const sh = s as any;
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/shipments" className="btn-icon"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <div className="flex items-center gap-3"><h1 className="text-xl font-black text-gray-900 font-mono">{sh.reference}</h1><span className="badge bg-gray-100 text-gray-600">{SHIP_LABEL[sh.status]||sh.status}</span></div>
          <p className="page-sub">{sh.transport_type==='air'?'✈️ Aérien':'🚢 Maritime'}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-5"><p className="text-xs font-bold text-[#1C4AA6] uppercase mb-2">Origine</p><p className="font-bold">{sh.origin_agency?.name}</p><p className="text-sm text-gray-500">{sh.origin_agency?.city}</p><p className="text-xs text-gray-400 mt-2">Départ : {fmtDate(sh.departure_date)}</p></div>
        <div className="card p-5 flex items-center justify-center"><div className="text-center"><div className="text-3xl mb-2">{sh.transport_type==='air'?'✈️':'🚢'}</div><p className="text-xs text-gray-400">{sh.total_packages} colis · {sh.total_weight_kg} kg</p></div></div>
        <div className="card p-5"><p className="text-xs font-bold text-[#F26E22] uppercase mb-2">Destination</p><p className="font-bold">{sh.destination_agency?.name}</p><p className="text-sm text-gray-500">{sh.destination_agency?.city}</p><p className="text-xs text-gray-400 mt-2">ETA : {fmtDate(sh.estimated_arrival_date)}</p></div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-800">Colis ({sh.packages?.length||0})</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['N° Suivi','Expéditeur','Destinataire','Poids','Statut'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {(sh.packages||[]).map((p:any)=>(<tr key={p.id} className="hover:bg-[#F2F2F2]">
                <td className="td"><Link href={`/dashboard/packages/${p.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{p.tracking_number}</Link></td>
                <td className="td text-xs">{p.sender_name}</td><td className="td text-xs">{p.recipient_name}</td>
                <td className="td text-xs">{p.weight_kg} kg</td>
                <td className="td"><span className={`badge ${STATUS_COLOR[p.status as PackageStatus]}`}>{STATUS_ICON[p.status as PackageStatus]} {STATUS_LABEL[p.status as PackageStatus]}</span></td>
              </tr>))}
              {!sh.packages?.length&&<tr><td colSpan={5} className="td text-center py-8 text-gray-400">Aucun colis</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
