/**
 * 认证相关类型定义
 */

// 用户信息
export interface UserInfo {
  id: number;
  nickname: string;
  avatar: string;
  phone?: string;
  email?: string;
  hasPassword?: boolean;
  createdAt: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
}

// 发送验证码请求参数
export interface SendCodeParams {
  phoneOrEmail: string; // 手机号或邮箱
  ticket: string; // 图形验证码票据
  randstr: string; // 图形验证码随机串
}

// 手机登录请求参数
export interface PhoneLoginParams {
  phoneOrEmail: string;
  code: string;
}

// 密码登录请求参数
export interface PasswordLoginParams {
  phoneOrEmail: string;
  password: string;
  ticket: string;
  randstr: string;
}

// 注册请求参数
export interface RegisterParams {
  phoneOrEmail: string;
  verifyCode: string;
  nickname: string;
  password: string;
}

// 重置密码请求参数
export interface ResetPasswordParams {
  phoneOrEmail: string;
  verifyCode: string;
  newPassword: string;
}

// 修改密码请求参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// 修改昵称请求参数
export interface UpdateNicknameParams {
  nickname: string;
}

// 换绑手机请求参数
export interface UpdatePhoneParams {
  newPhone: string;
  oldPhoneCode: string;
  newPhoneCode: string;
}

// 绑定/换绑邮箱请求参数
export interface UpdateEmailParams {
  email: string;
  verifyCode: string;
}
