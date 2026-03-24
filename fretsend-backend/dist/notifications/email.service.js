"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const https = require("https");
const http = require("http");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.apiKey = config.get('FREESEND_API_KEY', '');
        this.from = config.get('FREESEND_FROM', 'noreply@fretsend.com');
        this.appUrl = config.get('FRONTEND_URL', 'http://localhost:3000');
    }
    async send(to, subject, html) {
        if (!this.apiKey) {
            this.logger.warn(`[EMAIL SKIPPED — no FREESEND_API_KEY] To: ${to} | Subject: ${subject}`);
            return;
        }
        try {
            const body = JSON.stringify({
                to,
                fromEmail: this.from,
                subject,
                html,
            });
            await this.httpPost('https://freesend.metafog.io/api/send-email', body, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            });
            this.logger.log(`Email envoyé : ${to} — ${subject}`);
        }
        catch (err) {
            this.logger.error(`Email échoué : ${to} — ${err}`);
        }
    }
    async sendPaymentLink(pkg, paymentToken) {
        const payUrl = `${this.appUrl}/payment/${paymentToken}`;
        const trackUrl = `${this.appUrl}/track/${pkg.tracking_number}`;
        await this.send(pkg.sender_email, `FretSend — Finalisez votre envoi ${pkg.tracking_number}`, this.template(`
        <h2 style="color:#1C4AA6">Votre colis a été enregistré 📦</h2>
        <p>Bonjour <strong>${pkg.sender_name}</strong>,</p>
        <p>Votre colis a bien été enregistré dans notre système. Voici les détails :</p>

        <div style="background:#F2F2F2;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 8px;border-radius:6px;font-family:monospace">${pkg.tracking_number}</code></p>
          <p><strong>Expéditeur :</strong> ${pkg.sender_name}</p>
          <p><strong>Destinataire :</strong> ${pkg.recipient_name}</p>
          <p><strong>Transport :</strong> ${pkg.transport_type === 'air' ? '✈️ Aérien (3–7 jours)' : '🚢 Maritime (21–30 jours)'}</p>
          <p><strong>Poids :</strong> ${pkg.weight_kg} kg</p>
        </div>

        <p>Pour valider votre envoi, veuillez effectuer le paiement de <strong>${this.formatPrice(pkg.price, pkg.currency)}</strong> :</p>

        <div style="text-align:center;margin:24px 0">
          <a href="${payUrl}" style="background:#F26E22;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
            💳 Payer mon expédition
          </a>
        </div>

        <p style="font-size:12px;color:#888">Lien de suivi : <a href="${trackUrl}">${trackUrl}</a></p>
        <p style="font-size:12px;color:#888">Ce lien de paiement est valide 48 heures.</p>
      `));
    }
    async sendSenderConfirmation(pkg, senderPassword) {
        const trackUrl = `${this.appUrl}/track/${pkg.tracking_number}`;
        let accountSection = '';
        if (senderPassword) {
            accountSection = `
        <div style="background:#EEF3FB;border-left:4px solid #1C4AA6;border-radius:0 12px 12px 0;padding:16px;margin:16px 0">
          <p><strong>🔑 Vos identifiants de connexion</strong> (Application mobile FretSend)</p>
          <p><strong>Email :</strong> ${pkg.sender_email}</p>
          <p><strong>Mot de passe :</strong> <code style="background:#fff;padding:2px 8px;border-radius:6px">${senderPassword}</code></p>
          <p style="font-size:12px;color:#888">Nous vous recommandons de changer ce mot de passe à votre première connexion.</p>
        </div>
      `;
        }
        await this.send(pkg.sender_email, `FretSend — Paiement confirmé ! Envoi ${pkg.tracking_number} en cours`, this.template(`
        <h2 style="color:#1C4AA6">Paiement confirmé ! ✅</h2>
        <p>Bonjour <strong>${pkg.sender_name}</strong>,</p>
        <p>Votre paiement a bien été reçu. Votre colis est maintenant pris en charge par FretSend.</p>

        <div style="background:#F2F2F2;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 8px;border-radius:6px;font-family:monospace">${pkg.tracking_number}</code></p>
          <p><strong>Destinataire :</strong> ${pkg.recipient_name} — ${pkg.destination_agency_name || ''}</p>
          <p><strong>Livraison estimée :</strong> ${pkg.estimated_delivery_date || 'En cours de calcul'}</p>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${trackUrl}" style="background:#1C4AA6;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
            📡 Suivre mon colis
          </a>
        </div>

        ${accountSection}
        <p>Vous serez notifié à chaque étape du transit. Merci de faire confiance à FretSend !</p>
      `));
    }
    async sendRecipientNotification(pkg, recipientPassword) {
        const trackUrl = `${this.appUrl}/track/${pkg.tracking_number}`;
        let accountSection = '';
        if (recipientPassword) {
            accountSection = `
        <div style="background:#FFF7ED;border-left:4px solid #F26E22;border-radius:0 12px 12px 0;padding:16px;margin:16px 0">
          <p><strong>📱 Votre compte FretSend</strong></p>
          <p>Pour une meilleure expérience, téléchargez l'application FretSend et connectez-vous :</p>
          <p><strong>Email :</strong> ${pkg.recipient_email}</p>
          <p><strong>Mot de passe temporaire :</strong> <code style="background:#fff;padding:2px 8px;border-radius:6px">${recipientPassword}</code></p>
          <p style="font-size:12px;color:#888">Changez votre mot de passe à la première connexion.</p>
        </div>
      `;
        }
        await this.send(pkg.recipient_email, `FretSend — Un colis vous a été expédié 📦`, this.template(`
        <h2 style="color:#F26E22">Un colis vous attend ! 🎁</h2>
        <p>Bonjour <strong>${pkg.recipient_name}</strong>,</p>
        <p><strong>${pkg.sender_name}</strong> vous a expédié un colis via FretSend.</p>

        <div style="background:#F2F2F2;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>N° de suivi :</strong> <code style="background:#fff;padding:2px 8px;border-radius:6px;font-family:monospace">${pkg.tracking_number}</code></p>
          <p><strong>De :</strong> ${pkg.origin_agency_name || pkg.origin_city}</p>
          <p><strong>Agence de retrait :</strong> ${pkg.destination_agency_name || pkg.destination_city}</p>
          <p><strong>Transport :</strong> ${pkg.transport_type === 'air' ? '✈️ Aérien (3–7 jours)' : '🚢 Maritime (21–30 jours)'}</p>
          <p><strong>Contenu :</strong> ${pkg.description || 'Non précisé'}</p>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${trackUrl}" style="background:#F26E22;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
            📡 Suivre mon colis
          </a>
        </div>

        ${accountSection}
        <p>Vous recevrez un email dès que votre colis sera disponible en agence.</p>
      `));
    }
    async sendAvailableNotification(pkg) {
        const trackUrl = `${this.appUrl}/track/${pkg.tracking_number}`;
        await this.send(pkg.recipient_email, `FretSend — Votre colis ${pkg.tracking_number} est disponible !`, this.template(`
        <h2 style="color:#27AE60">Votre colis est arrivé ! 🎉</h2>
        <p>Bonjour <strong>${pkg.recipient_name}</strong>,</p>
        <p>Votre colis est maintenant <strong>disponible en agence</strong>. Vous pouvez venir le récupérer !</p>

        <div style="background:#F0FFF4;border:2px solid #27AE60;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
          <p style="font-size:24px;margin:0">✅</p>
          <p style="font-weight:700;color:#27AE60;font-size:18px;margin:8px 0">Disponible en agence</p>
          <p><strong>${pkg.destination_agency_name || 'Votre agence de retrait'}</strong></p>
          <p><code style="background:#fff;padding:4px 12px;border-radius:8px;font-family:monospace;font-size:18px">${pkg.tracking_number}</code></p>
        </div>

        <p><strong>Présentez ce numéro ou ce QR code à l'agent pour récupérer votre colis.</strong></p>

        <div style="text-align:center;margin:24px 0">
          <a href="${trackUrl}" style="background:#1C4AA6;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block">
            Voir les détails
          </a>
        </div>
      `));
    }
    async sendStatusUpdate(pkg, status, title, description) {
        const statusEmojis = {
            in_transit: '🚀', at_customs: '🛃', arrived_hub: '🏭',
            dispatched: '🚚', delivered: '🎉', returned: '↩️',
        };
        const emoji = statusEmojis[status] || '📦';
        const trackUrl = `${this.appUrl}/track/${pkg.tracking_number}`;
        for (const [name, email] of [
            [pkg.sender_name, pkg.sender_email],
            [pkg.recipient_name, pkg.recipient_email],
        ]) {
            if (!email)
                continue;
            await this.send(email, `FretSend — ${title} ${emoji}`, this.template(`
          <h2 style="color:#1C4AA6">${emoji} ${title}</h2>
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>${description}</p>
          <div style="background:#F2F2F2;border-radius:12px;padding:12px;margin:16px 0">
            <p><strong>Colis :</strong> <code>${pkg.tracking_number}</code></p>
          </div>
          <div style="text-align:center;margin:20px 0">
            <a href="${trackUrl}" style="background:#1C4AA6;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">
              Suivre le colis
            </a>
          </div>
        `));
        }
    }
    template(body) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#F2F2F2; margin:0; padding:0; }
  .container { max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
  .header { background:#1C4AA6; padding:24px 32px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:24px; font-weight:900; }
  .header span { color:#F2C49B; }
  .body { padding:32px; color:#374151; line-height:1.6; }
  .footer { background:#F9FAFB; padding:16px 32px; text-align:center; font-size:12px; color:#9CA3AF; border-top:1px solid #E5E7EB; }
  p { margin:8px 0; }
  code { font-family:monospace; }
  h2 { margin-top:0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Fret<span>Send</span></h1>
    <p style="color:#F2C49B;margin:4px 0 0;font-size:13px">France ↔ Cameroun</p>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    <p>© 2026 FretSend — Logistique France ↔ Cameroun</p>
    <p>Vous recevez cet email car vous êtes lié à un envoi FretSend.</p>
  </div>
</div>
</body>
</html>`;
    }
    formatPrice(amount, currency) {
        if (currency === 'EUR')
            return `${amount.toFixed(2)} €`;
        return `${Math.round(amount).toLocaleString('fr')} FCFA`;
    }
    httpPost(url, data, headers) {
        return new Promise((resolve, reject) => {
            const lib = url.startsWith('https') ? https : http;
            const u = new URL(url);
            const opts = {
                hostname: u.hostname,
                port: u.port || (url.startsWith('https') ? 443 : 80),
                path: u.pathname + u.search,
                method: 'POST',
                headers: { ...headers, 'Content-Length': Buffer.byteLength(data) },
            };
            const req = lib.request(opts, (res) => {
                let body = '';
                res.on('data', (c) => (body += c));
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 400)
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    else
                        resolve(body);
                });
            });
            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map