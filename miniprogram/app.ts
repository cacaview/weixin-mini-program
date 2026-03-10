/**
 * 红色剧本杀小程序
 * 融合非遗文化与红色主题的剧本杀游戏平台
 */

import { llmService } from './services/llm/llm-service';

App({
  globalData: {
    userInfo: null as WechatMiniprogram.UserInfo | null,
    isLoggedIn: false,
    llmConfig: {
      apiKey: '',
      baseUrl: 'http://172.20.1.114:8080',
      model: 'default',
      multimodal: false
    }
  },

  onLaunch() {
    this.initApp();
  },

  initApp() {
    this.initLLMConfig();
    this.checkUpdate();
  },

  initLLMConfig() {
    const savedConfig = wx.getStorageSync('llmConfig');
    if (savedConfig) {
      this.globalData.llmConfig = { ...this.globalData.llmConfig, ...savedConfig };
    }
    
    // 初始化LLM服务
    llmService.init({
      apiKey: this.globalData.llmConfig.apiKey,
      baseUrl: this.globalData.llmConfig.baseUrl,
      model: this.globalData.llmConfig.model
    }, this.globalData.llmConfig.multimodal);
  },

  updateLLMConfig(config: any) {
    this.globalData.llmConfig = { ...this.globalData.llmConfig, ...config };
    wx.setStorageSync('llmConfig', this.globalData.llmConfig);
    
    // 更新LLM服务配置
    llmService.updateConfig(config);
  },

  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.log('新版本下载失败');
      });
    }
  },

  onError(error: string) {
    console.error('App Error:', error);
  },

  onPageNotFound(res: any) {
    console.warn('Page not found:', res.path);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});