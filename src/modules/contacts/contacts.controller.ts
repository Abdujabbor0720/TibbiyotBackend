import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
  PublicContactResponseDto,
} from './dto';
import { JwtAuthGuard, AdminGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../auth/auth.service';

/**
 * Public contacts controller.
 * Provides read-only access to active contacts.
 * No authentication required for public contacts list.
 */
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * Get all active contacts.
   * Public endpoint - no authentication required.
   * Returns limited contact information.
   */
  @Get()
  async findAllActive(): Promise<PublicContactResponseDto[]> {
    return this.contactsService.findAllActive();
  }

  /**
   * Get single contact by ID.
   * Public endpoint - no authentication required.
   * Returns limited contact information.
   */
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<PublicContactResponseDto> {
    return this.contactsService.findByIdPublic(id);
  }
}

/**
 * Admin contacts controller.
 * Provides full CRUD access for admin users.
 */
@Controller('admin/contacts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * Get all contacts.
   * Admin only - returns full details.
   */
  @Get()
  async findAll(): Promise<ContactResponseDto[]> {
    return this.contactsService.findAll();
  }

  /**
   * Get contact by ID.
   * Admin only - returns full details.
   */
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<ContactResponseDto> {
    return this.contactsService.findById(id);
  }

  /**
   * Create a new contact person.
   * Admin only.
   */
  @Post()
  async create(
    @Body() dto: CreateContactDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ContactResponseDto> {
    return this.contactsService.create(dto, user.sub);
  }

  /**
   * Update a contact person.
   * Admin only.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ContactResponseDto> {
    return this.contactsService.update(id, dto, user.sub);
  }

  /**
   * Delete a contact person.
   * Admin only.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.contactsService.delete(id, user.sub);
  }
}
