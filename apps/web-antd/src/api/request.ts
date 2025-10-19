/**
 * 该文件可自行根据业务逻辑进行调整
 */

import type { HttpResponse } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
  stringify,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message, Modal } from 'ant-design-vue';
import { isEmpty, isNull } from 'lodash-es';

import { useAuthStore } from '#/store';
import {
  encryptWithAesGcm,
  importAesGcmKeyFromBase64,
  decryptWithAesGcm,
  webCryptoSupported,
} from '#/utils/encryption/crypto';

const { apiURL, clientId, enableEncrypt, encryptionKey } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

/**
 * 是否已经处在登出过程中了 一个标志位
 * 主要是防止一个页面会请求多个api 都401 会导致登出执行多次
 */
let isLogoutProcessing = false;

/**
 * 定义一个401专用异常 用于可能会用到的区分场景?
 */
export class UnauthorizedException extends Error {}

function createRequestClient(baseURL: string) {
  const client = new RequestClient({
    // 后端地址
    baseURL,
    // 消息提示类型
    errorMessageMode: 'message',
    // 是否返回原生响应 比如：需要获取响应头时使用该属性
    isReturnNativeResponse: false,
    // 需要对返回数据进行处理
    isTransformResponse: true,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    // 不需要
    // 保留此方法只是为了合并方便
    return '';
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      // 添加token
      config.headers.Authorization = formatToken(accessStore.accessToken);
      /**
       * locale跟后台不一致 需要转换
       */
      const language = preferences.app.locale.replace('-', '_');
      config.headers['Accept-Language'] = language;
      config.headers['Content-Language'] = language;
      /**
       * 添加全局clientId
       * 关于header的clientId被错误绑定到实体类
       * https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IC0BDS
       */
      config.headers.ClientID = clientId;
      /**
       * 格式化get/delete参数
       * 如果包含自定义的paramsSerializer则不走此逻辑
       */
      if (
        ['DELETE', 'GET'].includes(config.method?.toUpperCase() || '') &&
        config.params &&
        !config.paramsSerializer
      ) {
        /**
         * 1. 格式化参数 微服务在传递区间时间选择(后端的params Map类型参数)需要格式化key 否则接收不到
         * 2. 数组参数需要格式化 后端才能正常接收 会变成arr=1&arr=2&arr=3的格式来接收
         */
        config.paramsSerializer = (params) =>
          stringify(params, { arrayFormat: 'repeat' });
      }

      const { encrypt } = config;
      // 全局开启请求加密功能 && 该请求开启 && 是post/put请求
      if (
        enableEncrypt &&
        encrypt &&
        ['POST', 'PUT'].includes(config.method?.toUpperCase() || '')
      ) {
        if (!encryptionKey) {
          console.error('Encryption key not configured');
          return config;
        }

        if (!webCryptoSupported) {
          console.error('WebCrypto not supported, encryption disabled');
          return config;
        }

        try {
          // Import pre-shared AES-256 key from config
          const key = await importAesGcmKeyFromBase64(encryptionKey);
          const plaintext =
            typeof config.data === 'object'
              ? JSON.stringify(config.data)
              : (config.data as string);
          const { cipherTextBase64, ivBase64 } = await encryptWithAesGcm(
            plaintext,
            key,
          );
          
          // Set headers matching backend protocol
          config.headers['X-Encrypt-Enable'] = 'true';
          config.headers['X-Encrypt-IV'] = ivBase64;
          config.data = cipherTextBase64;
        } catch (e) {
          console.error('Encryption failed:', e);
          // Keep original data if encryption fails
        }
      }
      return config;
    },
  });

  // 通用的错误处理, 如果没有进入上面的错误处理逻辑，就会进入这里
  // 主要处理http状态码不为200(如网络异常/离线)的情况 必须放在在下面的响应拦截器之前
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string) => message.error(msg)),
  );

  client.addResponseInterceptor<HttpResponse>({
    fulfilled: async (response) => {
      const encryptIv = (response.headers ?? {})['x-encrypt-iv'];
      
      // Check if response is encrypted (backend sends IV in header)
      if (encryptIv && encryptionKey && webCryptoSupported) {
        try {
          const key = await importAesGcmKeyFromBase64(encryptionKey);
          
          // Backend encrypts only the 'data' field
          const responseData = response.data;
          if (responseData && typeof responseData.data === 'string') {
            const decryptedData = await decryptWithAesGcm(
              responseData.data,
              key,
              encryptIv as string,
            );
            // Replace encrypted data field with decrypted content
            responseData.data = JSON.parse(decryptedData);
            response.data = responseData;
          }
        } catch (e) {
          console.error('Response decryption failed:', e);
          // Keep original response if decryption fails
        }
      }

      const { isReturnNativeResponse, isTransformResponse } = response.config;
      // 是否返回原生响应 比如：需要获取响应时使用该属性
      if (isReturnNativeResponse) {
        return response;
      }
      // 不进行任何处理，直接返回
      // 用于页面代码可能需要直接获取code，data，message这些信息时开启
      if (!isTransformResponse) {
        /**
         * 需要判断下载二进制的情况 正常是返回二进制 报错会返回json
         * 当type为blob且content-type为application/json时 则判断已经下载出错
         */
        if (
          response.config.responseType === 'blob' &&
          response.headers['content-type']?.includes?.('application/json')
        ) {
          // 这时候的data为blob类型
          const blob = response.data as unknown as Blob;
          // 拿到字符串转json对象
          response.data = JSON.parse(await blob.text());
          // 然后按正常逻辑执行下面的代码(判断业务状态码)
        } else {
          // 其他情况 直接返回
          return response.data;
        }
      }

      const axiosResponseData = response.data;
      if (!axiosResponseData) {
        throw new Error($t('http.apiRequestFailed'));
      }

      // 后端并没有采用严格的{code, msg, data}模式
      const { code, data, msg, ...other } = axiosResponseData;

      // 业务状态码为200则请求成功
      const hasSuccess = Reflect.has(axiosResponseData, 'code') && code === 0;
      if (hasSuccess) {
        let successMsg = msg;

        if (isNull(successMsg) || isEmpty(successMsg)) {
          successMsg = $t(`http.operationSuccess`);
        } else {
          // 处理后端返回的国际化键，如 "common.updateSuccess"
          if (typeof successMsg === 'string' && successMsg.includes('.')) {
            const translatedMsg = $t(successMsg);
            // 如果翻译成功（翻译结果不等于原键），使用翻译结果，否则使用原消息
            if (translatedMsg !== successMsg) {
              successMsg = translatedMsg;
            }
          }
        }

        if (response.config.successMessageMode === 'modal') {
          Modal.success({
            content: successMsg,
            title: $t('http.successTip'),
          });
        } else if (response.config.successMessageMode === 'message') {
          message.success(successMsg);
        }
        // 分页情况下为code msg rows total 并没有data字段
        // 如果有data 直接返回data 没有data将剩余参数(...other)封装为data返回
        // 需要考虑data为null的情况(比如查询为空) 所以这里直接判断undefined
        if (data !== undefined) {
          return data;
        }
        // 没有data 将其他参数包装为data
        return other;
      }
      // 在此处根据自己项目的实际情况对不同的code执行不同的操作
      // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
      let timeoutMsg = '';
      switch (code) {
        case 401: {
          // 已经在登出过程中 不再执行
          if (isLogoutProcessing) {
            throw new UnauthorizedException(timeoutMsg);
          }
          isLogoutProcessing = true;
          const _msg = $t('http.loginTimeout');
          const userStore = useAuthStore();
          userStore.logout().finally(() => {
            message.error(_msg);
            isLogoutProcessing = false;
          });
          // 不再执行下面逻辑
          throw new UnauthorizedException(_msg);
        }
        default: {
          if (msg) {
            timeoutMsg = msg;
          }
        }
      }

      // errorMessageMode='modal'的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
      // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
      if (response.config.errorMessageMode === 'modal') {
        Modal.error({
          content: timeoutMsg,
          title: $t('http.errorTip'),
        });
      } else if (response.config.errorMessageMode === 'message') {
        message.error(timeoutMsg);
      }

      throw new Error(timeoutMsg || $t('http.apiRequestFailed'));
    },
  });

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL);

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
