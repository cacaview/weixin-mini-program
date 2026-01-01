/**
 * 剧本详情页面
 */

Page({
  data: {
    script: {
      id: '1',
      title: '红色密信',
      cover: 'https://picsum.photos/750/400?random=40',
      description: '1940年，广东某地下党联络站，一封神秘密信引发的革命故事。玩家将扮演地下党员，通过剪纸传递情报，揭开敌人的阴谋。',
      theme: '红色革命',
      heritageElements: ['剪纸', '刺绣'],
      playerCount: { min: 4, max: 6 },
      difficulty: 'medium',
      duration: 120,
      rating: 4.8,
      playCount: 1256,
      author: { id: '1', name: '红色编剧', avatar: 'https://picsum.photos/100/100?random=41' },
      roles: [
        { id: 'r1', name: '李明', description: '地下党联络员', background: '表面是剪纸艺人', skills: ['剪纸'] },
        { id: 'r2', name: '王芳', description: '绣娘', background: '用刺绣传递暗号', skills: ['刺绣'] },
        { id: 'r3', name: '张伟', description: '商人', background: '身份神秘', skills: ['交际'] },
        { id: 'r4', name: '陈红', description: '教师', background: '进步青年', skills: ['教育'] }
      ],
      scenes: [
        { id: 's1', name: '剪纸工坊', description: '充满剪纸作品的工坊', npcs: ['李大娘'] },
        { id: 's2', name: '绣房', description: '绣娘们工作的地方', npcs: ['王婆婆'] }
      ]
    },
    loading: false,
    activeTab: 'intro',
    isCollected: false
  },

  onLoad(options: any) {
    const { id } = options;
    if (id) {
      // 可以根据id加载不同剧本
    }
  },

  onTabChange(e: any) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onCollect() {
    this.setData({ isCollected: !this.data.isCollected });
    wx.showToast({
      title: this.data.isCollected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  onCreateRoom() {
    wx.navigateTo({
      url: `/pages/game-room/game-room?scriptId=${this.data.script.id}`
    });
  },

  onJoinRoom() {
    wx.showModal({
      title: '加入房间',
      editable: true,
      placeholderText: '请输入房间号',
      success: (res) => {
        if (res.confirm && res.content) {
          wx.navigateTo({
            url: `/pages/game-room/game-room?roomId=${res.content}`
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `邀请你来玩《${this.data.script.title}》`,
      path: `/pages/script-detail/script-detail?id=${this.data.script.id}`
    };
  }
});