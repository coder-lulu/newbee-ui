import { ref } from 'vue';
import { message, notification } from 'ant-design-vue';

interface ErrorContext {
  action: string;
  component?: string;
  data?: any;
}

interface ErrorLog {
  id: string;
  timestamp: number;
  error: Error;
  context: ErrorContext;
  userAgent: string;
  url: string;
}

/**
 * 错误处理和用户反馈组合式函数
 */
export function useErrorHandler() {
  const errors = ref<ErrorLog[]>([]);
  const isLoading = ref(false);

  // 通用错误处理函数
  const handleError = (
    error: any,
    context: ErrorContext,
    options?: {
      showMessage?: boolean;
      showNotification?: boolean;
      logError?: boolean;
      fallbackMessage?: string;
    }
  ) => {
    const {
      showMessage = true,
      showNotification = false,
      logError = true,
      fallbackMessage = '操作失败，请稍后重试'
    } = options || {};

    // 记录错误日志
    if (logError) {
      logError_(error, context);
    }

    // 解析错误消息
    const errorMessage = parseErrorMessage(error, fallbackMessage);

    // 显示用户反馈
    if (showMessage) {
      message.error(errorMessage);
    }

    if (showNotification) {
      notification.error({
        message: `${context.action}失败`,
        description: errorMessage,
        duration: 5,
      });
    }

    console.error(`Error in ${context.component || 'Unknown'} - ${context.action}:`, error);
  };

  // 记录错误日志
  const logError_ = (error: Error, context: ErrorContext) => {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    errors.value.unshift(errorLog);

    // 保持最多100条错误记录
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(0, 100);
    }
  };

  // 解析错误消息
  const parseErrorMessage = (error: any, fallback: string): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.data?.message) {
      return error.data.message;
    }

    // 根据HTTP状态码返回用户友好的消息
    if (error?.response?.status) {
      return getHttpErrorMessage(error.response.status);
    }

    return fallback;
  };

  // 获取HTTP错误消息
  const getHttpErrorMessage = (status: number): string => {
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '权限不足，无法执行此操作',
      404: '请求的资源不存在',
      409: '资源冲突，可能已被修改',
      422: '数据验证失败',
      429: '请求过于频繁，请稍后重试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '请求超时',
    };

    return statusMessages[status] || `请求失败 (${status})`;
  };

  // 异步操作包装器
  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    context: ErrorContext,
    options?: {
      loadingText?: string;
      successMessage?: string;
      errorOptions?: Parameters<typeof handleError>[2];
    }
  ): Promise<T | null> => {
    const {
      loadingText,
      successMessage,
      errorOptions
    } = options || {};

    try {
      isLoading.value = true;
      
      if (loadingText) {
        message.loading(loadingText, 0);
      }

      const result = await asyncFn();

      if (successMessage) {
        message.success(successMessage);
      }

      return result;
    } catch (error) {
      handleError(error, context, errorOptions);
      return null;
    } finally {
      isLoading.value = false;
      message.destroy(); // 清除loading消息
    }
  };

  // 表单验证错误处理
  const handleValidationError = (errors: Record<string, any>) => {
    const errorMessages = Object.values(errors)
      .flat()
      .map(error => typeof error === 'string' ? error : error.message)
      .filter(Boolean);

    if (errorMessages.length > 0) {
      notification.error({
        message: '表单验证失败',
        description: errorMessages.join('; '),
        duration: 8,
      });
    }
  };

  // 网络错误处理
  const handleNetworkError = (error: any) => {
    if (!navigator.onLine) {
      message.error('网络连接已断开，请检查网络设置');
      return;
    }

    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      message.error('网络请求失败，请检查网络连接');
      return;
    }

    if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
      message.error('请求超时，请稍后重试');
      return;
    }

    handleError(error, { action: '网络请求', component: 'Network' });
  };

  // OAuth特定错误处理
  const handleOAuthError = (error: any, operation: string) => {
    const oauthErrorMap: Record<string, string> = {
      'invalid_client': '无效的客户端配置',
      'invalid_grant': '授权已过期或无效',
      'invalid_scope': '请求的权限范围无效',
      'unauthorized_client': '客户端未被授权',
      'unsupported_grant_type': '不支持的授权类型',
      'invalid_request': '请求参数无效',
      'access_denied': '用户拒绝授权',
      'server_error': 'OAuth服务器错误',
      'temporarily_unavailable': 'OAuth服务暂时不可用',
    };

    let errorMessage = parseErrorMessage(error, '操作失败');

    // 检查是否是OAuth特定错误
    const oauthError = error?.response?.data?.error || error?.error;
    if (oauthError && oauthErrorMap[oauthError]) {
      errorMessage = oauthErrorMap[oauthError];
    }

    notification.error({
      message: `OAuth ${operation}失败`,
      description: errorMessage,
      duration: 8,
      placement: 'topRight',
    });

    logError_(error, { action: operation, component: 'OAuth' });
  };

  // 清除错误日志
  const clearErrors = () => {
    errors.value = [];
  };

  // 获取错误统计
  const getErrorStats = () => {
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recentErrors = errors.value.filter(error => error.timestamp > last24Hours);

    const stats = {
      total: errors.value.length,
      last24Hours: recentErrors.length,
      byComponent: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
    };

    errors.value.forEach(error => {
      const component = error.context.component || 'Unknown';
      const action = error.context.action;

      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1;
      stats.byAction[action] = (stats.byAction[action] || 0) + 1;
    });

    return stats;
  };

  // 导出错误日志
  const exportErrorLogs = () => {
    const data = {
      exportTime: new Date().toISOString(),
      errors: errors.value.map(error => ({
        id: error.id,
        timestamp: new Date(error.timestamp).toISOString(),
        message: error.error.message,
        stack: error.error.stack,
        context: error.context,
        url: error.url,
        userAgent: error.userAgent,
      })),
      stats: getErrorStats(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oauth-error-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    message.success('错误日志已导出');
  };

  return {
    errors,
    isLoading,
    handleError,
    handleValidationError,
    handleNetworkError,
    handleOAuthError,
    withLoading,
    clearErrors,
    getErrorStats,
    exportErrorLogs,
  };
}

/**
 * 全局错误处理器
 */
export function setupGlobalErrorHandler() {
  const { handleError, handleNetworkError } = useErrorHandler();

  // 监听全局未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    
    if (event.reason?.name === 'NetworkError') {
      handleNetworkError(event.reason);
    } else {
      handleError(event.reason, { 
        action: '未处理的Promise错误', 
        component: 'Global' 
      });
    }
  });

  // 监听全局JavaScript错误
  window.addEventListener('error', (event) => {
    handleError(event.error, { 
      action: '全局JavaScript错误', 
      component: 'Global',
      data: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    });
  });
}