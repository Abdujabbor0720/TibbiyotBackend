import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Conversation, Message, User, Contact } from '../../database/entities';
import { SenderType } from '../../database/enums';
import { EncryptionService } from '../../common/utils/encryption.util';

/**
 * Messaging service for secure conversation management.
 * 
 * SECURITY NOTES:
 * - All message content is encrypted using AES-256-GCM
 * - Message content is never logged
 * - No API exposes message content to admin
 * - Only participants can access their own messages
 */
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  private readonly encryptionService: EncryptionService;

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly configService: ConfigService,
  ) {
    const encryptionKey = this.configService.get<string>('encryption.key');
    if (!encryptionKey) {
      throw new Error('DATA_ENCRYPTION_KEY is required for messaging');
    }
    this.encryptionService = new EncryptionService(encryptionKey);
  }

  /**
   * Get or create a conversation between a student and a contact.
   */
  async getOrCreateConversation(
    studentTelegramUserId: string,
    contactId: string,
  ): Promise<Conversation> {
    // Find the student user
    const student = await this.userRepository.findOne({
      where: { telegramUserId: studentTelegramUserId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if conversation exists
    let conversation = await this.conversationRepository.findOne({
      where: {
        studentUserId: student.id,
        contactId,
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = this.conversationRepository.create({
        studentUserId: student.id,
        contactId,
        isActive: true,
      });
      conversation = await this.conversationRepository.save(conversation);
      
      // Log metadata only, never content
      this.logger.log(`Created conversation: ${conversation.id} (student: ${student.id}, contact: ${contactId})`);
    }

    return conversation;
  }

  /**
   * Store a message from a student to a contact.
   * Encrypts message content before storage.
   */
  async storeStudentMessage(
    conversationId: string,
    senderTelegramUserId: string,
    plainText: string,
    telegramMessageId?: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Encrypt message content
    const { encryptedText, iv, authTag } = this.encryptionService.encrypt(plainText);

    const message = this.messageRepository.create({
      conversationId,
      senderType: SenderType.STUDENT,
      senderTelegramUserId,
      encryptedText,
      iv,
      authTag,
      telegramMessageId: telegramMessageId || null,
    });

    const saved = await this.messageRepository.save(message);

    // Update conversation last message timestamp
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    // Log metadata only
    this.logger.log(`Message stored: ${saved.id} in conversation ${conversationId}`);

    return saved;
  }

  /**
   * Store a message from a contact to a student.
   * Encrypts message content before storage.
   */
  async storeContactMessage(
    conversationId: string,
    senderTelegramUserId: string,
    plainText: string,
    telegramMessageId?: string,
  ): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Encrypt message content
    const { encryptedText, iv, authTag } = this.encryptionService.encrypt(plainText);

    const message = this.messageRepository.create({
      conversationId,
      senderType: SenderType.CONTACT,
      senderTelegramUserId,
      encryptedText,
      iv,
      authTag,
      telegramMessageId: telegramMessageId || null,
    });

    const saved = await this.messageRepository.save(message);

    // Update conversation last message timestamp
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    // Log metadata only
    this.logger.log(`Message stored: ${saved.id} in conversation ${conversationId}`);

    return saved;
  }

  /**
   * Decrypt message content for delivery.
   * Only for internal use by the bot module.
   */
  decryptMessage(message: Message): string | null {
    if (!message.encryptedText || !message.iv || !message.authTag) {
      return null;
    }

    return this.encryptionService.decrypt(
      message.encryptedText,
      message.iv,
      message.authTag,
    );
  }

  /**
   * Find conversation by student's Telegram user ID (for reply routing).
   */
  async findConversationByContactAndStudent(
    contactTelegramUserId: string,
    studentTelegramUserId: string,
  ): Promise<Conversation | null> {
    const contact = await this.contactRepository.findOne({
      where: { telegramUserId: contactTelegramUserId },
    });

    if (!contact) {
      return null;
    }

    const student = await this.userRepository.findOne({
      where: { telegramUserId: studentTelegramUserId },
    });

    if (!student) {
      return null;
    }

    return this.conversationRepository.findOne({
      where: {
        studentUserId: student.id,
        contactId: contact.id,
      },
      relations: ['student', 'contact'],
    });
  }

  /**
   * Find active conversation for a contact person.
   * Used for routing replies from contact to student.
   */
  async findActiveConversationsForContact(
    contactTelegramUserId: string,
  ): Promise<Conversation[]> {
    const contact = await this.contactRepository.findOne({
      where: { telegramUserId: contactTelegramUserId },
    });

    if (!contact) {
      return [];
    }

    return this.conversationRepository.find({
      where: {
        contactId: contact.id,
        isActive: true,
      },
      relations: ['student'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  /**
   * Get conversation with student info for contact's reply routing.
   */
  async getConversationForReply(
    conversationId: string,
  ): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['student', 'contact'],
    });
  }

  /**
   * Get student's Telegram ID from conversation.
   */
  async getStudentTelegramIdFromConversation(
    conversationId: string,
  ): Promise<string | null> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['student'],
    });

    return conversation?.student?.telegramUserId || null;
  }

  /**
   * Get contact's Telegram ID from conversation.
   */
  async getContactTelegramIdFromConversation(
    conversationId: string,
  ): Promise<string | null> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['contact'],
    });

    return conversation?.contact?.telegramUserId || null;
  }
}
