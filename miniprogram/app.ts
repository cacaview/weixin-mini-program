/**
 * 红色剧本杀小程序
 * 融合非遗文化与红色主题的剧本杀游戏平台
 */

App({
  globalData: {
    userInfo: null as WechatMiniprogram.UserInfo | null,
    isLoggedIn: false,
    llmConfig: {
      apiKey: '',
      baseUrl: '',
      model: 'gpt-3.5-turbo',
      multimodal: false
    }
  },

  onLaunch() {
    // 初始化
    this.initApp();
  },

  initApp() {
    // 初始化LLM配置
    this.initLLMConfig();
    
    // 检查更新
    this.checkUpdate();
  },

  /**
   * 初始化LLM配置
   */
  initLLMConfig() {
    // 从本地存储读取LLM配置
    const savedConfig = wx.getStorageSync('llmConfig');
    if (savedConfig) {
      this.globalData.llmConfig = { ...this.globalData.llmConfig, ...savedConfig };
    }
  },

  /**
   * 更新LLM配置
   */
  updateLLMConfig(config: any) {
    this.globalData.llmConfig = { ...this.globalData.llmConfig, ...config };
    wx.setStorageSync('llmConfig', this.globalData.llmConfig);
  },

  /**
   * 检查小程序更新
   */
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

  /**
   * 全局错误处理
   */
  onError(error: string) {
    console.error('App Error:', error);
  },

  /**
   * 页面不存在处理
   */
  onPageNotFound(res: any) {
    console.warn('Page not found:', res.path);
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});