/**
 * 反馈页面
 */

Page({
  data: {
    feedbackType: 'general',
    questions: [
      { id: 'q1', question: '您对小程序的整体体验如何？', type: 'rating' },
      { id: 'q2', question: '您最喜欢哪个功能？', type: 'choice', options: ['剧本杀游戏', '非遗学习', '社区交流', 'AI对话'] },
      { id: 'q3', question: '您有什么建议或意见？', type: 'text' }
    ],
    answers: {} as Record<string, any>,
    images: [] as string[],
    submitting: false,
    showReport: false,
    report: ''
  },

  onLoad(options: any) {
    const { type } = options;
    if (type) {
      this.setData({ feedbackType: type });
    }
  },

  onRatingChange(e: any) {
    const { questionId } = e.currentTarget.dataset;
    this.setData({ [`answers.${questionId}`]: e.detail.value });
  },

  onChoiceChange(e: any) {
    const { questionId } = e.currentTarget.dataset;
    this.setData({ [`answers.${questionId}`]: e.detail.value });
  },

  onTextInput(e: any) {
    const { questionId } = e.currentTarget.dataset;
    this.setData({ [`answers.${questionId}`]: e.detail.value });
  },

  onChooseImage() {
    if (this.data.images.length >= 3) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: 3 - this.data.images.length,
      success: (res) => {
        this.setData({ images: [...this.data.images, ...res.tempFilePaths] });
      }
    });
  },

  onRemoveImage(e: any) {
    const { index } = e.currentTarget.dataset;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  onSubmit() {
    this.setData({ submitting: true });
    setTimeout(() => {
      this.setData({ submitting: false });
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 1000);
  },

  onViewLearningReport() {
    this.setData({
      showReport: true,
      report: `📊 学习报告

🎮 游戏数据
- 总游戏时长：120分钟
- 完成剧本数：5个

🏺 非遗学习
- 学习项目数：3个
- 平均进度：60%

🏆 获得成就
- 初入江湖
- 剧本达人

💡 学习建议
- 继续探索更多非遗项目
- 尝试创作自己的剧本`
    });
  },

  onCloseReport() {
    this.setData({ showReport: false });
  }
});