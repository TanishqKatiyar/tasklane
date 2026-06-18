import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

/**
 * KeepAliveService — prevents Render free tier cold starts by self-pinging
 * the health endpoint every 5 minutes.
 *
 * On Render's free tier, services spin down after 15 minutes of inactivity,
 * causing ~30s cold start delays. This cron job keeps the process warm.
 */
@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  constructor(private readonly config: ConfigService) {}

  @Cron('*/5 * * * *') // every 5 minutes
  async pingHealthEndpoint(): Promise<void> {
    // Only run in production to avoid noise during local dev
    if (this.config.get<string>('NODE_ENV') !== 'production') return;

    const port = this.config.get<number>('PORT', 10000);
    const url = `http://localhost:${port}/api/v1/health`;

    try {
      const start = Date.now();
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const ms = Date.now() - start;
      if (res.ok) {
        this.logger.debug(`Keep-alive ping OK (${ms}ms)`);
      } else {
        this.logger.warn(`Keep-alive ping got ${res.status} (${ms}ms)`);
      }
    } catch (err) {
      this.logger.warn(`Keep-alive ping failed: ${(err as Error).message}`);
    }
  }
}
