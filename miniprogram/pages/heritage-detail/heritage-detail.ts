/**
 * 非遗详情页面
 */

Page({
  data: {
    heritage: {
      id: '1',
      name: '广东剪纸',
      category: '传统美术',
      cover: 'https://picsum.photos/750/400?random=50',
      images: ['https://picsum.photos/400/300?random=51', 'https://picsum.photos/400/300?random=52'],
      description: '广东剪纸是中国剪纸艺术的重要流派，以精细著称，题材广泛。在革命时期，剪纸曾被用于传递情报和宣传革命思想。',
      history: '广东剪纸历史悠久，可追溯到明清时期。佛山剪纸以其精细的刀工和丰富的色彩闻名。',
      techniques: ['阳刻', '阴刻', '混合刻', '衬色'],
      location: { province: '广东', city: '佛山', address: '佛山市禅城区剪纸艺术馆', latitude: 23.0218, longitude: 113.1219 }
    },
    tutorials: [
      { id: 't1', title: '剪纸入门：五角星', level: 'beginner', duration: 30 },
      { id: 't2', title: '剪纸进阶：窗花', level: 'intermediate', duration: 60 }
    ],
    loading: false,
    activeTab: 'intro',
    generatingTutorial: false
  },

  onLoad(options: any) {},

  onTabChange(e: any) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onTutorialTap(e: any) {
    wx.showToast({ title: '教程功能开发中', icon: 'none' });
  },

  onGenerateTutorial() {
    this.setData({ generatingTutorial: true });
    setTimeout(() => {
      this.setData({ generatingTutorial: false });
      wx.showModal({
        title: 'AI生成的教程',
        content: '剪纸入门教程：\n1. 准备红纸和剪刀\n2. 将纸对折\n3. 画出图案轮廓\n4. 沿线剪切\n5. 展开完成',
        showCancel: false
      });
    }, 2000);
  },

  onViewMap() {
    const { heritage } = this.data;
    wx.openLocation({
      latitude: heritage.location.latitude,
      longitude: heritage.location.longitude,
      name: heritage.name,
      address: heritage.location.address
    });
  },

  onPreviewImage(e: any) {
    const { url } = e.currentTarget.dataset;
    const urls = [this.data.heritage.cover, ...this.data.heritage.images];
    wx.previewImage({ urls, current: url });
  },

  onShareAppMessage() {
    return {
      title: `探索非遗：${this.data.heritage.name}`,
      path: `/pages/heritage-detail/heritage-detail?id=${this.data.heritage.id}`
    };
  }
});