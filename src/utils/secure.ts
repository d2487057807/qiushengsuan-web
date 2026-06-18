/**
 * 安全传输工具
 * 用于前后端敏感数据的加密/解密传输（RSA + AES 混合加密）
 */

import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

// RSA 公钥缓存
let cachedPublicKey: string | null = null;

// 当前请求使用的 AES 密钥和 IV（用于响应解密）
let currentAesKey: string | null = null;
let currentIv: string | null = null;

/**
 * 获取 RSA 公钥（从服务端获取并缓存）
 */
export async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  // 调用接口获取公钥
  const response = await fetch('/qiushengsuan/api/auth/public-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await response.json();

  if (result.code === 200 && result.data?.publicKey) {
    cachedPublicKey = result.data.publicKey as string;
    return cachedPublicKey;
  }

  throw new Error('获取公钥失败');
}

/**
 * 生成随机 AES 密钥（16位）
 */
export function generateAesKey(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

/**
 * 生成随机 IV（16位）
 */
export function generateIv(): string {
  const iv = CryptoJS.lib.WordArray.random(16);
  return CryptoJS.enc.Base64.stringify(iv);
}

/**
 * RSA 加密 AES 密钥
 */
export function encryptAesKey(aesKey: string, publicKey: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encrypted = encryptor.encrypt(aesKey);
  if (!encrypted) {
    throw new Error('RSA 加密失败');
  }
  return encrypted;
}

/**
 * AES-CBC 加密数据
 */
export function encryptData(data: object, aesKey: string, iv: string): string {
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const ivWordArray = CryptoJS.enc.Base64.parse(iv);
  const jsonString = JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

/**
 * AES-CBC 解密数据
 */
export function decryptData(encryptedData: string, aesKey: string, iv: string): object {
  const key = CryptoJS.enc.Utf8.parse(aesKey);
  const ivWordArray = CryptoJS.enc.Base64.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonString);
}

/**
 * 加密请求数据
 * @param data 原始请求数据
 * @param fields 需要加密的敏感字段名
 * @returns 加密后的请求体（包含加密字段和未加密字段）
 */
export async function encryptRequest(
  data: Record<string, any>,
  fields: string[]
): Promise<{ encryptedData: string; encryptedKey: string; iv: string; plainData: Record<string, any> }> {
  // 1. 获取公钥
  const publicKey = await getPublicKey();

  // 2. 生成 AES 密钥和 IV
  const aesKey = generateAesKey();
  const iv = generateIv();

  // 3. 分离敏感字段和普通字段
  const sensitiveData: Record<string, any> = {};
  const plainData: Record<string, any> = {};
  const fieldsSet = new Set(fields);

  for (const key of Object.keys(data)) {
    if (fieldsSet.has(key)) {
      sensitiveData[key] = data[key];
    } else {
      plainData[key] = data[key];
    }
  }

  // 4. AES 加密敏感数据
  const encryptedData = encryptData(sensitiveData, aesKey, iv);

  // 5. RSA 加密 AES 密钥
  const encryptedKey = encryptAesKey(aesKey, publicKey);

  // 6. 保存当前密钥信息（用于响应解密）
  currentAesKey = aesKey;
  currentIv = iv;

  return { encryptedData, encryptedKey, iv, plainData };
}

/**
 * 解密响应数据
 * @param encryptedData 加密的数据
 * @param iv 初始化向量（后端返回）
 */
export function decryptResponse(encryptedData: string, iv?: string): object | null {
  if (!currentAesKey) {
    console.warn('无法解密响应：缺少密钥信息');
    return null;
  }

  // 优先使用后端返回的 iv，否则使用前端生成的 iv
  const useIv = iv || currentIv;
  if (!useIv) {
    console.warn('无法解密响应：缺少 IV');
    return null;
  }

  try {
    return decryptData(encryptedData, currentAesKey, useIv);
  } catch (e) {
    console.error('响应解密失败:', e);
    return null;
  }
}

/**
 * 需要加密的接口配置
 * key: 接口路径
 * value: 需要加密的字段列表
 */
export const ENCRYPTED_APIS: Record<string, string[]> = {
  '/auth/send-code': ['phoneOrEmail'],
  '/auth/phone-login': ['phoneOrEmail'],
  '/auth/password-login': ['phoneOrEmail', 'password'],
  '/auth/register': ['phoneOrEmail', 'password'],
  '/auth/reset-password': ['phoneOrEmail', 'newPassword'],
  '/auth/change-password': ['oldPassword', 'newPassword'],
  '/auth/update-phone': ['newPhone'],
  '/auth/update-email': ['email'],
};

/**
 * 检查接口是否需要加密
 */
export function shouldEncryptRequest(url: string): { needEncrypt: boolean; fields?: string[] } {
  for (const [path, fields] of Object.entries(ENCRYPTED_APIS)) {
    if (url.includes(path)) {
      return { needEncrypt: true, fields };
    }
  }
  return { needEncrypt: false };
}

/**
 * 需要加密响应的接口
 */
export const ENCRYPTED_RESPONSE_APIS = ['/auth/captcha/config', '/auth/user-info'];

/**
 * 检查响应是否需要解密
 */
export function shouldDecryptResponse(url: string): boolean {
  return ENCRYPTED_RESPONSE_APIS.some(path => url.includes(path));
}

/**
 * 为需要加密响应的接口准备请求头
 * 返回包含加密密钥的请求头
 */
export async function getEncryptedResponseHeaders(): Promise<Record<string, string>> {
  const publicKey = await getPublicKey();
  const aesKey = generateAesKey();
  const iv = generateIv();

  // RSA 加密 AES 密钥
  const encryptedKey = encryptAesKey(aesKey, publicKey);

  // 保存密钥信息用于响应解密
  currentAesKey = aesKey;
  currentIv = iv;

  return {
    'X-Encrypted-Key': encryptedKey,
    'X-IV': iv,
  };
}
