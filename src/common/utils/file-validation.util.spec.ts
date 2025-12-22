import { validateFileByMagicBytes, ALLOWED_FILE_TYPES, sanitizeFilename, validateFileSize } from './file-validation.util';

describe('FileValidationUtil', () => {
  describe('validateFileByMagicBytes', () => {
    const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);

    describe('JPEG validation', () => {
      it('should accept valid JPEG file', async () => {
        // JPEG magic bytes: FF D8 FF
        const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
        const result = await validateFileByMagicBytes(jpegBuffer, allowedTypes);
        expect(result.isValid).toBe(true);
        expect(result.mimeType).toBe('image/jpeg');
      });
    });

    describe('PNG validation', () => {
      it('should accept valid PNG file', async () => {
        // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const result = await validateFileByMagicBytes(pngBuffer, allowedTypes);
        expect(result.isValid).toBe(true);
        expect(result.mimeType).toBe('image/png');
      });
    });

    describe('GIF validation', () => {
      it('should accept GIF87a', async () => {
        // GIF87a magic bytes: 47 49 46 38 37 61
        const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
        const result = await validateFileByMagicBytes(gifBuffer, allowedTypes);
        expect(result.isValid).toBe(true);
        expect(result.mimeType).toBe('image/gif');
      });

      it('should accept GIF89a', async () => {
        // GIF89a magic bytes: 47 49 46 38 39 61
        const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
        const result = await validateFileByMagicBytes(gifBuffer, allowedTypes);
        expect(result.isValid).toBe(true);
        expect(result.mimeType).toBe('image/gif');
      });
    });

    describe('Edge cases', () => {
      it('should reject file type not in allowed list', async () => {
        // PNG magic bytes but only allow JPEG
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        const result = await validateFileByMagicBytes(pngBuffer, ['image/jpeg']);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('not allowed');
      });

      it('should reject empty buffer', async () => {
        const emptyBuffer = Buffer.alloc(0);
        const result = await validateFileByMagicBytes(emptyBuffer, allowedTypes);
        expect(result.isValid).toBe(false);
      });

      it('should reject unrecognized file content', async () => {
        const randomBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
        const result = await validateFileByMagicBytes(randomBuffer, allowedTypes);
        expect(result.isValid).toBe(false);
      });
    });

    describe('Security tests', () => {
      it('should reject HTML disguised as image', async () => {
        const htmlBuffer = Buffer.from('<html><script>alert(1)</script>', 'utf8');
        const result = await validateFileByMagicBytes(htmlBuffer, ['image/jpeg', 'image/png']);
        expect(result.isValid).toBe(false);
      });

      it('should reject ZIP disguised as image', async () => {
        // ZIP magic bytes: 50 4B 03 04
        const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
        const result = await validateFileByMagicBytes(zipBuffer, ['image/png', 'image/jpeg']);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path traversal attempts', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etc_passwd');
      expect(sanitizeFilename('..\\..\\windows\\system32\\config')).toBe('config');
    });

    it('should remove special characters', () => {
      expect(sanitizeFilename('file<>:"|?*name.txt')).toBe('file________name.txt');
    });

    it('should handle hidden files', () => {
      expect(sanitizeFilename('.hidden')).toBe('hidden');
      expect(sanitizeFilename('..hidden')).toBe('hidden');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });

    it('should return "file" for empty result', () => {
      expect(sanitizeFilename('...')).toBe('file');
      expect(sanitizeFilename('')).toBe('file');
    });

    it('should preserve valid characters', () => {
      expect(sanitizeFilename('valid_file-name.123.txt')).toBe('valid_file-name.123.txt');
    });
  });

  describe('validateFileSize', () => {
    it('should accept file within size limit', () => {
      expect(validateFileSize(1024, 10240)).toBe(true);
      expect(validateFileSize(10240, 10240)).toBe(true);
    });

    it('should reject file exceeding size limit', () => {
      expect(validateFileSize(10241, 10240)).toBe(false);
    });

    it('should reject zero-size file', () => {
      expect(validateFileSize(0, 10240)).toBe(false);
    });

    it('should reject negative size', () => {
      expect(validateFileSize(-100, 10240)).toBe(false);
    });
  });

  describe('ALLOWED_FILE_TYPES', () => {
    it('should have entries for common image types', () => {
      expect(ALLOWED_FILE_TYPES['image/jpeg']).toBeDefined();
      expect(ALLOWED_FILE_TYPES['image/png']).toBeDefined();
      expect(ALLOWED_FILE_TYPES['image/gif']).toBeDefined();
      expect(ALLOWED_FILE_TYPES['image/webp']).toBeDefined();
    });

    it('should have entries for video types', () => {
      expect(ALLOWED_FILE_TYPES['video/mp4']).toBeDefined();
      expect(ALLOWED_FILE_TYPES['video/webm']).toBeDefined();
    });

    it('should have entries for audio types', () => {
      expect(ALLOWED_FILE_TYPES['audio/mpeg']).toBeDefined();
      expect(ALLOWED_FILE_TYPES['audio/ogg']).toBeDefined();
    });

    it('should have category for each type', () => {
      Object.values(ALLOWED_FILE_TYPES).forEach(type => {
        expect(type.category).toBeDefined();
        expect(['image', 'video', 'audio']).toContain(type.category);
      });
    });
  });
});
