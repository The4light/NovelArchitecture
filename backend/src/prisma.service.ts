import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database Connected Successfully');
    } catch (error) {
      console.error('❌ Database Connection Failed:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}