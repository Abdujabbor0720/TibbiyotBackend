import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto, BroadcastResponseDto } from './dto';
import { JwtAuthGuard, AdminGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';

@Controller('admin/broadcast')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  /**
   * Create and enqueue a broadcast.
   * Admin only.
   */
  @Post()
  async create(
    @Body() dto: CreateBroadcastDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BroadcastResponseDto> {
    return this.broadcastService.create(dto, user.sub);
  }

  /**
   * Get broadcast status.
   */
  @Get(':id')
  async getStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BroadcastResponseDto> {
    return this.broadcastService.getStatus(id);
  }

  /**
   * Get all broadcasts.
   */
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ items: BroadcastResponseDto[]; total: number }> {
    return this.broadcastService.getAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
