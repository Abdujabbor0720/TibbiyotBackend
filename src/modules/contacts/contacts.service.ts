import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../database/entities';
import { ContactStatus, AuditAction, AuditEntityType } from '../../database/enums';
import { AuditService } from '../audit/audit.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactResponseDto,
  PublicContactResponseDto,
} from './dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new contact person.
   * Admin only.
   */
  async create(dto: CreateContactDto, userId?: string): Promise<ContactResponseDto> {
    // Check for duplicate Telegram user ID
    const existing = await this.contactRepository.findOne({
      where: { telegramUserId: dto.telegramUserId },
    });

    if (existing) {
      throw new ConflictException('Contact with this Telegram user ID already exists');
    }

    const contact = this.contactRepository.create({
      fullName: dto.fullName,
      telegramUserId: dto.telegramUserId,
      position: dto.position || null,
      department: dto.department || null,
      description: dto.description || null,
      photoUrl: dto.photoUrl || null,
      isActive: dto.isActive ?? true,
      sortOrder: dto.sortOrder ?? 0,
      status: ContactStatus.ACTIVE,
    });

    const saved = await this.contactRepository.save(contact);
    
    // Log audit - always log
    await this.auditService.log({
      actorUserId: userId || null,
      action: AuditAction.CONTACT_CREATE,
      entityType: AuditEntityType.CONTACT,
      entityId: saved.id,
      metadata: { fullName: saved.fullName },
    });
    
    this.logger.log(`Created contact: ${saved.id} (Telegram: ${dto.telegramUserId})`);

    return this.toResponseDto(saved);
  }

  /**
   * Update a contact person.
   * Admin only.
   */
  async update(id: string, dto: UpdateContactDto, userId?: string): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // Check for duplicate Telegram user ID if being changed
    if (dto.telegramUserId && dto.telegramUserId !== contact.telegramUserId) {
      const existing = await this.contactRepository.findOne({
        where: { telegramUserId: dto.telegramUserId },
      });

      if (existing) {
        throw new ConflictException('Contact with this Telegram user ID already exists');
      }
    }

    // Update fields
    if (dto.fullName !== undefined) contact.fullName = dto.fullName;
    if (dto.telegramUserId !== undefined) contact.telegramUserId = dto.telegramUserId;
    if (dto.position !== undefined) contact.position = dto.position;
    if (dto.department !== undefined) contact.department = dto.department;
    if (dto.description !== undefined) contact.description = dto.description;
    if (dto.photoUrl !== undefined) contact.photoUrl = dto.photoUrl;
    if (dto.status !== undefined) contact.status = dto.status;
    if (dto.isActive !== undefined) contact.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) contact.sortOrder = dto.sortOrder;

    const updated = await this.contactRepository.save(contact);
    
    // Log audit - always log
    await this.auditService.log({
      actorUserId: userId || null,
      action: AuditAction.CONTACT_UPDATE,
      entityType: AuditEntityType.CONTACT,
      entityId: id,
      metadata: { fullName: updated.fullName },
    });
    
    this.logger.log(`Updated contact: ${id}`);

    return this.toResponseDto(updated);
  }

  /**
   * Delete a contact person.
   * Admin only.
   */
  async delete(id: string, userId?: string): Promise<void> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const fullName = contact.fullName;
    await this.contactRepository.remove(contact);
    
    // Log audit - always log
    await this.auditService.log({
      actorUserId: userId || null,
      action: AuditAction.CONTACT_DELETE,
      entityType: AuditEntityType.CONTACT,
      entityId: id,
      metadata: { fullName: contact.fullName },
    });
    
    this.logger.log(`Deleted contact: ${id}`);
  }

  /**
   * Get contact by ID.
   * Admin only - returns full details.
   */
  async findById(id: string): Promise<ContactResponseDto> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.toResponseDto(contact);
  }

  /**
   * Get all contacts.
   * Admin only - returns full details.
   */
  async findAll(): Promise<ContactResponseDto[]> {
    const contacts = await this.contactRepository.find({
      order: { sortOrder: 'ASC', fullName: 'ASC' },
    });

    return contacts.map((c) => this.toResponseDto(c));
  }

  /**
   * Get all active contacts.
   * Public endpoint - returns limited details.
   */
  async findAllActive(): Promise<PublicContactResponseDto[]> {
    const contacts = await this.contactRepository.find({
      where: { isActive: true, status: ContactStatus.ACTIVE },
      order: { sortOrder: 'ASC', fullName: 'ASC' },
    });

    return contacts.map((c) => this.toPublicResponseDto(c));
  }

  /**
   * Get single contact by ID.
   * Public endpoint - returns limited details.
   */
  async findByIdPublic(id: string): Promise<PublicContactResponseDto> {
    const contact = await this.contactRepository.findOne({
      where: { id, isActive: true, status: ContactStatus.ACTIVE },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.toPublicResponseDto(contact);
  }

  /**
   * Get contact entity by ID.
   * Internal use only.
   */
  async getContactEntity(id: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { id } });
  }

  /**
   * Get contact by Telegram user ID.
   * Internal use for bot message routing.
   */
  async findByTelegramUserId(telegramUserId: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { telegramUserId } });
  }

  /**
   * Update contact status (for bot reachability check).
   */
  async updateStatus(id: string, status: ContactStatus): Promise<void> {
    await this.contactRepository.update(id, { status });
  }

  /**
   * Convert to full response DTO.
   */
  private toResponseDto(contact: Contact): ContactResponseDto {
    return {
      id: contact.id,
      fullName: contact.fullName,
      telegramUserId: contact.telegramUserId,
      position: contact.position,
      department: contact.department,
      description: contact.description,
      photoUrl: contact.photoUrl,
      status: contact.status,
      isActive: contact.isActive,
      sortOrder: contact.sortOrder,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }

  /**
   * Convert to public response DTO.
   */
  private toPublicResponseDto(contact: Contact): PublicContactResponseDto {
    return {
      id: contact.id,
      fullName: contact.fullName,
      position: contact.position,
      department: contact.department,
      description: contact.description,
      photoUrl: contact.photoUrl,
      status: contact.status,
    };
  }
}
