import { verifyTelegramInitData, parseInitData, TelegramInitData } from './telegram-auth.util';
import * as crypto from 'crypto';

describe('TelegramAuthUtil', () => {
  const botToken = 'test_bot_token_12345';
  
  // Helper to create valid initData
  const createValidInitData = (
    userData: Record<string, unknown>,
    overrides: Record<string, string> = {},
  ): string => {
    const user = JSON.stringify(userData);
    const authDate = Math.floor(Date.now() / 1000).toString();
    
    const params = new URLSearchParams({
      user,
      auth_date: authDate,
      ...overrides,
    });
    
    // Sort parameters
    const sortedParams = Array.from(params.entries())
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Calculate hash
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    const hash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');
    
    params.set('hash', hash);
    return params.toString();
  };

  describe('verifyTelegramInitData', () => {
    it('should verify valid initData', () => {
      const userData = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
      };
      
      const initData = createValidInitData(userData);
      const result = verifyTelegramInitData(initData, botToken, 300);
      
      expect(result).not.toBeNull();
      expect(result?.user).toBeDefined();
      expect(result?.user?.id).toBe(123456789);
      expect(result?.user?.first_name).toBe('Test');
      expect(result?.user?.last_name).toBe('User');
    });

    it('should reject invalid hash', () => {
      const userData = {
        id: 123456789,
        first_name: 'Test',
      };
      
      const initData = createValidInitData(userData);
      // Tamper with the data
      const tamperedData = initData.replace('Test', 'Hacked');
      
      const result = verifyTelegramInitData(tamperedData, botToken, 300);
      
      expect(result).toBeNull();
    });

    it('should reject expired initData', () => {
      const userData = {
        id: 123456789,
        first_name: 'Test',
      };
      
      // Create initData with old auth_date (10 minutes ago)
      const oldAuthDate = (Math.floor(Date.now() / 1000) - 600).toString();
      const initData = createValidInitData(userData, { auth_date: oldAuthDate });
      
      // Use 5 minute max age
      const result = verifyTelegramInitData(initData, botToken, 300);
      
      expect(result).toBeNull();
    });

    it('should reject missing hash', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 123 }),
        auth_date: Math.floor(Date.now() / 1000).toString(),
      });
      
      const result = verifyTelegramInitData(params.toString(), botToken, 300);
      
      expect(result).toBeNull();
    });

    it('should reject invalid auth_date', () => {
      const params = new URLSearchParams({
        user: JSON.stringify({ id: 123 }),
        auth_date: 'not-a-number',
        hash: 'somehash',
      });
      
      const result = verifyTelegramInitData(params.toString(), botToken, 300);
      
      expect(result).toBeNull();
    });

    it('should handle missing user gracefully', () => {
      const authDate = Math.floor(Date.now() / 1000).toString();
      
      const params = new URLSearchParams({
        auth_date: authDate,
      });
      
      const sortedParams = `auth_date=${authDate}`;
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
      
      const hash = crypto
        .createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');
      
      params.set('hash', hash);
      
      const result = verifyTelegramInitData(params.toString(), botToken, 300);
      
      // Should be valid but without user
      expect(result).not.toBeNull();
      expect(result?.user).toBeUndefined();
    });
  });

  describe('parseInitData', () => {
    it('should parse valid initData string', () => {
      const userData = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en',
      };
      
      const initData = createValidInitData(userData);
      const parsed = parseInitData(initData);
      
      expect(parsed).toBeDefined();
      expect(parsed.user).toBeDefined();
      expect(parsed.auth_date).toBeDefined();
      expect(parsed.hash).toBeDefined();
    });

    it('should handle empty string', () => {
      const parsed = parseInitData('');
      
      expect(parsed).toBeDefined();
      expect(Object.keys(parsed).length).toBe(0);
    });
  });
});
