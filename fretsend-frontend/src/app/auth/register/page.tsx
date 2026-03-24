'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
export default function RegisterPage() {
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', password:'' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const h = (k:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}));
  async function submit(e:React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try { await authApi.register(form); toast.success('Compte créé ! Connectez-vous.'); router.push('/auth/login'); }
    catch(e:any) { toast.error(e.message||'Erreur'); }
    finally { setLoading(false); }
  }
  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image src="/images/logo.png" alt="FretSend" width={56} height={56} className="rounded-2xl shadow-card"/>
            <span className="font-black text-2xl" style={{color:'#1C4AA6'}}>Fret<span style={{color:'#F26E22'}}>Send</span></span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Créer votre compte</p>
        </div>
        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Prénom *</label><input className="input" required value={form.first_name} onChange={h('first_name')} placeholder="Jean"/></div>
              <div><label className="label">Nom *</label><input className="input" required value={form.last_name} onChange={h('last_name')} placeholder="Dupont"/></div>
            </div>
            <div><label className="label">Email *</label><input type="email" className="input" required value={form.email} onChange={h('email')} placeholder="jean@email.com"/></div>
            <div><label className="label">Téléphone</label><input className="input" value={form.phone} onChange={h('phone')} placeholder="+33 6 00 00 00 00"/></div>
            <div><label className="label">Mot de passe *</label><input type="password" className="input" required minLength={8} value={form.password} onChange={h('password')} placeholder="Minimum 8 caractères"/></div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading?<span className="spinner"/>:'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Déjà un compte ? <Link href="/auth/login" className="text-[#1C4AA6] font-semibold hover:underline">Se connecter</Link></p>
        </div>
      </div>
    </div>
  );
}
