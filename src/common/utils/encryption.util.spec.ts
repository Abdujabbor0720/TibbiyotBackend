import { EncryptionService, getEncryptionService, resetEncryptionService } from './encryption.util';

describe('EncryptionService', () => {
  // 32-byte key in hex (64 hex characters)
  const validKey = 'a'.repeat(64);
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService(validKey);
    resetEncryptionService();
  });

  describe('constructor', () => {
    it('should create instance with valid 64-char hex key', () => {
      expect(() => new EncryptionService(validKey)).not.toThrow();
    });

    it('should throw error for invalid key length', () => {
      expect(() => new EncryptionService('tooshort')).toThrow();
    });

    it('should throw error for empty key', () => {
      expect(() => new EncryptionService('')).toThrow();
    });
  });

  describe('encrypt', () => {
    it('should encrypt a string successfully', () => {
      const plaintext = 'Hello, World!';
      const result = encryptionService.encrypt(plaintext);

      expect(result).toHaveProperty('encryptedText');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result.encryptedText).not.toBe(plaintext);
      expect(result.iv.length).toBe(24); // 12 bytes = 24 hex chars
      expect(result.authTag.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should produce different ciphertext for same plaintext (random IV)', () => {
      const plaintext = 'Same message';
      const result1 = encryptionService.encrypt(plaintext);
      const result2 = encryptionService.encrypt(plaintext);

      expect(result1.encryptedText).not.toBe(result2.encryptedText);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it('should handle empty string', () => {
      const result = encryptionService.encrypt('');
      expect(result).toHaveProperty('encryptedText');
    });

    it('should handle Unicode characters', () => {
      const plaintext = '你好世界 🌍 مرحبا';
      const result = encryptionService.encrypt(plaintext);
      expect(result).toHaveProperty('encryptedText');
    });

    it('should handle long messages', () => {
      const plaintext = 'x'.repeat(10000);
      const result = encryptionService.encrypt(plaintext);
      expect(result).toHaveProperty('encryptedText');
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encryptionService.encrypt(plaintext);
      
      const decrypted = encryptionService.decrypt(
        encrypted.encryptedText,
        encrypted.iv,
        encrypted.authTag,
      );

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt Unicode characters correctly', () => {
      const plaintext = '你好世界 🌍 مرحبا Привет';
      const encrypted = encryptionService.encrypt(plaintext);
      
      const decrypted = encryptionService.decrypt(
        encrypted.encryptedText,
        encrypted.iv,
        encrypted.authTag,
      );

      expect(decrypted).toBe(plaintext);
    });

    it('should return null for tampered ciphertext', () => {
      const encrypted = encryptionService.encrypt('Original message');
      
      // Tamper with the encrypted data
      const tamperedData = 'X' + encrypted.encryptedText.slice(1);
      
      const result = encryptionService.decrypt(tamperedData, encrypted.iv, encrypted.authTag);
      expect(result).toBeNull();
    });

    it('should return null for invalid authTag', () => {
      const encrypted = encryptionService.encrypt('Original message');
      
      // Use wrong authTag
      const wrongAuthTag = 'b'.repeat(32);
      
      const result = encryptionService.decrypt(encrypted.encryptedText, encrypted.iv, wrongAuthTag);
      expect(result).toBeNull();
    });

    it('should return null for wrong IV', () => {
      const encrypted = encryptionService.encrypt('Original message');
      
      // Use wrong IV
      const wrongIv = 'c'.repeat(24);
      
      const result = encryptionService.decrypt(encrypted.encryptedText, wrongIv, encrypted.authTag);
      expect(result).toBeNull();
    });

    it('should not decrypt with different key', () => {
      const encrypted = encryptionService.encrypt('Secret message');
      
      // Create new util with different key
      const differentKey = 'b'.repeat(64);
      const differentService = new EncryptionService(differentKey);
      
      const result = differentService.decrypt(encrypted.encryptedText, encrypted.iv, encrypted.authTag);
      expect(result).toBeNull();
    });
  });

  describe('getEncryptionService', () => {
    it('should return singleton instance', () => {
      const service1 = getEncryptionService(validKey);
      const service2 = getEncryptionService();
      expect(service1).toBe(service2);
    });

    it('should throw if no key provided on first call', () => {
      expect(() => getEncryptionService()).toThrow();
    });
  });

  describe('round-trip encryption', () => {
    const testCases = [
      { name: 'simple string', input: 'Hello' },
      { name: 'empty string', input: '' },
      { name: 'special characters', input: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
      { name: 'newlines', input: 'Line 1\nLine 2\r\nLine 3' },
      { name: 'JSON', input: JSON.stringify({ foo: 'bar', nested: { a: 1 } }) },
      { name: 'long text', input: 'Lorem ipsum '.repeat(1000) },
      { name: 'emojis', input: '😀🎉🚀💻🌈' },
      { name: 'mixed languages', input: 'English 中文 العربية עברית' },
    ];

    testCases.forEach(({ name, input }) => {
      it(`should round-trip ${name}`, () => {
        const encrypted = encryptionService.encrypt(input);
        const decrypted = encryptionService.decrypt(
          encrypted.encryptedText,
          encrypted.iv,
          encrypted.authTag,
        );
        expect(decrypted).toBe(input);
      });
    });
  });
});
