import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Sécurité HTTP ─────────────────────────────────────────
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // Swagger UI
    }),
  );

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:8081', // Expo mobile
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Versioning /api/v1 ────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // ── Validation globale ────────────────────────────────────
  // Tous les DTOs sont validés automatiquement
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Supprime les champs non déclarés dans le DTO
      forbidNonWhitelisted: true, // Retourne une erreur si champ inconnu
      transform: true,           // Convertit les types automatiquement
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Réponses standardisées ────────────────────────────────
  // Toutes les réponses auront le format : { success, data, timestamp }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Gestion des erreurs ───────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Documentation Swagger ─────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FretSend API')
    .setDescription(
      '## API REST de la plateforme FretSend\n\n' +
      'Gestion et suivi de colis **France ↔ Cameroun**\n\n' +
      '### Authentification\n' +
      'Utiliser le bouton **Authorize** pour entrer votre Bearer token JWT.\n\n' +
      '### Format des réponses\n' +
      '```json\n{ "success": true, "data": {...}, "timestamp": "..." }\n```',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('Auth', 'Authentification et gestion des tokens')
    .addTag('Packages', 'Gestion des colis')
    .addTag('Tracking', 'Suivi et événements')
    .addTag('Agencies', 'Gestion des agences')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Shipments', 'Expéditions groupées')
    .addTag('Pricing', 'Tarification et calcul de prix')
    .addTag('Notifications', 'Historique des notifications')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📦 FretSend API — France ↔ Cameroun');
  console.log(`  🚀 Serveur     : http://localhost:${port}`);
  console.log(`  📚 Swagger     : http://localhost:${port}/api/docs`);
  console.log(`  🌍 Env         : ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

bootstrap();
