/**
 * NPC对话页面
 */

Page({
  data: {
    npc: {
      id: '1',
      name: '李大娘',
      avatar: 'https://picsum.photos/100/100?random=60',
      role: '剪纸艺人',
      background: '李大娘是村里有名的剪纸艺人。'
    },
    messages: [
      { id: 'msg1', role: 'system', content: '你遇到了李大娘，剪纸艺人。', timestamp: Date.now(), isLoading: false },
      { id: 'msg2', role: 'npc', content: '哎呀，是新来的同志啊？我正在剪窗花呢，你有什么事吗？', timestamp: Date.now(), isLoading: false }
    ],
    inputText: '',
    selectedImage: '',
    sending: false,
    roomId: '',
    supportImage: false,
    newClues: [] as any[],
    showClueModal: false,
    scrollToView: 'msg2',
    keyboardHeight: 0
  },

  onLoad(options: any) {
    const { roomId } = options;
    if (roomId) {
      this.setData({ roomId });
    }
  },

  onInputChange(e: any) {
    this.setData({ inputText: e.detail.value });
  },

  onChooseImage() {
    wx.showToast({ title: '图片功能开发中', icon: 'none' });
  },

  onRemoveImage() {
    this.setData({ selectedImage: '' });
  },

  onPreviewImage(e: any) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.previewImage({ urls: [url], current: url });
    }
  },

  onSendMessage() {
    const { inputText, sending, messages } = this.data;
    
    if (sending) return;
    if (!inputText.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
      isLoading: false
    };
    
    const newMessages = [...messages, userMsg];
    this.setData({ 
      messages: newMessages, 
      inputText: '', 
      sending: true,
      scrollToView: userMsg.id
    });

    setTimeout(() => {
      const npcReply = {
        id: `msg_${Date.now()}`,
        role: 'npc',
        content: this.generateNPCReply(inputText),
        timestamp: Date.now(),
        isLoading: false
      };
      
      this.setData({
        messages: [...this.data.messages, npcReply],
        sending: false,
        scrollToView: npcReply.id
      });
    }, 1000);
  },

  generateNPCReply(userInput: string): string {
    if (userInput.includes('剪纸') || userInput.includes('窗花')) {
      return '这剪纸啊，可是我们祖传的手艺。你看这五角星，可不是普通的图案，在那个年代，它代表着希望和信念...';
    } else if (userInput.includes('密信') || userInput.includes('情报')) {
      return '嘘...这事儿可不能乱说。不过既然你是自己人，我可以告诉你，以前我们用剪纸传递消息，不同的图案代表不同的含义。';
    } else {
      return '年轻人，多看看这些剪纸吧，每一幅都有它的故事。有什么想问的尽管问。';
    }
  },

  onQuickQuestion(e: any) {
    const { question } = e.currentTarget.dataset;
    this.setData({ inputText: question });
    this.onSendMessage();
  },

  onCloseClueModal() {
    this.setData({ showClueModal: false, newClues: [] });
  },

  onBackToGame() {
    wx.navigateBack();
  },

  onViewClues() {
    wx.showToast({ title: '线索本功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: `我正在和${this.data.npc.name}对话`,
      path: '/pages/index/index'
    };
  }
});