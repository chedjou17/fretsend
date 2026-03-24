'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/auth.store';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd]     = useState('');
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState('');
  const { login }         = useAuth();
  const router            = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await login(email, pwd);
      toast.success('Bienvenue sur FretSend !');
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Identifiants incorrects');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <Image src="/images/logo.png" alt="FretSend" width={56} height={56} className="rounded-2xl shadow-card" />
            <span className="font-black text-2xl" style={{ color:'#1C4AA6' }}>Fret<span style={{ color:'#F26E22' }}>Send</span></span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Connexion à votre espace</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="vous@email.com" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input type={show?'text':'password'} className="input pr-11" value={pwd} onChange={e=>setPwd(e.target.value)} required placeholder="••••••••" />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <span className="spinner" /> : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas de compte ? <Link href="/auth/register" className="text-[#1C4AA6] font-semibold hover:underline">Créer un compte</Link>
          </p>

        
        </div>
        <p className="text-center mt-5">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}
