/**
 * 社区页面
 */

Page({
  data: {
    posts: [
      {
        id: '1',
        type: 'script',
        title: '【原创剧本】红色密信·第二章',
        content: '续写红色密信的故事，加入了更多潮绣元素，欢迎大家提意见！',
        images: ['https://picsum.photos/400/300?random=30'],
        author: { id: '1', name: '红色编剧', avatar: 'https://picsum.photos/100/100?random=31' },
        likes: 128,
        comments: 32,
        isLiked: false,
        tags: ['原创剧本', '红色主题'],
        createdAt: '2024-01-15 14:30'
      },
      {
        id: '2',
        type: 'discussion',
        title: '如何在剧本中自然融入非遗元素？',
        content: '最近在创作一个以竹编为主题的剧本，求大神指点！',
        images: [],
        author: { id: '2', name: '新手编剧', avatar: 'https://picsum.photos/100/100?random=32' },
        likes: 56,
        comments: 18,
        isLiked: true,
        tags: ['创作技巧'],
        createdAt: '2024-01-15 10:20'
      }
    ],
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'script', label: '剧本创作' },
      { key: 'discussion', label: '讨论交流' }
    ],
    currentTab: 'all',
    loading: false,
    hasMore: true
  },

  onLoad() {},

  onShow() {},

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onTabChange(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  onPostTap(e: any) {
    wx.showToast({ title: '帖子详情开发中', icon: 'none' });
  },

  onLikeTap(e: any) {
    const { index } = e.currentTarget.dataset;
    const posts = this.data.posts;
    posts[index].isLiked = !posts[index].isLiked;
    posts[index].likes += posts[index].isLiked ? 1 : -1;
    this.setData({ posts });
  },

  onCreatePost() {
    wx.showToast({ title: '发帖功能开发中', icon: 'none' });
  },

  onPreviewImage(e: any) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({ urls, current });
  },

  onShareAppMessage() {
    return {
      title: '剧本创作社区 - 红色剧本杀',
      path: '/pages/community/community'
    };
  }
});