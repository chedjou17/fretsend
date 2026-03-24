'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { paymentApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function PaymentPage() {
  const { token } = useParams<{ token: string }>();
  const router    = useRouter();
  const [done, setDone] = useState(false);
  const [result, setResult] = useState('');

  const { data: invoice, isLoading, error } = useQuery({
    queryKey:  ['payment', token],
    queryFn:   () => paymentApi.verify(token),
    enabled:   !!token,
  });

  const actionMut = useMutation({
    mutationFn: (action: 'paid' | 'unpaid' | 'problem') => paymentApi.action(token, action),
    onSuccess: (_d, action) => {
      setResult(action);
      setDone(true);
      if (action === 'paid') toast.success('Paiement confirmé ! Vous allez recevoir un email de confirmation.');
      else if (action === 'unpaid') toast.info('Transaction annulée. Contactez votre agence pour plus d\'informations.');
      else toast.warning('Problème signalé. Notre équipe vous contactera rapidement.');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const inv = invoice as any;

  if (isLoading) return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !inv) return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="card p-12 text-center max-w-md w-full">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h2>
        <p className="text-gray-500 text-sm">Ce lien de paiement est invalide ou a déjà été utilisé.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Image src="/images/logo.png" alt="FretSend" width={36} height={36} className="rounded-lg" />
            <span className="font-black text-xl" style={{ color:'#1C4AA6' }}>Fret<span style={{ color:'#F26E22' }}>Send</span></span>
          </div>
          <p className="text-sm text-gray-500">Paiement sécurisé</p>
        </div>

        {!done ? (
          <div className="card p-6 space-y-5">
            {/* Package info */}
            <div className="bg-[#F2F2F2] rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#1C4AA6] rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{inv.tracking_number}</p>
                  <p className="text-xs text-gray-500">{inv.origin_city} → {inv.destination_city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Expéditeur</p>
                  <p className="font-semibold text-gray-800">{inv.sender_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Destinataire</p>
                  <p className="font-semibold text-gray-800">{inv.recipient_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Transport</p>
                  <p className="font-semibold text-gray-800">{inv.transport_type === 'air' ? '✈️ Aérien' : '🚢 Maritime'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Poids</p>
                  <p className="font-semibold text-gray-800">{inv.weight_kg} kg</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-4 border-2 border-[#1C4AA6] rounded-2xl">
              <span className="font-semibold text-gray-700">Montant à payer</span>
              <span className="text-2xl font-black text-[#1C4AA6]">{formatPrice(inv.price, inv.currency)}</span>
            </div>

            <p className="text-xs text-gray-400 text-center">
              En phase de test — choisissez votre situation ci-dessous
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => actionMut.mutate('paid')}
                disabled={actionMut.isPending}
                className="w-full flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-colors"
              >
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold">J'ai payé</p>
                  <p className="text-xs text-green-200">Confirmer le paiement de {formatPrice(inv.price, inv.currency)}</p>
                </div>
              </button>

              <button
                onClick={() => actionMut.mutate('unpaid')}
                disabled={actionMut.isPending}
                className="w-full flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-colors"
              >
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold">Je n'ai pas payé</p>
                  <p className="text-xs text-red-200">Annuler la transaction</p>
                </div>
              </button>

              <button
                onClick={() => actionMut.mutate('problem')}
                disabled={actionMut.isPending}
                className="w-full flex items-center gap-3 p-4 bg-[#F26E22] hover:bg-[#F2561D] text-white rounded-2xl font-bold transition-colors"
              >
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-bold">Problème de paiement</p>
                  <p className="text-xs text-orange-200">Problème réseau — je souhaite payer en cash</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            {result === 'paid' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-black text-gray-900 mb-2">Paiement confirmé !</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Vous allez recevoir un email de confirmation avec les détails de votre envoi.
                  Le destinataire sera notifié dès que son colis sera disponible en agence.
                </p>
                <p className="text-xs font-mono text-gray-400 bg-[#F2F2F2] py-2 px-4 rounded-xl inline-block">{inv.tracking_number}</p>
              </>
            )}
            {result === 'unpaid' && (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-black text-gray-900 mb-2">Transaction annulée</h2>
                <p className="text-gray-500 text-sm">Votre colis est en attente de paiement. Contactez l'agence pour régulariser.</p>
              </>
            )}
            {result === 'problem' && (
              <>
                <AlertTriangle className="w-16 h-16 text-[#F26E22] mx-auto mb-4" />
                <h2 className="text-xl font-black text-gray-900 mb-2">Problème signalé</h2>
                <p className="text-gray-500 text-sm">Notre équipe a été notifiée et vous contactera rapidement pour finaliser le paiement.</p>
              </>
            )}
            <button onClick={() => router.push('/')} className="btn-primary mt-6">
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
