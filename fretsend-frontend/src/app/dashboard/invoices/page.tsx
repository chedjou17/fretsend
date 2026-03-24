'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { pkgApi } from '@/lib/api';
import { fmtDateTime, formatPrice, type PackageStatus } from '@/lib/utils';
export default function InvoicesPage() {
  const { data } = useQuery({ queryKey:['packages',{all:true}], queryFn:()=>pkgApi.list({limit:100}) });
  const items = ((data as any)?.data||[]).filter((p:any)=>p.payment_status);
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div><h1 className="page-title">Factures</h1><p className="page-sub">Historique des paiements</p></div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['N° Suivi','Expéditeur','Montant','Paiement','Date'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((p:any)=>(
                <tr key={p.id} className="hover:bg-[#F2F2F2]">
                  <td className="td"><Link href={`/dashboard/packages/${p.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{p.tracking_number}</Link></td>
                  <td className="td text-xs"><p className="font-semibold">{p.sender_name}</p><p className="text-gray-400">{p.sender_email}</p></td>
                  <td className="td font-bold">{formatPrice(p.price,p.currency)}</td>
                  <td className="td">
                    <span className={`badge ${p.payment_status==='paid'?'bg-green-100 text-green-700':p.payment_status==='problem'?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-600'}`}>
                      {p.payment_status==='paid'?'✓ Payé':p.payment_status==='problem'?'⚠ Problème':'⏳ Attente'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-400">{fmtDateTime(p.created_at)}</td>
                </tr>
              ))}
              {!items.length&&<tr><td colSpan={5} className="td text-center py-12 text-gray-400"><FileText className="w-10 h-10 mx-auto mb-2 opacity-30"/>Aucune facture</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
