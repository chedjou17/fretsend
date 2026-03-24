import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, Bell, Shield, Package, ChevronRight } from 'lucide-react';
import TrackBar from '@/components/shared/TrackBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="FretSend" width={36} height={36} className="rounded-lg" />
            <span className="font-black text-xl" style={{ color: '#1C4AA6' }}>
              Fret<span style={{ color: '#F26E22' }}>Send</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-[#1C4AA6] transition-colors">Services</a>
            <a href="#how" className="hover:text-[#1C4AA6] transition-colors">Comment ça marche</a>
            <a href="#agences" className="hover:text-[#1C4AA6] transition-colors">Agences</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-[#1C4AA6] px-3 py-1.5 transition-colors">
              Connexion
            </Link>
            <Link href="/auth/register" className="btn-orange btn-sm text-sm">
              Commencer <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO — VIDEO BACKGROUND
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-900">
        {/* Video background */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-100"
          poster="/images/hero-poster.jpg"
        >
          {/* In production: replace with real logistics/shipping video */}
       <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Fallback image overlay if no video */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#1C4AA6]/70" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span>🇫🇷</span>
            <span>France ↔ Cameroun</span>
            <span>🇨🇲</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Envoyez vos colis<br />
            <span style={{ color: '#F2C49B' }}>en toute confiance</span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Suivi en temps réel, réseau d'agences physiques, notifications instantanées.
            La solution logistique de la diaspora.
          </p>

          <TrackBar dark />

          <div className="flex justify-center gap-8 mt-12 text-sm text-white/60 flex-wrap">
            <span className="flex items-center gap-2">✈️ Aérien 3–7 jours</span>
            <span className="flex items-center gap-2">🚢 Maritime 21–30 jours</span>
            <span className="flex items-center gap-2">📍 8 agences</span>
            <span className="flex items-center gap-2">📧 Notifications email</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRACKING BAR (sticky after hero)
      ═══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <TrackBar />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SERVICES — Animated journey section
      ═══════════════════════════════════════════════ */}
      <section id="services" className="section bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Notre réseau, votre tranquillité</h2>
            <p className="section-sub mx-auto text-center">
              Un corridor logistique dédié entre la France et le Cameroun,
              avec des agents formés et un suivi à chaque étape.
            </p>
          </div>

          {/* Animated route map */}
          <div className="relative bg-[#F2F2F2] rounded-3xl p-8 md:p-12 mb-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle, #1C4AA6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="relative flex items-center justify-between gap-4">
              {/* France */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center text-3xl">🇫🇷</div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-sm">France</p>
                  <p className="text-xs text-gray-500">Paris · Lyon · Marseille</p>
                </div>
              </div>

              {/* Route with animations */}
              <div className="flex-1 relative h-20 flex items-center">
                {/* Ocean line */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-300" />
                {/* Waves */}
                <div className="absolute inset-x-0 top-1/2 flex justify-center gap-2 -translate-y-1/2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-6 h-1.5 bg-blue-200 rounded-full animate-wave" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
                {/* Ship */}
                <div className="absolute left-1/4 top-1/2 -translate-y-full -translate-x-1/2 animate-ship text-2xl select-none">🚢</div>
                {/* Plane */}
                <div className="absolute left-2/3 top-0 animate-plane text-xl select-none">✈️</div>
              </div>

              {/* Cameroun */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center text-3xl">🇨🇲</div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-sm">Cameroun</p>
                  <p className="text-xs text-gray-500">Douala · Yaoundé · Bafoussam</p>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[
                { icon:'✈️', label:'Aérien', desc:'3–7 jours', color:'bg-blue-50 text-blue-700' },
                { icon:'🚢', label:'Maritime', desc:'21–30 jours', color:'bg-indigo-50 text-indigo-700' },
                { icon:'📦', label:'Colis', desc:'Tout gabarit', color:'bg-orange-50 text-orange-700' },
                { icon:'🔒', label:'Sécurisé', desc:'Tracé & assuré', color:'bg-green-50 text-green-700' },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-card">
                  <div className={`inline-flex w-10 h-10 rounded-xl ${t.color} items-center justify-center text-xl mb-2`}>{t.icon}</div>
                  <p className="font-bold text-gray-900 text-sm">{t.label}</p>
                  <p className="text-xs text-gray-500">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards — clean, no gradients */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, color: 'text-[#1C4AA6] bg-blue-50', title: 'Réseau d\'agences', desc: 'Déposez et retirez vos colis dans nos agences physiques réparties en France et au Cameroun.' },
              { icon: Clock,  color: 'text-[#F26E22] bg-orange-50', title: 'Suivi en temps réel', desc: 'Consultez la position et le statut de votre colis à chaque étape, avec alertes instantanées.' },
              { icon: Bell,   color: 'text-green-600 bg-green-50', title: 'Notifications email', desc: 'Expéditeur et destinataire sont informés à chaque événement : départ, transit, arrivée, disponibilité.' },
              { icon: Shield, color: 'text-purple-600 bg-purple-50', title: 'Assurance incluse', desc: 'Optez pour l\'assurance colis et soyez couvert jusqu\'à la valeur déclarée de votre envoi.' },
              { icon: Package,color: 'text-[#F2561D] bg-red-50', title: 'Tous gabarits', desc: 'Enveloppe, carton, palette — nos agents gèrent tous types de colis avec soin.' },
              { icon: ChevronRight, color: 'text-gray-600 bg-gray-50', title: 'Compte expéditeur', desc: 'Créez votre compte, suivez l\'historique de vos envois et gérez vos destinataires favoris.' },
            ].map((f, i) => (
              <div key={i} className="card p-6 hover:shadow-hover transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COMMENT ÇA MARCHE
      ═══════════════════════════════════════════════ */}
      <section id="how" className="section bg-[#F2F2F2]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="section-title">Simple comme un, deux, trois</h2>
            <p className="section-sub mx-auto text-center">
              De la dépose en agence au retrait par le destinataire — tout est tracé.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                n: '01', icon: '🏪', color: 'bg-[#1C4AA6]', textColor: 'text-[#1C4AA6]', borderColor: 'border-[#1C4AA6]',
                title: 'Déposez votre colis en agence',
                desc: 'Rendez-vous dans une agence FretSend avec votre colis emballé. Notre agent enregistre l\'expéditeur, le destinataire et les caractéristiques du colis en quelques minutes.',
              },
              {
                n: '02', icon: '💳', color: 'bg-[#F26E22]', textColor: 'text-[#F26E22]', borderColor: 'border-[#F26E22]',
                title: 'Payez votre expédition',
                desc: 'Vous recevez un email avec le lien de paiement sécurisé. Une fois réglé, la confirmation est envoyée automatiquement à l\'expéditeur et au destinataire.',
              },
              {
                n: '03', icon: '📡', color: 'bg-[#F2561D]', textColor: 'text-[#F2561D]', borderColor: 'border-[#F2561D]',
                title: 'Suivez chaque étape',
                desc: 'Numéro de suivi unique, lien de tracking, alertes email à chaque changement de statut. Le destinataire sait exactement quand venir récupérer son colis.',
              },
              {
                n: '04', icon: '🎉', color: 'bg-green-600', textColor: 'text-green-600', borderColor: 'border-green-600',
                title: 'Retrait en agence',
                desc: 'À l\'arrivée, le destinataire reçoit une notification et vient récupérer son colis sur présentation de son numéro de suivi ou QR code.',
              },
            ].map((s, i) => (
              <div key={i} className={`bg-white rounded-2xl p-6 border-l-4 ${s.borderColor} shadow-card flex gap-5 items-start hover:shadow-hover transition-all duration-300`}>
                <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                  {s.n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <h3 className="font-bold text-gray-900">{s.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          AGENCES
      ═══════════════════════════════════════════════ */}
      <section id="agences" className="section bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Nos agences</h2>
            <p className="section-sub mx-auto text-center">8 agences à votre service en France et au Cameroun.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { flag:'🇫🇷', country:'France', cities:['Paris — Nation','Lyon — République','Marseille — Canebière','Bordeaux — Gambetta'] },
              { flag:'🇨🇲', country:'Cameroun', cities:['Douala — Hub Akwa','Yaoundé — Avenue Kennedy','Bafoussam — Marché A','Bamenda — Commercial Ave'] },
            ].map((c, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{c.flag}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{c.country}</h3>
                  <span className="badge bg-blue-100 text-blue-700">{c.cities.length} agences</span>
                </div>
                <div className="space-y-3">
                  {c.cities.map((city, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 bg-[#F2F2F2] rounded-xl">
                      <MapPin className="w-4 h-4 text-[#1C4AA6] flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{city}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════ */}
      <section className="section bg-[#1C4AA6]">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-black mb-4">Prêt à envoyer votre premier colis ?</h2>
          <p className="text-white/70 mb-8 text-lg">Créez votre compte gratuitement — aucune carte bancaire requise.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register" className="btn bg-[#F26E22] hover:bg-[#F2561D] text-white px-6 py-3 text-base font-bold rounded-xl focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
              Créer un compte <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20 px-6 py-3 text-base font-semibold rounded-xl">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image src="/images/logo.png" alt="FretSend" width={32} height={32} className="rounded-lg" />
                <span className="font-black text-lg text-white">
                  Fret<span style={{ color:'#F26E22' }}>Send</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                La plateforme logistique dédiée au corridor France ↔ Cameroun.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Transport aérien</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Transport maritime</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Suivi en temps réel</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Assurance colis</a></li>
              </ul>
            </div>

            {/* Agences */}
            <div>
              <h4 className="font-bold mb-4 text-white">Agences</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>🇫🇷 Paris, Lyon, Marseille</li>
                <li>🇫🇷 Bordeaux</li>
                <li>🇨🇲 Douala, Yaoundé</li>
                <li>🇨🇲 Bafoussam, Bamenda</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 contact@fretsend.com</li>
                <li>🇫🇷 +33 1 14 58 47 69</li>
                <li>🇨🇲 +237 6 89 86 72 33</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© 2026 FretSend. Tous droits réservés.</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
