import { createHmac } from 'crypto';

/**
 * Telegram WebApp initData verification utility.
 * Implements HMAC SHA-256 validation as per Telegram documentation.
 * 
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * 
 * SECURITY NOTES:
 * - Always verify initData before trusting any data from it
 * - Set maximum age to prevent replay attacks
 * - Never trust client-provided isAdmin; always verify server-side
 */

export interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date: number;
  hash: string;
  [key: string]: unknown;
}

/**
 * Parse initData string into key-value pairs.
 */
export function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const data: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  
  return data;
}

/**
 * Verify Telegram WebApp initData using HMAC SHA-256.
 * Returns parsed data if valid, null if invalid.
 * 
 * @param initData - The init_data string from Telegram WebApp
 * @param botToken - The bot token from BotFather
 * @param maxAgeSeconds - Maximum age of initData in seconds (default: 300 = 5 minutes)
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number = 300
): TelegramInitData | null {
  try {
    const data = parseInitData(initData);
    const receivedHash = data.hash;
    
    if (!receivedHash) {
      return null;
    }

    // Check auth_date for expiration
    const authDate = parseInt(data.auth_date, 10);
    if (isNaN(authDate)) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) {
      return null; // Expired
    }

    // Build data check string
    // Sort keys alphabetically, exclude hash, join with newlines
    const checkString = Object.keys(data)
      .filter((key) => key !== 'hash')
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    // Generate secret key: HMAC-SHA256(botToken, "WebAppData")
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash: HMAC-SHA256(checkString, secretKey)
    const calculatedHash = createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    // Compare hashes (timing-safe comparison would be better but hex comparison is reasonable)
    if (calculatedHash !== receivedHash) {
      return null;
    }

    // Parse user data if present
    const result: TelegramInitData = {
      auth_date: authDate,
      hash: receivedHash,
    };

    if (data.query_id) {
      result.query_id = data.query_id;
    }

    if (data.user) {
      try {
        result.user = JSON.parse(data.user);
      } catch {
        return null; // Invalid user JSON
      }
    }

    // Copy other fields
    for (const [key, value] of Object.entries(data)) {
      if (!['hash', 'auth_date', 'query_id', 'user'].includes(key)) {
        result[key] = value;
      }
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Extract user from verified initData.
 */
export function extractUserFromInitData(initData: TelegramInitData): TelegramWebAppUser | null {
  return initData.user || null;
}
