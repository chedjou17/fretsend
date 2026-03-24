'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Building2, Users, Ship, BarChart3, DollarSign, Home, LogOut, Menu, X, ChevronRight, FileText, Activity } from 'lucide-react';
import { useAuth } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV = [
  { href:'/dashboard',           label:'Tableau de bord', icon:Home,      roles:['admin','agency_manager','agent','client'] },
  { href:'/dashboard/packages',  label:'Colis',           icon:Package,   roles:['admin','agency_manager','agent'] },
  { href:'/dashboard/invoices',  label:'Factures',        icon:FileText,  roles:['admin','agency_manager','agent'] },
  { href:'/dashboard/agencies',  label:'Agences',         icon:Building2, roles:['admin','agency_manager'] },
  { href:'/dashboard/shipments', label:'Expéditions',     icon:Ship,      roles:['admin','agency_manager'] },
  { href:'/dashboard/users',     label:'Utilisateurs',    icon:Users,     roles:['admin','agency_manager'] },
  { href:'/dashboard/pricing',   label:'Tarification',    icon:DollarSign,roles:['admin'] },
  { href:'/dashboard/reports',   label:'Rapports',        icon:BarChart3, roles:['admin','agency_manager'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout, isRole } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) router.push('/auth/login');
  }, [loading, profile]);

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Chargement…</p>
      </div>
    </div>
  );

  const nav = NAV.filter(n => n.roles.includes(profile.role));

  async function handleLogout() { await logout(); router.push('/auth/login'); }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt="FretSend" width={36} height={36} className="rounded-xl" />
          <div>
            <p className="font-black text-lg leading-none" style={{ color:'#1C4AA6' }}>Fret<span style={{ color:'#F26E22' }}>Send</span></p>
            <p className="text-xs text-gray-400 mt-0.5">France ↔ Cameroun</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('nav-link', active ? 'nav-active' : 'nav-inactive')}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background:'#1C4AA6' }}>
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{profile.first_name} {profile.last_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role.replace('_',' ')}</p>
          </div>
        </div>
        {profile.agency && (
          <div className="mb-2 px-2 py-1.5 bg-blue-50 rounded-xl">
            <p className="text-xs text-[#1C4AA6] font-medium truncate">🏢 {profile.agency.name}</p>
          </div>
        )}
        <button onClick={handleLogout} className="nav-link nav-inactive w-full text-left">
          <LogOut className="w-4 h-4" /><span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F2F2]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 shadow-card">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 flex flex-col bg-white shadow-2xl animate-slide-in"><Sidebar /></div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
          <button className="lg:hidden btn-icon" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {profile.agency && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs bg-blue-50 text-[#1C4AA6] font-semibold px-3 py-1.5 rounded-full">
                <Building2 className="w-3 h-3" />{profile.agency.name}
              </span>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:'#1C4AA6' }}>
              {profile.first_name?.[0]}{profile.last_name?.[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
