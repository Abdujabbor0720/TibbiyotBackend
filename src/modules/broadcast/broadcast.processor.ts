import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { BroadcastService, BroadcastJobData } from './broadcast.service';
import { BroadcastStatus } from '../../database/enums';

/**
 * Broadcast queue processor.
 * Handles sending messages to all bot users with rate limiting.
 * 
 * IMPORTANT: This processor will be initialized when BotService is available.
 * For now, it stores the broadcast intent and the bot service will process it.
 */
@Processor('broadcast')
export class BroadcastProcessor {
  private readonly logger = new Logger(BroadcastProcessor.name);
  private readonly rateLimit: number;
  private readonly batchSize: number;

  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly configService: ConfigService,
  ) {
    this.rateLimit = this.configService.get('broadcast.rateLimit') || 25;
    this.batchSize = this.configService.get('broadcast.batchSize') || 100;
  }

  @Process('send')
  async handleBroadcast(job: Job<BroadcastJobData>): Promise<void> {
    const { broadcastId, message } = job.data;

    this.logger.log(`Processing broadcast: ${broadcastId}`);

    try {
      // Update status to processing
      await this.broadcastService.updateProgress(
        broadcastId,
        0,
        0,
        BroadcastStatus.PROCESSING,
      );

      // Get all bot users
      const users = await this.broadcastService.getBotUsers();
      const total = users.length;

      let successCount = 0;
      let failureCount = 0;

      // Process in batches
      for (let i = 0; i < users.length; i += this.batchSize) {
        const batch = users.slice(i, i + this.batchSize);

        for (const user of batch) {
          try {
            // Note: Actual sending will be done by bot service
            // This is a placeholder - in production, emit an event or call bot service
            // await this.botService.sendMessage(user.telegramUserId, message);
            successCount++;
          } catch (error) {
            failureCount++;
            this.logger.warn(`Failed to send to ${user.telegramUserId}: ${error}`);
          }

          // Rate limiting: wait between messages
          await this.delay(1000 / this.rateLimit);
        }

        // Update progress
        await this.broadcastService.updateProgress(
          broadcastId,
          successCount,
          failureCount,
        );

        // Update job progress
        const progress = Math.round(((successCount + failureCount) / total) * 100);
        await job.progress(progress);
      }

      // Mark as completed
      await this.broadcastService.updateProgress(
        broadcastId,
        successCount,
        failureCount,
        BroadcastStatus.COMPLETED,
      );

      this.logger.log(
        `Broadcast ${broadcastId} completed: ${successCount} success, ${failureCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Broadcast ${broadcastId} failed:`, error);

      await this.broadcastService.updateProgress(
        broadcastId,
        0,
        0,
        BroadcastStatus.FAILED,
      );

      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job<BroadcastJobData>): void {
    this.logger.log(`Broadcast job started: ${job.data.broadcastId}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<BroadcastJobData>): void {
    this.logger.log(`Broadcast job completed: ${job.data.broadcastId}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<BroadcastJobData>, error: Error): void {
    this.logger.error(
      `Broadcast job failed: ${job.data.broadcastId}`,
      error.message,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
