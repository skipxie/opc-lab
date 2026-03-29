import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
const session = require('express-session');
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 托管前端静态文件（生产环境）
  app.useStaticAssets(join(process.cwd(), '..', 'dist'), {
    prefix: '/',
  });

  // 托管静态文件（生成的静态页面）
  app.useStaticAssets(join(process.cwd(), 'dist', 'static'), {
    prefix: '/static/',
  });

  // SPA 路由回退
  app.use((req: any, res: any, next: () => void) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/static')) {
      return next();
    }
    res.sendFile(join(process.cwd(), '..', 'dist', 'index.html'));
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'opc-lab-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
