import { BroadcastStatus } from '../../../database/enums';

/**
 * Response DTO for broadcast.
 */
export class BroadcastResponseDto {
  id: string;
  status: BroadcastStatus;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}
