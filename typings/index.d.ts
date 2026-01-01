/// <reference path="./types/index.d.ts" />

/**
 * 全局类型定义
 */

// App全局数据接口
interface IAppOption {
  globalData: {
    userInfo: WechatMiniprogram.UserInfo | null;
    isLoggedIn: boolean;
    llmConfig: {
      apiKey: string;
      baseUrl: string;
      model: string;
      multimodal: boolean;
    };
  };
  updateLLMConfig: (config: Partial<IAppOption['globalData']['llmConfig']>) => void;
}

// 扩展Page类型
declare namespace WechatMiniprogram {
  interface Page {
    getTabBar(): any;
  }
}