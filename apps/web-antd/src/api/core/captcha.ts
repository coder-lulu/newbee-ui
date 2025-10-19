import { requestClient } from '#/api/request';

/**
 * 发送短信验证码
 * @param phonenumber 手机号
 * @returns void
 */
export function sendSmsCode(phonenumber: string) {
  return requestClient.get<void>('/resource/sms/code', {
    params: { phonenumber },
  });
}

/**
 * 发送邮件验证码
 * @param email 邮箱
 * @returns void
 */
export function sendEmailCode(email: string) {
  return requestClient.get<void>('/resource/email/code', {
    params: { email },
  });
}

/**
 * @param captchaId 验证码ID
 * @param imgPath 图片验证码
 */
export interface CaptchaResponse {
  captchaId: string;
  imgPath: string;
}

/**
 * 图片验证码
 * @returns resp
 */
export function captchaImage() {
  return requestClient.get<CaptchaResponse>('/sys-api/captcha');
}
