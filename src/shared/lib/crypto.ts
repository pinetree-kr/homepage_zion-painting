'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM의 경우 12바이트 권장, 하지만 호환성을 위해 16바이트 사용

/**
 * SECRET_KEY를 사용하여 키를 생성합니다.
 */
async function getEncryptionKey(): Promise<Buffer> {
  const { env } = await getCloudflareContext({ async: true });
  const secretKey = env.SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('SECRET_KEY가 환경변수에 설정되지 않았습니다.');
  }

  // SECRET_KEY를 사용하여 32바이트 키 생성 (SHA-256 해시)
  return crypto.createHash('sha256').update(secretKey).digest();
}

/**
 * 지도 API 키를 암호화합니다.
 */
export async function encryptMapApiKey(plainText: string): Promise<string> {
  if (!plainText || plainText.trim() === '') {
    return '';
  }

  try {
    const key = await getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // iv:authTag:encrypted 형식으로 저장
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('암호화 오류:', error);
    throw new Error('암호화 중 오류가 발생했습니다.');
  }
}

/**
 * 지도 API 키를 복호화합니다.
 */
export async function decryptMapApiKey(encryptedText: string): Promise<string> {
  if (!encryptedText || encryptedText.trim() === '') {
    return '';
  }

  try {
    const key = await getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 3) {
      throw new Error('잘못된 암호화 형식입니다.');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('복호화 오류:', error);
    // 복호화 실패 시 빈 문자열 반환 (기존 데이터가 암호화되지 않은 경우 대비)
    return '';
  }
}
