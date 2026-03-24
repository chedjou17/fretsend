# FretSend Backend — API NestJS

## ❓ NestJS n'est PAS Angular

NestJS et Angular partagent la même syntaxe de décorateurs TypeScript (`@Module`, `@Injectable`)
**mais ce sont deux choses totalement différentes** :

| | NestJS | Angular |
|--|--------|---------|
| Type | Framework **backend** (Node.js) | Framework **frontend** |
| Tourne sur | Serveur Node.js | Navigateur web |
| Comparable à | Express.js, Fastify | React, Vue.js |

**FretSend Backend = NestJS = API REST qui tourne côté serveur. Zéro Angular.**

---

## Structure du projet

```
src/
├── main.ts                          ← Lance le serveur (port 3001)
├── app.module.ts                    ← Module racine
├── common/
│   ├── supabase/supabase.module.ts  ← Client Supabase partagé
│   ├── guards/guards.ts             ← JWT + Roles guards
│   ├── decorators/index.ts          ← @Public(), @Roles(), @CurrentUser()
│   ├── filters/                     ← Gestion erreurs
│   └── interceptors/                ← Format réponses standard
├── auth/                            ← Login, register, refresh, logout
├── packages/                        ← CRUD colis + statuts + tracking
├── agencies/                        ← Gestion agences
├── users/                           ← Gestion utilisateurs RBAC
├── shipments/                       ← Expéditions groupées
├── pricing/                         ← Tarification
├── tracking/                        ← Stats + événements
├── notifications/                   ← Historique notifications
└── websocket/                       ← Temps réel Socket.io
```

---

## Démarrage

```bash
# 1. Installer
npm install

# 2. Configurer
cp .env.example .env
# Remplir SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Lancer
npm run start:dev

# API  → http://localhost:3001/api/v1
# Docs → http://localhost:3001/api/docs
```

---

## Endpoints principaux

### Auth (sans token)
```
POST /api/v1/auth/login           → access_token + refresh_token
POST /api/v1/auth/register        → créer un compte client
POST /api/v1/auth/refresh         → renouveler le token
GET  /api/v1/auth/me              → profil connecté (token requis)
POST /api/v1/auth/logout          → déconnexion
```

### Packages
```
GET    /api/v1/packages                   → liste avec filtres
GET    /api/v1/packages/track/:numero     → suivi public SANS auth
GET    /api/v1/packages/:id               → détail
POST   /api/v1/packages                   → créer (agent+)
PATCH  /api/v1/packages/:id/status        → changer statut (agent+)
```

### Autres modules : voir http://localhost:3001/api/docs

---

## Sécurité

- JWT stateless : access 15min + refresh 7j
- Toutes les routes protégées par défaut (JwtAuthGuard global)
- Routes publiques marquées @Public() : /auth/login, /auth/register, /packages/track/:num, /agencies, /pricing/rules
- RBAC avec @Roles() sur chaque endpoint sensible
- Rate limiting : 100 req/min global, 10/min sur /auth/login
- Helmet pour les headers HTTP
- Validation stricte de tous les DTOs (whitelist=true)

---

## WebSocket

```js
const socket = io('http://localhost:3001/tracking');
socket.emit('subscribe:tracking', { trackingNumber: 'FS-FR-20250315-00042' });
socket.on('tracking:update', (data) => console.log(data));
```
