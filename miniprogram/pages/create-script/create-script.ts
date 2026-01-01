/**
 * 剧本创作页面
 */

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

  onLoad() {},

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
    wx.chooseImage({
      count: 1,
      success: (res) => {
        this.setData({ coverImage: res.tempFilePaths[0] });
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

  generateOutline() {
    this.setData({ generating: true });
    
    // 模拟AI生成
    setTimeout(() => {
      this.setData({
        generating: false,
        generatedOutline: `# ${this.data.title}

## 故事背景
1940年，广东某小镇。表面平静的小镇下暗流涌动，地下党联络站隐藏在一家剪纸工坊中。

## 角色设定
1. 李明 - 剪纸艺人/地下党联络员
2. 王芳 - 绣娘
3. 张伟 - 商人
4. 陈红 - 教师

## 主要线索
1. 剪纸密信
2. 绣花手帕
3. 神秘账本

## 非遗元素融入
- ${this.data.heritageElements.join('、')}作为情报传递的载体`
      });
    }, 2000);
  },

  parseOutline() {
    this.setData({
      description: '1940年，广东某小镇。表面平静的小镇下暗流涌动...',
      roles: [
        { id: 'r1', name: '李明', description: '剪纸艺人/地下党联络员' },
        { id: 'r2', name: '王芳', description: '绣娘' },
        { id: 'r3', name: '张伟', description: '商人' },
        { id: 'r4', name: '陈红', description: '教师' }
      ],
      scenes: [
        { id: 's1', name: '剪纸工坊', description: '充满剪纸作品的工坊' },
        { id: 's2', name: '绣房', description: '绣娘们工作的地方' }
      ]
    });
  },

  onDescriptionInput(e: any) {
    this.setData({ description: e.detail.value });
  },

  onEditRole(e: any) {
    wx.showToast({ title: '角色编辑功能开发中', icon: 'none' });
  },

  onAddRole() {
    const { roles } = this.data;
    roles.push({ id: `r${roles.length + 1}`, name: '新角色', description: '' });
    this.setData({ roles });
  },

  onSubmit() {
    wx.showLoading({ title: '保存中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    }, 1000);
  },

  onSaveDraft() {
    wx.setStorageSync('scriptDraft', this.data);
    wx.showToast({ title: '草稿已保存', icon: 'success' });
  }
});