import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotService } from './bot.service';
import { User } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
