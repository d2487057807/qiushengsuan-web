/**
 * 认证相关 API
 */

import request from './request';
import type { ApiResponse } from '@/types/api';
import type {
  UserInfo,
  LoginResponse,
  SendCodeParams,
  PhoneLoginParams,
  PasswordLoginParams,
  RegisterParams,
  ResetPasswordParams,
  ChangePasswordParams,
  UpdateNicknameParams,
  UpdatePhoneParams,
  UpdateEmailParams,
} from '@/types/auth';

/**
 * 获取验证码配置（appId）
 */
export function getCaptchaConfig(): Promise<ApiResponse<{ appId: string }>> {
  return request.post('/auth/captcha/config');
}

/**
 * 发送验证码
 */
export function sendCode(params: SendCodeParams): Promise<ApiResponse> {
  return request.post('/auth/send-code', params);
}

/**
 * 手机验证码登录
 */
export function phoneLogin(params: PhoneLoginParams): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/phone-login', params);
}

/**
 * 密码登录
 */
export function passwordLogin(params: PasswordLoginParams): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/password-login', params);
}

/**
 * 注册
 */
export function register(params: RegisterParams): Promise<ApiResponse> {
  return request.post('/auth/register', params);
}

/**
 * 重置密码
 */
export function resetPassword(params: ResetPasswordParams): Promise<ApiResponse> {
  return request.post('/auth/reset-password', params);
}

/**
 * 修改密码（已登录）
 */
export function changePassword(params: ChangePasswordParams): Promise<ApiResponse> {
  return request.post('/auth/change-password', params);
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request.post('/auth/user-info');
}

/**
 * 退出登录
 */
export function logout(): Promise<ApiResponse> {
  return request.post('/auth/logout');
}

/**
 * 上传头像
 */
export function uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 修改昵称
 */
export function updateNickname(params: UpdateNicknameParams): Promise<ApiResponse> {
  return request.post('/auth/update-nickname', params);
}

/**
 * 换绑手机
 */
export function updatePhone(params: UpdatePhoneParams): Promise<ApiResponse> {
  return request.post('/auth/update-phone', params);
}

/**
 * 绑定/换绑邮箱
 */
export function updateEmail(params: UpdateEmailParams): Promise<ApiResponse> {
  return request.post('/auth/update-email', params);
}

/**
 * 微信小程序登录
 */
export function wxLogin(code: string): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/wx-login', { code });
}

/**
 * 微信小程序手机登录
 */
export function wxPhoneLogin(code: string, phoneCode: string): Promise<ApiResponse<LoginResponse>> {
  return request.post('/auth/wx-phone-login', { code, phoneCode });
}

/**
 * 绑定手机（微信用户）
 */
export function bindPhone(phone: string, code: string): Promise<ApiResponse> {
  return request.post('/auth/bind-phone', { phone, code });
}
