/**
 * LLM核心服务层
 * 统一管理LLM调用、内容生成与解析
 * 支持纯文字LLM和多模态LLM适配
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
  theme: string;           // 红色主题
  heritageElements: string[]; // 非遗元素
  playerCount: number;     // 玩家人数
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;        // 预计时长（分钟）
}

// NPC对话参数
interface NPCChatParams {
  npcName: string;
  npcRole: string;
  npcBackground: string;
  scriptContext: string;
  userMessage: string;
  chatHistory: Message[];
  imageUrl?: string;       // 支持图片输入（多模态）
}

// LLM服务类
class LLMService {
  private config: LLMConfig;
  private isMultimodal: boolean;

  constructor() {
    // 默认配置，实际使用时从服务器获取或本地配置
    this.config = {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7
    };
    this.isMultimodal = false;
  }

  /**
   * 初始化LLM服务
   * @param config LLM配置
   * @param multimodal 是否支持多模态
   */
  init(config: Partial<LLMConfig>, multimodal: boolean = false): void {
    this.config = { ...this.config, ...config };
    this.isMultimodal = multimodal;
    
    // 根据是否多模态选择模型
    if (multimodal && !config.model) {
      this.config.model = 'gpt-4-vision-preview';
    }
  }

  /**
   * 发送请求到LLM API
   */
  private async sendRequest(messages: Message[]): Promise<LLMResponse> {
    return new Promise((resolve) => {
      wx.request({
        url: `${this.config.baseUrl}/chat/completions`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        data: {
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        },
        success: (res: any) => {
          if (res.statusCode === 200 && res.data.choices) {
            resolve({
              success: true,
              content: res.data.choices[0].message.content
            });
          } else {
            resolve({
              success: false,
              content: '',
              error: res.data.error?.message || '请求失败'
            });
          }
        },
        fail: (err) => {
          resolve({
            success: false,
            content: '',
            error: err.errMsg || '网络错误'
          });
        }
      });
    });
  }

  /**
   * 生成剧本大纲
   */
  async generateScriptOutline(params: ScriptGenerateParams): Promise<LLMResponse> {
    const systemPrompt = `你是一位专业的剧本杀编剧，擅长创作融合红色革命主题和中国非物质文化遗产元素的剧本。
你需要创作既有教育意义又有趣味性的剧本，让玩家在游戏中学习历史和传统文化。`;

    const userPrompt = `请为我创作一个剧本杀大纲，要求如下：
- 主题：${params.theme}
- 非遗元素：${params.heritageElements.join('、')}
- 玩家人数：${params.playerCount}人
- 难度：${params.difficulty === 'easy' ? '简单' : params.difficulty === 'medium' ? '中等' : '困难'}
- 预计时长：${params.duration}分钟

请提供以下内容：
1. 剧本名称
2. 故事背景（200字左右）
3. 各角色简介（每个角色50字左右）
4. 主要线索列表
5. 非遗元素融入方式
6. 剧情大纲（分幕描述）`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return this.sendRequest(messages);
  }

  /**
   * 生成剧本详细内容
   */
  async generateScriptDetail(outline: string, section: string): Promise<LLMResponse> {
    const systemPrompt = `你是一位专业的剧本杀编剧，正在根据大纲创作详细的剧本内容。
请确保内容生动有趣，对话自然，线索设置合理，非遗元素融入自然。`;

    const userPrompt = `基于以下剧本大纲，请详细创作"${section}"部分的内容：

${outline}

请包含：
1. 详细的场景描述
2. 角色对话
3. 线索设置
4. 非遗元素的具体呈现方式`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return this.sendRequest(messages);
  }

  /**
   * NPC智能对话
   */
  async npcChat(params: NPCChatParams): Promise<LLMResponse> {
    const systemPrompt = `你现在扮演剧本杀中的NPC角色"${params.npcName}"。

角色设定：
- 身份：${params.npcRole}
- 背景：${params.npcBackground}

剧本背景：
${params.scriptContext}

请注意：
1. 始终保持角色扮演，用第一人称回答
2. 根据剧情适当透露线索，但不要直接说出答案
3. 回答要符合角色的身份和时代背景
4. 如果涉及非遗元素，要自然地融入对话中
5. 保持神秘感，引导玩家继续探索`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...params.chatHistory,
    ];

    // 处理用户消息（支持多模态）
    if (this.isMultimodal && params.imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: params.userMessage },
          { type: 'image_url', image_url: { url: params.imageUrl, detail: 'auto' } }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: params.userMessage
      });
    }

    return this.sendRequest(messages);
  }

  /**
   * 解析图片线索（多模态专用）
   */
  async analyzeImageClue(imageUrl: string, context: string): Promise<LLMResponse> {
    if (!this.isMultimodal) {
      return {
        success: false,
        content: '',
        error: '当前LLM不支持图片解析'
      };
    }

    const systemPrompt = `你是剧本杀游戏中的线索分析专家。
请分析用户提供的图片，结合剧情背景，给出线索解读。
如果图片中包含非遗元素，请特别指出并解释其文化含义。`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: `剧情背景：${context}\n\n请分析这张图片中的线索：` },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
        ]
      }
    ];

    return this.sendRequest(messages);
  }

  /**
   * 生成非遗教程
   */
  async generateHeritageTutorial(heritageName: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<LLMResponse> {
    const systemPrompt = `你是一位非物质文化遗产传承专家，擅长用通俗易懂的方式讲解传统技艺。`;

    const levelText = level === 'beginner' ? '入门' : level === 'intermediate' ? '进阶' : '高级';
    
    const userPrompt = `请为"${heritageName}"创作一个${levelText}级别的学习教程，包含：
1. 技艺简介和历史背景
2. 所需材料和工具
3. 详细的步骤说明（每步都要清晰描述）
4. 常见问题和注意事项
5. 与红色文化的关联（如有）
6. 学习建议和进阶方向`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return this.sendRequest(messages);
  }

  /**
   * 分析学习反馈
   */
  async analyzeFeedback(feedbackData: string, imageUrl?: string): Promise<LLMResponse> {
    const systemPrompt = `你是一位教育评估专家，擅长分析学习效果和提供改进建议。`;

    let userContent: string | ContentPart[];
    
    if (this.isMultimodal && imageUrl) {
      userContent = [
        { type: 'text', text: `请分析以下学习反馈数据，并结合用户提交的作品图片，给出评估报告：\n\n${feedbackData}` },
        { type: 'image_url', image_url: { url: imageUrl, detail: 'auto' } }
      ];
    } else {
      userContent = `请分析以下学习反馈数据，给出评估报告：\n\n${feedbackData}`;
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ];

    return this.sendRequest(messages);
  }

  /**
   * 文本语义分析（用于线索匹配）
   */
  async analyzeSemantics(text: string, keywords: string[]): Promise<LLMResponse> {
    const systemPrompt = `你是一个文本分析助手，擅长提取关键信息和进行语义匹配。`;

    const userPrompt = `请分析以下文本，判断是否包含这些关键线索：${keywords.join('、')}

文本内容：
${text}

请返回JSON格式的分析结果：
{
  "matchedKeywords": ["匹配到的关键词"],
  "relevanceScore": 0-100的相关度分数,
  "summary": "简要总结",
  "suggestions": ["后续探索建议"]
}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    return this.sendRequest(messages);
  }
}

// 导出单例
export const llmService = new LLMService();
export default llmService;