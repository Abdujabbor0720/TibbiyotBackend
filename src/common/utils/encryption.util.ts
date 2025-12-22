import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * AES-256-GCM encryption service for sensitive data.
 * Used for encrypting message contents before database storage.
 * 
 * SECURITY NOTES:
 * - Uses AES-256-GCM which provides authenticated encryption
 * - Each encryption uses a unique IV (Initialization Vector)
 * - Auth tag ensures data integrity and authenticity
 * - Key must be 32 bytes (64 hex characters)
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12; // 96 bits recommended for GCM
  private readonly authTagLength = 16; // 128 bits
  private readonly key: Buffer;

  constructor(hexKey: string) {
    if (!hexKey || hexKey.length !== 64) {
      throw new Error('Encryption key must be 64 hex characters (32 bytes)');
    }
    this.key = Buffer.from(hexKey, 'hex');
  }

  /**
   * Encrypts plaintext and returns encrypted data with IV and auth tag.
   */
  encrypt(plaintext: string): { encryptedText: string; iv: string; authTag: string } {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv, {
      authTagLength: this.authTagLength,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    return {
      encryptedText: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypts encrypted data using IV and auth tag.
   * Returns null if decryption fails (tampered data).
   */
  decrypt(encryptedText: string, ivHex: string, authTagHex: string): string | null {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, this.key, iv, {
        authTagLength: this.authTagLength,
      });
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      // Decryption failed - likely tampered data
      return null;
    }
  }
}

/**
 * Singleton instance for encryption service.
 * Initialized with DATA_ENCRYPTION_KEY from environment.
 */
let encryptionServiceInstance: EncryptionService | null = null;

export function getEncryptionService(key?: string): EncryptionService {
  if (!encryptionServiceInstance) {
    const encryptionKey = key || process.env.DATA_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('DATA_ENCRYPTION_KEY environment variable is required');
    }
    encryptionServiceInstance = new EncryptionService(encryptionKey);
  }
  return encryptionServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing).
 */
export function resetEncryptionService(): void {
  encryptionServiceInstance = null;
}
