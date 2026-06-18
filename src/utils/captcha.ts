/**
 * 腾讯云验证码封装
 * AppID 从服务端接口动态获取，避免前端硬编码
 */

import { getCaptchaConfig } from '@/api/auth';

// 缓存 AppID，避免重复请求
let cachedAppId: string | null = null;

// 验证码结果
interface CaptchaResult {
  ticket: string;
  randstr: string;
}

// 声明全局 TencentCaptcha
declare global {
  interface Window {
    TencentCaptcha: new (
      appId: string,
      callback: (result: { ret: number; ticket: string; randstr: string }) => void
    ) => {
      show: () => void;
      destroy: () => void;
    };
  }
}

/**
 * 获取验证码 AppID（优先使用缓存）
 */
async function getAppId(): Promise<string> {
  if (cachedAppId) {
    return cachedAppId;
  }
  const res = await getCaptchaConfig();
  cachedAppId = res.data.appId;
  return cachedAppId;
}

/**
 * 触发腾讯云验证码
 * @returns Promise<{ticket, randstr}> 验证成功返回票据，失败 reject
 */
export async function triggerCaptcha(): Promise<CaptchaResult> {
  // 检查 SDK 是否加载
  if (!window.TencentCaptcha) {
    throw new Error('验证码 SDK 未加载，请刷新页面重试');
  }

  // 获取 AppID
  const appId = await getAppId();

  return new Promise((resolve, reject) => {
    const captcha = new window.TencentCaptcha(appId, (res) => {
      if (res.ret === 0) {
        // 验证成功
        resolve({
          ticket: res.ticket,
          randstr: res.randstr,
        });
      } else {
        // 用户取消或验证失败
        reject(new Error('验证码验证失败'));
      }
      // 销毁实例
      captcha.destroy();
    });

    // 显示验证码
    captcha.show();
  });
}
