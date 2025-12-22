import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController, AdminContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from '../../database/entities';
import { AuthModule } from '../auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    AuthModule,
  ],
  controllers: [ContactsController, AdminContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
