import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable CORS so your frontend can communicate with the backend
    app.enableCors();

    // Start the server on port 4000
    await app.listen(4000);
    console.log(`🚀 TenderIQ API running on: http://localhost:4000`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

// Boot the application
bootstrap();