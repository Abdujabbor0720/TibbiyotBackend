import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, AdminGuard } from '../../common/guards';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get dashboard statistics.
   * Admin only.
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Get activity logs (audit logs).
   * Admin only.
   */
  @Get('activity')
  async getActivityLogs(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.adminService.getActivityLogs(limit, offset);
  }
}
