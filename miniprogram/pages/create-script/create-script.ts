/**
 * 剧本创作页面 - 集成LLM服务
 */

import { llmService } from '../../services/llm/llm-service';

Page({
  data: {
    step: 1,
    title: '',
    theme: '',
    themeOptions: ['红色革命', '抗日战争', '解放战争', '建设时期'],
    selectedThemeIndex: 0,
    heritageElements: [] as string[],
    heritageOptions: ['剪纸', '刺绣', '竹编', '陶瓷', '木雕', '皮影'],
    playerCount: 4,
    difficulty: 'medium',
    duration: 120,
    generating: false,
    generatedOutline: '',
    description: '',
    roles: [] as any[],
    scenes: [] as any[],
    coverImage: ''
  },

  onLoad() {
    // 尝试恢复草稿
    const draft = wx.getStorageSync('scriptDraft');
    if (draft) {
      wx.showModal({
        title: '发现草稿',
        content: '是否恢复上次的创作？',
        success: (res) => {
          if (res.confirm) {
            this.setData(draft);
          }
        }
      });
    }
  },

  onTitleInput(e: any) {
    this.setData({ title: e.detail.value });
  },

  onThemeChange(e: any) {
    this.setData({
      selectedThemeIndex: e.detail.value,
      theme: this.data.themeOptions[e.detail.value]
    });
  },

  onHeritageSelect(e: any) {
    const element = e.currentTarget.dataset.element;
    const { heritageElements } = this.data;
    const index = heritageElements.indexOf(element);
    
    if (index > -1) {
      heritageElements.splice(index, 1);
    } else if (heritageElements.length < 3) {
      heritageElements.push(element);
    } else {
      wx.showToast({ title: '最多选择3个', icon: 'none' });
      return;
    }
    
    this.setData({ heritageElements });
  },

  onPlayerCountChange(e: any) {
    this.setData({ playerCount: parseInt(e.detail.value) });
  },

  onDifficultyChange(e: any) {
    this.setData({ difficulty: e.detail.value });
  },

  onDurationChange(e: any) {
    this.setData({ duration: parseInt(e.detail.value) });
  },

  onChooseCover() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        this.setData({ coverImage: res.tempFiles[0].tempFilePath });
      }
    });
  },

  onNextStep() {
    const { step, title, theme, heritageElements } = this.data;
    
    if (step === 1) {
      if (!title.trim()) {
        wx.showToast({ title: '请输入剧本名称', icon: 'none' });
        return;
      }
      if (!theme) {
        this.setData({ theme: this.data.themeOptions[0] });
      }
      if (heritageElements.length === 0) {
        wx.showToast({ title: '请选择非遗元素', icon: 'none' });
        return;
      }
      this.setData({ step: 2 });
      this.generateOutline();
    } else if (step === 2) {
      this.setData({ step: 3 });
      this.parseOutline();
    }
  },

  onPrevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 });
    }
  },

  async generateOutline() {
    this.setData({ generating: true });
    
    const { title, theme, heritageElements, playerCount, difficulty, duration } = this.data;
    
    try {
      const response = await llmService.generateScriptOutline({
        theme: theme || this.data.themeOptions[this.data.selectedThemeIndex],
        heritageElements,
        playerCount,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        duration
      });

      if (response.success) {
        this.setData({
          generating: false,
          generatedOutline: response.content
        });
      } else {
        // 使用本地模板作为备用
        this.setData({
          generating: false,
          generatedOutline: this.generateLocalOutline()
        });
        wx.showToast({ title: 'AI生成失败，使用模板', icon: 'none' });
      }
    } catch (error) {
      console.error('Generate outline error:', error);
      this.setData({
        generating: false,
        generatedOutline: this.generateLocalOutline()
      });
    }
  },

  generateLocalOutline(): string {
    const { title, heritageElements, playerCount } = this.data;
    return `# ${title}

## 故事背景
1940年，广东某小镇。表面平静的小镇下暗流涌动，地下党联络站隐藏在一家${heritageElements[0] || '剪纸'}工坊中。

## 角色设定
${Array.from({length: playerCount}, (_, i) => `${i + 1}. 角色${i + 1} - 待定义`).join('\n')}

## 主要线索
1. ${heritageElements[0] || '剪纸'}密信
2. 神秘账本
3. 隐藏的地图

## 非遗元素融入
- ${heritageElements.join('、')}作为情报传递的载体
- 通过非遗技艺展示革命智慧`;
  },

  parseOutline() {
    const { generatedOutline, playerCount } = this.data;
    
    // 简单解析大纲内容
    const roles = Array.from({length: playerCount}, (_, i) => ({
      id: `r${i + 1}`,
      name: `角色${i + 1}`,
      description: '待完善角色背景'
    }));

    // 尝试从大纲中提取角色信息
    const roleMatch = generatedOutline.match(/角色设定[\s\S]*?(?=##|$)/);
    if (roleMatch) {
      const roleLines = roleMatch[0].split('\n').filter(line => line.match(/^\d+\./));
      roleLines.forEach((line, index) => {
        if (index < roles.length) {
          const parts = line.replace(/^\d+\.\s*/, '').split(/[-–—]/);
          if (parts.length >= 2) {
            roles[index].name = parts[0].trim();
            roles[index].description = parts.slice(1).join('-').trim();
          }
        }
      });
    }

    this.setData({
      description: '基于AI生成的剧本大纲，请根据需要进行修改和完善。',
      roles,
      scenes: [
        { id: 's1', name: '主场景', description: '剧本主要发生地点' },
        { id: 's2', name: '秘密场所', description: '隐藏线索的地方' }
      ]
    });
  },

  onDescriptionInput(e: any) {
    this.setData({ description: e.detail.value });
  },

  onEditRole(e: any) {
    const { index } = e.currentTarget.dataset;
    const role = this.data.roles[index];
    
    wx.showModal({
      title: '编辑角色',
      editable: true,
      placeholderText: `${role.name} - ${role.description}`,
      success: (res) => {
        if (res.confirm && res.content) {
          const parts = res.content.split('-');
          const roles = [...this.data.roles];
          roles[index] = {
            ...roles[index],
            // avoid optional chaining for compatibility
            name: parts[0] ? parts[0].trim() : role.name,
            description: parts.slice(1).join('-').trim() || role.description
          };
          this.setData({ roles });
        }
      }
    });
  },

  onAddRole() {
    const { roles } = this.data;
    roles.push({
      id: `r${roles.length + 1}`,
      name: '新角色',
      description: '请输入角色描述'
    });
    this.setData({ roles });
  },

  onDeleteRole(e: any) {
    const { index } = e.currentTarget.dataset;
    const roles = [...this.data.roles];
    roles.splice(index, 1);
    this.setData({ roles });
  },

  onSubmit() {
    const { title, generatedOutline, roles, description } = this.data;
    
    if (!title.trim()) {
      wx.showToast({ title: '请输入剧本名称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    // 保存剧本数据
    const scriptData = {
      id: `script_${Date.now()}`,
      title,
      outline: generatedOutline,
      description,
      roles,
      createdAt: Date.now(),
      status: 'draft'
    };

    // 保存到本地存储
    const savedScripts = wx.getStorageSync('myScripts') || [];
    savedScripts.unshift(scriptData);
    wx.setStorageSync('myScripts', savedScripts);

    // 清除草稿
    wx.removeStorageSync('scriptDraft');

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 1000);
  },

  onSaveDraft() {
    wx.setStorageSync('scriptDraft', this.data);
    wx.showToast({ title: '草稿已保存', icon: 'success' });
  },

  onShareAppMessage() {
    return {
      title: `我正在创作剧本：${this.data.title || '红色剧本杀'}`,
      path: '/pages/index/index'
    };
  }
});