/**
 * 剧本库页面
 */

Page({
  data: {
    scripts: [
      {
        id: '1',
        title: '红色密信',
        cover: 'https://picsum.photos/400/500?random=10',
        description: '1940年，广东某地下党联络站，一封神秘密信引发的革命故事。',
        theme: '红色革命',
        heritageElements: ['剪纸', '刺绣'],
        playerCount: { min: 4, max: 6 },
        difficulty: 'medium',
        duration: 120,
        rating: 4.8,
        playCount: 1256
      },
      {
        id: '2',
        title: '竹编谜案',
        cover: 'https://picsum.photos/400/500?random=11',
        description: '古老的竹编技艺中隐藏着革命先辈的智慧。',
        theme: '抗日战争',
        heritageElements: ['竹编'],
        playerCount: { min: 3, max: 5 },
        difficulty: 'easy',
        duration: 90,
        rating: 4.6,
        playCount: 892
      },
      {
        id: '3',
        title: '绣娘的秘密',
        cover: 'https://picsum.photos/400/500?random=12',
        description: '潮州绣娘用针线绣出的不仅是艺术，更是革命的火种。',
        theme: '解放战争',
        heritageElements: ['刺绣'],
        playerCount: { min: 5, max: 7 },
        difficulty: 'hard',
        duration: 150,
        rating: 4.9,
        playCount: 2341
      }
    ],
    filters: {
      theme: '',
      difficulty: '',
      heritageElement: '',
      keyword: ''
    },
    themeOptions: ['全部', '红色革命', '抗日战争', '解放战争'],
    difficultyOptions: ['全部', '简单', '中等', '困难'],
    heritageOptions: ['全部', '剪纸', '刺绣', '竹编', '陶瓷'],
    selectedThemeIndex: 0,
    selectedDifficultyIndex: 0,
    selectedHeritageIndex: 0,
    showFilterPanel: false,
    sortBy: 'latest',
    loading: false,
    hasMore: true
  },

  onLoad() {},

  onShow() {},

  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  onReachBottom() {},

  onSearchInput(e: any) {
    this.setData({ 'filters.keyword': e.detail.value });
  },

  onSearchConfirm() {},

  onClearSearch() {
    this.setData({ 'filters.keyword': '' });
  },

  toggleFilterPanel() {
    this.setData({ showFilterPanel: !this.data.showFilterPanel });
  },

  onThemeChange(e: any) {
    this.setData({ selectedThemeIndex: e.detail.value });
  },

  onDifficultyChange(e: any) {
    this.setData({ selectedDifficultyIndex: e.detail.value });
  },

  onHeritageChange(e: any) {
    this.setData({ selectedHeritageIndex: e.detail.value });
  },

  onPlayerCountChange(e: any) {},

  applyFilters() {
    this.setData({ showFilterPanel: false });
  },

  resetFilters() {
    this.setData({
      selectedThemeIndex: 0,
      selectedDifficultyIndex: 0,
      selectedHeritageIndex: 0
    });
  },

  onSortChange(e: any) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ sortBy });
  },

  onScriptTap(e: any) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/script-detail/script-detail?id=${id}`
    });
  },

  onShareAppMessage() {
    return {
      title: '发现精彩剧本 - 红色剧本杀',
      path: '/pages/script-library/script-library'
    };
  }
});