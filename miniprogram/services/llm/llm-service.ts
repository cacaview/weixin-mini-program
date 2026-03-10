/**
 * LLM核心服务层
 * 统一管理LLM调用、内容生成与解析
 * 支持纯文字LLM和多模态LLM适配
 * 支持llamacpp-server API格式
 */

// LLM配置接口
interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// 消息类型
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

// 多模态内容部分
interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

// LLM响应接口
interface LLMResponse {
  success: boolean;
  content: string;
  error?: string;
}

// 剧本生成参数
interface ScriptGenerateParams {
  theme: string;
  heritageElements: string[];
  playerCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
}

// NPC对话参数
interface NPCChatParams {
  npcName: string;
  npcRole: string;
  npcBackground: string;
  scriptContext: string;
  userMessage: string;
  chatHistory: Message[];
  imageUrl?: string;
}

// LLM服务类
class LLMService {
  private config: LLMConfig;
  private isMultimodal: boolean;

  constructor() {
    this.config = {
      apiKey: '',
      baseUrl: 'http://172.20.1.114:8080',
      model: 'default',
      maxTokens: 2000,
      temperature: 0.7
    };
    this.isMultimodal = false;
  }

  init(config: Partial<LLMConfig>, multimodal: boolean = false): void {
    this.config = { ...this.config, ...config };
    this.isMultimodal = multimodal;
    if (multimodal && !config.model) {
      this.config.model = 'gpt-4-vision-preview';
    }
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private async sendRequest(messages: Message[]): Promise<LLMResponse> {
    return new Promise((resolve) => {
      const requestData: any = {
        messages: messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : 
            msg.content.map(part => part.type === 'text' ? part.text : '').join('')
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      };

      if (this.config.model && this.config.model !== 'default') {
        requestData.model = this.config.model;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      wx.request({
        url: `${this.config.baseUrl}/v1/chat/completions`,
        method: 'POST',
        header: headers,
        data: requestData,
        success: (res: any) => {
          console.log('LLM Response:', res);
          if (res.statusCode === 200 && res.data.choices && res.data.choices.length > 0) {
            resolve({
              success: true,
              content: res.data.choices[0].message.content
            });
          } else {
            resolve({
              success: false,
              content: '',
              // avoid optional chaining
              error: (res.data.error && res.data.error.message) || `请求失败: ${res.statusCode}`
            });
          }
        },
        fail: (err) => {
          console.error('LLM Request Error:', err);
          resolve({
            success: false,
            content: '',
            error: err.errMsg || '网络错误'
          });
        }
      });
    });
  }

  async chat(userMessage: string, systemPrompt?: string): Promise<LLMResponse> {
    const messages: Message[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userMessage });
    return this.sendRequest(messages);
  }

  async chatWithHistory(userMessage: string, history: Message[], systemPrompt?: string): Promise<LLMResponse> {
    const messages: Message[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push(...history);
    messages.push({ role: 'user', content: userMessage });
    return this.sendRequest(messages);
  }

  async generateScriptOutline(params: ScriptGenerateParams): Promise<LLMResponse> {
    const systemPrompt = `你是一位专业的剧本杀编剧，擅长创作融合红色革命主题和中国非物质文化遗产元素的剧本。请用中文回答。`;

    const userPrompt = `请为我创作一个剧本杀大纲：
- 主题：${params.theme}
- 非遗元素：${params.heritageElements.join('、')}
- 玩家人数：${params.playerCount}人
- 难度：${params.difficulty === 'easy' ? '简单' : params.difficulty === 'medium' ? '中等' : '困难'}
- 预计时长：${params.duration}分钟

请提供：1.剧本名称 2.故事背景 3.角色简介 4.主要线索 5.非遗融入方式 6.剧情大纲`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  async generateScriptDetail(outline: string, section: string): Promise<LLMResponse> {
    const systemPrompt = `你是一位专业的剧本杀编剧，正在根据大纲创作详细内容。请用中文回答。`;
    const userPrompt = `基于以下大纲，详细创作"${section}"部分：\n\n${outline}`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  async npcChat(params: NPCChatParams): Promise<LLMResponse> {
    const systemPrompt = `你现在扮演剧本杀中的NPC"${params.npcName}"。
角色：${params.npcRole}
背景：${params.npcBackground}
剧本背景：${params.scriptContext}

请保持角色扮演，用第一人称回答，适当透露线索但不直接说出答案。`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...params.chatHistory,
    ];

    if (this.isMultimodal && params.imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: params.userMessage },
          { type: 'image_url', image_url: { url: params.imageUrl, detail: 'auto' } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: params.userMessage });
    }

    return this.sendRequest(messages);
  }

  async analyzeImageClue(imageUrl: string, context: string): Promise<LLMResponse> {
    if (!this.isMultimodal) {
      return { success: false, content: '', error: '当前LLM不支持图片解析' };
    }

    const systemPrompt = `你是剧本杀游戏中的线索分析专家。请分析图片中的线索。`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: `剧情背景：${context}\n请分析这张图片中的线索：` },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
        ]
      }
    ]);
  }

  async generateHeritageTutorial(heritageName: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<LLMResponse> {
    const systemPrompt = `你是一位非物质文化遗产传承专家，擅长用通俗易懂的方式讲解传统技艺。请用中文回答。`;
    const levelText = level === 'beginner' ? '入门' : level === 'intermediate' ? '进阶' : '高级';
    
    const userPrompt = `请为"${heritageName}"创作一个${levelText}级别的学习教程，包含：
1. 技艺简介和历史背景
2. 所需材料和工具
3. 详细的步骤说明
4. 常见问题和注意事项
5. 与红色文化的关联
6. 学习建议`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  async analyzeFeedback(feedbackData: string, imageUrl?: string): Promise<LLMResponse> {
    const systemPrompt = `你是一位教育评估专家，擅长分析学习效果和提供改进建议。请用中文回答。`;

    let userContent: string | ContentPart[];
    
    if (this.isMultimodal && imageUrl) {
      userContent = [
        { type: 'text', text: `请分析以下学习反馈数据：\n\n${feedbackData}` },
        { type: 'image_url', image_url: { url: imageUrl, detail: 'auto' } }
      ];
    } else {
      userContent = `请分析以下学习反馈数据，给出评估报告：\n\n${feedbackData}`;
    }

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]);
  }

  async analyzeSemantics(text: string, keywords: string[]): Promise<LLMResponse> {
    const systemPrompt = `你是一个文本分析助手，擅长提取关键信息和进行语义匹配。请用JSON格式回答。`;

    const userPrompt = `请分析以下文本，判断是否包含这些关键线索：${keywords.join('、')}

文本内容：${text}

请返回JSON格式：
{"matchedKeywords":[],"relevanceScore":0,"summary":"","suggestions":[]}`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  async generateLearningReport(userData: any): Promise<LLMResponse> {
    const systemPrompt = `你是一位教育分析专家，擅长根据用户学习数据生成个性化学习报告。请用中文回答。`;

    const userPrompt = `请根据以下用户学习数据生成学习报告：
${JSON.stringify(userData, null, 2)}

报告应包含：
1. 学习概况总结
2. 优势和进步
3. 需要改进的地方
4. 个性化学习建议
5. 推荐的下一步学习内容`;

    return this.sendRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }
}

// 导出单例
export const llmService = new LLMService();
export default llmService;
export type { LLMConfig, Message, LLMResponse, ScriptGenerateParams, NPCChatParams };