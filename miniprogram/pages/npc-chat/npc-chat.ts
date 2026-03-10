/**
 * NPC对话页面 - 集成LLM服务
 */

import { llmService } from '../../services/llm/llm-service';

Page({
  data: {
    npc: {
      id: '1',
      name: '李大娘',
      avatar: 'https://picsum.photos/100/100?random=60',
      role: '剪纸艺人',
      background: '李大娘是村里有名的剪纸艺人，年轻时曾参与地下党的情报传递工作。'
    },
    scriptContext: '1940年，广东某小镇。地下党联络站隐藏在剪纸工坊中。',
    messages: [] as any[],
    inputText: '',
    sending: false,
    scrollToView: '',
    quickQuestions: ['您能教我剪纸吗？', '这些剪纸有什么含义？', '听说有人用剪纸传递消息？'],
    chatHistory: [] as any[]
  },

  onLoad(options: any) {
    const welcomeMessages = [
      { id: 'msg_sys', role: 'system', content: `你遇到了${this.data.npc.name}，${this.data.npc.role}。`, timestamp: Date.now(), isLoading: false },
      { id: 'msg_welcome', role: 'npc', content: '哎呀，是新来的同志啊？我正在剪窗花呢，有什么事想问我吗？', timestamp: Date.now(), isLoading: false }
    ];
    this.setData({ messages: welcomeMessages, scrollToView: 'msg_welcome' });
  },

  onInputChange(e: any) {
    this.setData({ inputText: e.detail.value });
  },

  async onSendMessage() {
    const { inputText, sending, messages, npc, scriptContext, chatHistory } = this.data;
    if (sending || !inputText.trim()) return;

    const userMsg = { id: `msg_${Date.now()}`, role: 'user', content: inputText, timestamp: Date.now(), isLoading: false };
    const loadingMsg = { id: `msg_loading_${Date.now()}`, role: 'npc', content: '正在思考...', timestamp: Date.now(), isLoading: true };
    
    this.setData({
      messages: [...messages, userMsg, loadingMsg],
      inputText: '',
      sending: true,
      scrollToView: loadingMsg.id
    });

    // 更新对话历史
    const newHistory = [...chatHistory, { role: 'user', content: inputText }];

    try {
      const response = await llmService.npcChat({
        npcName: npc.name,
        npcRole: npc.role,
        npcBackground: npc.background,
        scriptContext: scriptContext,
        userMessage: inputText,
        chatHistory: newHistory.slice(-10) // 保留最近10条
      });

      const currentMessages = this.data.messages.filter((m: any) => !m.isLoading);
      
      if (response.success) {
        const npcReply = { id: `msg_${Date.now()}`, role: 'npc', content: response.content, timestamp: Date.now(), isLoading: false };
        this.setData({
          messages: [...currentMessages, npcReply],
          chatHistory: [...newHistory, { role: 'assistant', content: response.content }],
          sending: false,
          scrollToView: npcReply.id
        });
      } else {
        // 使用本地回复作为备用
        const fallbackReply = this.generateLocalReply(inputText);
        const npcReply = { id: `msg_${Date.now()}`, role: 'npc', content: fallbackReply, timestamp: Date.now(), isLoading: false };
        this.setData({
          messages: [...currentMessages, npcReply],
          sending: false,
          scrollToView: npcReply.id
        });
        console.error('LLM Error:', response.error);
      }
    } catch (error) {
      const currentMessages = this.data.messages.filter((m: any) => !m.isLoading);
      const fallbackReply = this.generateLocalReply(inputText);
      const npcReply = { id: `msg_${Date.now()}`, role: 'npc', content: fallbackReply, timestamp: Date.now(), isLoading: false };
      this.setData({
        messages: [...currentMessages, npcReply],
        sending: false,
        scrollToView: npcReply.id
      });
      console.error('Chat Error:', error);
    }
  },

  generateLocalReply(userInput: string): string {
    if (userInput.includes('剪纸') || userInput.includes('窗花')) {
      return '这剪纸啊，可是我们祖传的手艺。你看这五角星，在那个年代，它代表着希望和信念...';
    } else if (userInput.includes('密信') || userInput.includes('情报') || userInput.includes('消息')) {
      return '嘘...这事儿可不能乱说。不过既然你是自己人，我可以告诉你，以前我们用剪纸传递消息，不同的图案代表不同的含义。';
    } else if (userInput.includes('教') || userInput.includes('学')) {
      return '想学剪纸？好啊！先从简单的开始，拿起剪刀，跟着我的手势来...';
    } else {
      return '年轻人，多看看这些剪纸吧，每一幅都有它的故事。有什么想问的尽管问。';
    }
  },

  onQuickQuestion(e: any) {
    const { question } = e.currentTarget.dataset;
    this.setData({ inputText: question });
    this.onSendMessage();
  },

  onBackToGame() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return { title: `我正在和${this.data.npc.name}对话`, path: '/pages/index/index' };
  }
});