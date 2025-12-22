import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
  };
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
      },
    };
  }

  @Get('ready')
  async ready(): Promise<{ ready: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { ready: true };
    } catch {
      return { ready: false };
    }
  }

  @Get('live')
  live(): { live: boolean } {
    return { live: true };
  }
}
