import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [PrismaService], // Shared database connection
})
export class AppModule {}