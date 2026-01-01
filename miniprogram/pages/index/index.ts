/**
 * 首页
 */

Page({
  data: {
    banners: [
      { id: '1', imageUrl: 'https://picsum.photos/750/360?random=1', title: '红色记忆·非遗传承', link: '' },
      { id: '2', imageUrl: 'https://picsum.photos/750/360?random=2', title: '剪纸密信·革命往事', link: '' }
    ],
    recommendedScripts: [
      {
        id: '1',
        title: '红色密信',
        cover: 'https://picsum.photos/400/300?random=3',
        description: '1940年，广东某地下党联络站...',
        theme: '红色革命',
        heritageElements: ['剪纸', '刺绣'],
        playerCount: { min: 4, max: 6 },
        duration: 120,
        rating: 4.8
      },
      {
        id: '2',
        title: '竹编谜案',
        cover: 'https://picsum.photos/400/300?random=4',
        description: '古老的竹编技艺中隐藏着革命先辈的智慧...',
        theme: '红色革命',
        heritageElements: ['竹编'],
        playerCount: { min: 3, max: 5 },
        duration: 90,
        rating: 4.6
      }
    ],
    featuredHeritage: [
      { id: '1', name: '广东剪纸', category: '传统美术', cover: 'https://picsum.photos/400/400?random=5', location: { province: '广东', city: '佛山' } },
      { id: '2', name: '潮州刺绣', category: '传统美术', cover: 'https://picsum.photos/400/400?random=6', location: { province: '广东', city: '潮州' } }
    ],
    loading: false
  },

  onLoad() {
    // 页面加载
  },

  onShow() {
    // 页面显示
  },

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onBannerTap(e: any) {
    const { link } = e.currentTarget.dataset;
    if (link) {
      wx.navigateTo({ url: link });
    }
  },

  onScriptTap(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/script-detail/script-detail?id=${id}`
    });
  },

  onHeritageTap(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/heritage-detail/heritage-detail?id=${id}`
    });
  },

  onMoreScripts() {
    wx.switchTab({
      url: '/pages/script-library/script-library'
    });
  },

  onMoreHeritage() {
    wx.switchTab({
      url: '/pages/heritage/heritage'
    });
  },

  onQuickStart() {
    wx.switchTab({
      url: '/pages/script-library/script-library'
    });
  },

  onCreateScript() {
    wx.navigateTo({
      url: '/pages/create-script/create-script'
    });
  },

  onSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '红色剧本杀 - 传承非遗文化，重温革命记忆',
      path: '/pages/index/index'
    };
  }
});