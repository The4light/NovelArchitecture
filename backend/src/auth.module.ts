import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module'; // Import the module
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule], // <--- This MUST be here for the routes to show up
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}