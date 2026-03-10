/**
 * 非遗详情页面 - 集成LLM服务
 */

import { llmService } from '../../services/llm/llm-service';

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
      { id: 't1', title: '剪纸入门：五角星', level: 'beginner', duration: 30, content: '' },
      { id: 't2', title: '剪纸进阶：窗花', level: 'intermediate', duration: 60, content: '' }
    ],
    loading: false,
    activeTab: 'intro',
    generatingTutorial: false,
    selectedLevel: 'beginner',
    generatedTutorial: '',
    showTutorialModal: false
  },

  onLoad(options: any) {
    if (options.id) {
      this.loadHeritageDetail(options.id);
    }
  },

  loadHeritageDetail(id: string) {
    // 这里可以从服务器加载详情，目前使用本地数据
    console.log('Loading heritage:', id);
  },

  onTabChange(e: any) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onTutorialTap(e: any) {
    const { id, level } = e.currentTarget.dataset;
    const tutorial = this.data.tutorials.find(t => t.id === id);
    
    if (tutorial && tutorial.content) {
      this.setData({
        generatedTutorial: tutorial.content,
        showTutorialModal: true
      });
    } else {
      this.setData({ selectedLevel: level });
      this.generateTutorial(level);
    }
  },

  onLevelChange(e: any) {
    this.setData({ selectedLevel: e.detail.value });
  },

  async onGenerateTutorial() {
    await this.generateTutorial(this.data.selectedLevel);
  },

  async generateTutorial(level: string) {
    this.setData({ generatingTutorial: true });
    
    const { heritage } = this.data;
    
    try {
      const response = await llmService.generateHeritageTutorial(
        heritage.name,
        level as 'beginner' | 'intermediate' | 'advanced'
      );

      if (response.success) {
        this.setData({
          generatingTutorial: false,
          generatedTutorial: response.content,
          showTutorialModal: true
        });

        // 缓存教程内容
        const tutorials = [...this.data.tutorials];
        const tutorialIndex = tutorials.findIndex(t => t.level === level);
        if (tutorialIndex >= 0) {
          tutorials[tutorialIndex].content = response.content;
          this.setData({ tutorials });
        }
      } else {
        this.setData({
          generatingTutorial: false,
          generatedTutorial: this.getLocalTutorial(level),
          showTutorialModal: true
        });
        wx.showToast({ title: 'AI生成失败，显示模板', icon: 'none' });
      }
    } catch (error) {
      console.error('Generate tutorial error:', error);
      this.setData({
        generatingTutorial: false,
        generatedTutorial: this.getLocalTutorial(level),
        showTutorialModal: true
      });
    }
  },

  getLocalTutorial(level: string): string {
    const { heritage } = this.data;
    const levelText = level === 'beginner' ? '入门' : level === 'intermediate' ? '进阶' : '高级';
    
    return `# ${heritage.name}${levelText}教程

## 简介
${heritage.description}

## 所需材料
- 彩色纸张
- 剪刀
- 铅笔
- 橡皮

## 基础步骤
1. 准备一张正方形的红纸
2. 将纸对折成三角形
3. 再对折一次
4. 用铅笔画出想要的图案
5. 沿着线条小心剪切
6. 展开纸张，完成作品

## 注意事项
- 使用剪刀时注意安全
- 初学者建议从简单图案开始
- 保持耐心，多加练习

## 与红色文化的关联
在革命年代，剪纸艺人曾用特殊的图案传递情报，为革命事业做出了独特贡献。`;
  },

  onCloseTutorialModal() {
    this.setData({ showTutorialModal: false });
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

  onStartLearning() {
    this.setData({ activeTab: 'tutorial' });
    wx.showToast({ title: '选择一个教程开始学习', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: `探索非遗：${this.data.heritage.name}`,
      path: `/pages/heritage-detail/heritage-detail?id=${this.data.heritage.id}`
    };
  }
});