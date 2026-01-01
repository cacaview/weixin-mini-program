/**
 * 个人中心页面
 */

Page({
  data: {
    userInfo: null as any,
    isLoggedIn: false,
    stats: {
      playedScripts: 12,
      createdScripts: 3,
      heritageProgress: 4,
      badges: 2
    },
    menuItems: [
      { icon: '📜', title: '我的剧本', desc: '创作和收藏的剧本', url: '' },
      { icon: '🎮', title: '游戏记录', desc: '历史游戏和成就', url: '' },
      { icon: '🏺', title: '非遗学习', desc: '学习进度和作品', url: '' },
      { icon: '📊', title: '学习报告', desc: '查看学习效果分析', url: '' },
      { icon: '⚙️', title: '设置', desc: 'LLM配置和偏好', url: '' },
      { icon: '❓', title: '帮助反馈', desc: '使用帮助和意见反馈', url: '/pages/feedback/feedback' }
    ],
    badges: [
      { id: '1', name: '初入江湖', icon: '🌟', unlocked: true },
      { id: '2', name: '剧本达人', icon: '🎭', unlocked: true },
      { id: '3', name: '非遗传人', icon: '🏺', unlocked: false },
      { id: '4', name: '红色先锋', icon: '🚩', unlocked: false }
    ]
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {},

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo, isLoggedIn: true });
    }
  },

  onLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo, isLoggedIn: true });
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  onMenuTap(e: any) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  onEditProfile() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' });
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          this.setData({ isLoggedIn: false, userInfo: null });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '红色剧本杀 - 传承非遗文化',
      path: '/pages/index/index'
    };
  }
});