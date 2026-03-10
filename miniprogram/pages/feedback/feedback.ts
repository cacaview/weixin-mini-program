/**
 * 反馈页面 - 集成LLM服务
 */

import { llmService } from '../../services/llm/llm-service';

Page({
  data: {
    feedbackType: 'general',
    questions: [
      { id: 'q1', question: '您对小程序的整体体验如何？', type: 'rating', value: 0 },
      { id: 'q2', question: '您最喜欢哪个功能？', type: 'choice', options: ['剧本杀游戏', '非遗学习', '社区交流', 'AI对话'], value: '' },
      { id: 'q3', question: '您有什么建议或意见？', type: 'text', value: '' }
    ],
    answers: {} as Record<string, any>,
    images: [] as string[],
    submitting: false,
    showReport: false,
    report: '',
    generatingReport: false,
    learningData: {
      playedScripts: 5,
      totalPlayTime: 120,
      completedScripts: 3,
      heritageProgress: [
        { name: '剪纸', progress: 60 },
        { name: '刺绣', progress: 30 },
        { name: '竹编', progress: 10 }
      ],
      achievements: ['初入江湖', '剧本达人'],
      recentActivities: [
        { type: 'game', name: '红色密信', date: '2026-01-01' },
        { type: 'learn', name: '剪纸入门', date: '2025-12-30' }
      ]
    }
  },

  onLoad(options: any) {
    const { type } = options;
    if (type) {
      this.setData({ feedbackType: type });
    }
    
    // 加载用户学习数据
    this.loadLearningData();
  },

  loadLearningData() {
    // 从本地存储加载学习数据
    const savedData = wx.getStorageSync('learningData');
    if (savedData) {
      this.setData({ learningData: { ...this.data.learningData, ...savedData } });
    }
  },

  onRatingChange(e: any) {
    const { questionId } = e.currentTarget.dataset;
    const questions = [...this.data.questions];
    const index = questions.findIndex(q => q.id === questionId);
    if (index >= 0) {
      questions[index].value = e.detail.value;
      this.setData({ questions, [`answers.${questionId}`]: e.detail.value });
    }
  },

  onChoiceChange(e: any) {
    const { questionId } = e.currentTarget.dataset;
    const questions = [...this.data.questions];
    const index = questions.findIndex(q => q.id === questionId);
    if (index >= 0) {
      questions[index].value = e.detail.value;
      this.setData({ questions, [`answers.${questionId}`]: e.detail.value });
    }
  },

  onTextInput(e: any) {
    const { questionId } = e.currentTarget.dataset;
    const questions = [...this.data.questions];
    const index = questions.findIndex(q => q.id === questionId);
    if (index >= 0) {
      questions[index].value = e.detail.value;
      this.setData({ questions, [`answers.${questionId}`]: e.detail.value });
    }
  },

  onChooseImage() {
    if (this.data.images.length >= 3) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 3 - this.data.images.length,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...newImages] });
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
    const { questions, images } = this.data;
    
    // 验证必填项
    const ratingQuestion = questions.find(q => q.type === 'rating');
    if (ratingQuestion && !ratingQuestion.value) {
      wx.showToast({ title: '请完成评分', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    
    // 保存反馈数据
    const feedbackData = {
      id: `feedback_${Date.now()}`,
      questions: questions.map(q => ({ id: q.id, question: q.question, answer: q.value })),
      images,
      createdAt: Date.now()
    };

    const savedFeedbacks = wx.getStorageSync('feedbacks') || [];
    savedFeedbacks.unshift(feedbackData);
    wx.setStorageSync('feedbacks', savedFeedbacks);

    setTimeout(() => {
      this.setData({ submitting: false });
      wx.showToast({ title: '提交成功，感谢反馈！', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 1000);
  },

  async onViewLearningReport() {
    this.setData({ generatingReport: true, showReport: true });
    
    const { learningData } = this.data;
    
    try {
      const response = await llmService.generateLearningReport(learningData);

      if (response.success) {
        this.setData({
          generatingReport: false,
          report: response.content
        });
      } else {
        this.setData({
          generatingReport: false,
          report: this.getLocalReport()
        });
      }
    } catch (error) {
      console.error('Generate report error:', error);
      this.setData({
        generatingReport: false,
        report: this.getLocalReport()
      });
    }
  },

  getLocalReport(): string {
    const { learningData } = this.data;
    
    return `📊 学习报告

🎮 游戏数据
- 总游戏时长：${learningData.totalPlayTime}分钟
- 完成剧本数：${learningData.completedScripts}/${learningData.playedScripts}个

🏺 非遗学习
${learningData.heritageProgress.map(h => `- ${h.name}：${h.progress}%`).join('\n')}

🏆 获得成就
${learningData.achievements.map(a => `- ${a}`).join('\n')}

📅 最近活动
${learningData.recentActivities.map(a => `- ${a.date}: ${a.name}`).join('\n')}

💡 学习建议
- 继续探索更多非遗项目
- 尝试创作自己的剧本
- 多与其他玩家交流心得
- 挑战更高难度的剧本`;
  },

  onCloseReport() {
    this.setData({ showReport: false });
  },

  onShareReport() {
    // 可以实现分享报告功能
    wx.showToast({ title: '分享功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '红色剧本杀 - 我的学习报告',
      path: '/pages/index/index'
    };
  }
});