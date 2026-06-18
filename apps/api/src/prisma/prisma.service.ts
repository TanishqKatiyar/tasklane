import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // Keep connection count low for Neon free tier (max 50 total)
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === 'production'
          ? [{ emit: 'event', level: 'query' }]
          : ['warn', 'error'],
    });

    // Log slow queries (>500ms) in production
    if (process.env.NODE_ENV === 'production') {
      // @ts-expect-error: Prisma event typing
      this.$on('query', (e: { duration: number; query: string }) => {
        if (e.duration > 500) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query.slice(0, 120)}`);
        }
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to database…');
    await this.$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database…');
    await this.$disconnect();
  }
}
