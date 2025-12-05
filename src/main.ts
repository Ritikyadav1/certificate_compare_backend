import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security Headers
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  app.use(require('helmet')());

  // Strict CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', // Local Frontend
      'http://localhost:4173', // Vite Preview
      'https://certificates-compare-frontend-n7j4gaee8.vercel.app', // Deployed Frontend
      'https://certificates-compare-frontend.vercel.app', // Production Alias
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
