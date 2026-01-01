/**
 * 非遗文化展示页面
 */

Page({
  data: {
    heritageList: [
      { id: '1', name: '广东剪纸', category: '传统美术', cover: 'https://picsum.photos/400/400?random=20', description: '广东剪纸是中国剪纸艺术的重要流派', location: { province: '广东', city: '佛山' } },
      { id: '2', name: '潮州刺绣', category: '传统美术', cover: 'https://picsum.photos/400/400?random=21', description: '潮绣是中国四大名绣之一', location: { province: '广东', city: '潮州' } },
      { id: '3', name: '佛山木版年画', category: '传统美术', cover: 'https://picsum.photos/400/400?random=22', description: '佛山木版年画历史悠久', location: { province: '广东', city: '佛山' } },
      { id: '4', name: '石湾陶塑', category: '传统技艺', cover: 'https://picsum.photos/400/400?random=23', description: '石湾陶塑技艺精湛', location: { province: '广东', city: '佛山' } }
    ],
    categories: ['全部', '传统美术', '传统技艺', '传统音乐', '民俗'],
    selectedCategory: '全部',
    keyword: '',
    loading: false,
    hasMore: true
  },

  onLoad() {},

  onShow() {},

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onCategoryTap(e: any) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
  },

  onSearchInput(e: any) {
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {},

  onHeritageTap(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/heritage-detail/heritage-detail?id=${id}` });
  },

  onNearbyTap() {
    wx.showToast({ title: '附近非遗功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '探索非遗文化 - 红色剧本杀',
      path: '/pages/heritage/heritage'
    };
  }
});