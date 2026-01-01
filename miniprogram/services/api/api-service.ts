/**
 * API服务层
 * 统一管理后端接口调用
 */

// API配置
const API_CONFIG = {
  baseUrl: 'https://api.example.com', // 替换为实际后端地址
  timeout: 30000
};

// 请求配置接口
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  showLoading?: boolean;
  loadingText?: string;
}

// 响应接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 剧本接口
interface Script {
  id: string;
  title: string;
  cover: string;
  description: string;
  theme: string;
  heritageElements: string[];
  playerCount: { min: number; max: number };
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  rating: number;
  playCount: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  roles: ScriptRole[];
  clues: ScriptClue[];
  scenes: ScriptScene[];
  createdAt: string;
  updatedAt: string;
}

interface ScriptRole {
  id: string;
  name: string;
  avatar: string;
  description: string;
  background: string;
  goals: string[];
  skills: string[];
}

interface ScriptClue {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  relatedRoles: string[];
  unlockCondition: string;
}

interface ScriptScene {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  npcs: string[];
  availableClues: string[];
}

// 游戏房间接口
interface GameRoom {
  id: string;
  scriptId: string;
  scriptTitle: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  players: GamePlayer[];
  maxPlayers: number;
  currentScene: string;
  createdAt: string;
}

interface GamePlayer {
  id: string;
  name: string;
  avatar: string;
  roleId?: string;
  roleName?: string;
  isReady: boolean;
  isHost: boolean;
}

// 非遗项目接口
interface HeritageItem {
  id: string;
  name: string;
  category: string;
  cover: string;
  images: string[];
  description: string;
  history: string;
  techniques: string[];
  relatedScripts: string[];
  tutorials: HeritageTutorial[];
  location: {
    province: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface HeritageTutorial {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: TutorialStep[];
  materials: string[];
  duration: number;
}

interface TutorialStep {
  order: number;
  title: string;
  description: string;
  imageUrl?: string;
  tips?: string;
}

// 社区帖子接口
interface CommunityPost {
  id: string;
  type: 'script' | 'discussion' | 'showcase';
  title: string;
  content: string;
  images: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  createdAt: string;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  images: string[];
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies: Comment[];
}

// 用户接口
interface User {
  id: string;
  openId: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  badges: string[];
  playedScripts: number;
  createdScripts: number;
  heritageProgress: Record<string, number>;
  createdAt: string;
}

// 反馈数据接口
interface FeedbackData {
  id: string;
  scriptId: string;
  userId: string;
  type: 'script' | 'heritage' | 'general';
  questions: FeedbackQuestion[];
  submittedAt: string;
}

interface FeedbackQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'choice' | 'image';
  answer: any;
}

class ApiService {
  private token: string = '';

  /**
   * 设置认证Token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 基础请求方法
   */
  private async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { url, method = 'GET', data, header = {}, showLoading = true, loadingText = '加载中...' } = config;

    if (showLoading) {
      wx.showLoading({ title: loadingText, mask: true });
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${API_CONFIG.baseUrl}${url}`,
        method,
        data,
        timeout: API_CONFIG.timeout,
        header: {
          'Content-Type': 'application/json',
          'Authorization': this.token ? `Bearer ${this.token}` : '',
          ...header
        },
        success: (res) => {
          if (showLoading) {
            wx.hideLoading();
          }
          
          const response = res.data as ApiResponse<T>;
          if (response.code === 200) {
            resolve(response);
          } else if (response.code === 401) {
            this.handleUnauthorized();
            reject(new Error('登录已过期'));
          } else {
            reject(new Error(response.message || '请求失败'));
          }
        },
        fail: (err) => {
          if (showLoading) {
            wx.hideLoading();
          }
          reject(new Error(err.errMsg || '网络错误'));
        }
      });
    });
  }

  /**
   * 处理未授权
   */
  private handleUnauthorized(): void {
    this.token = '';
    wx.removeStorageSync('token');
    wx.showToast({ title: '请重新登录', icon: 'none' });
  }

  // ==================== 用户相关接口 ====================

  async wxLogin(code: string, userInfo?: WechatMiniprogram.UserInfo): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request({
      url: '/auth/wx-login',
      method: 'POST',
      data: { code, userInfo }
    });
  }

  async getUserInfo(): Promise<ApiResponse<User>> {
    return this.request({ url: '/user/info' });
  }

  async updateUserInfo(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request({ url: '/user/info', method: 'PUT', data });
  }

  // ==================== 剧本相关接口 ====================

  async getScriptList(params: {
    page?: number;
    pageSize?: number;
    theme?: string;
    difficulty?: string;
    heritageElement?: string;
    keyword?: string;
  }): Promise<ApiResponse<{ list: Script[]; total: number }>> {
    return this.request({ url: '/scripts', data: params });
  }

  async getScriptDetail(id: string): Promise<ApiResponse<Script>> {
    return this.request({ url: `/scripts/${id}` });
  }

  async createScript(data: Partial<Script>): Promise<ApiResponse<Script>> {
    return this.request({ url: '/scripts', method: 'POST', data });
  }

  async updateScript(id: string, data: Partial<Script>): Promise<ApiResponse<Script>> {
    return this.request({ url: `/scripts/${id}`, method: 'PUT', data });
  }

  async deleteScript(id: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/scripts/${id}`, method: 'DELETE' });
  }

  async getRecommendedScripts(): Promise<ApiResponse<Script[]>> {
    return this.request({ url: '/scripts/recommended' });
  }

  // ==================== 游戏房间相关接口 ====================

  async createGameRoom(scriptId: string): Promise<ApiResponse<GameRoom>> {
    return this.request({ url: '/rooms', method: 'POST', data: { scriptId } });
  }

  async joinGameRoom(roomId: string): Promise<ApiResponse<GameRoom>> {
    return this.request({ url: `/rooms/${roomId}/join`, method: 'POST' });
  }

  async leaveGameRoom(roomId: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/rooms/${roomId}/leave`, method: 'POST' });
  }

  async getGameRoom(roomId: string): Promise<ApiResponse<GameRoom>> {
    return this.request({ url: `/rooms/${roomId}` });
  }

  async selectRole(roomId: string, roleId: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/rooms/${roomId}/select-role`, method: 'POST', data: { roleId } });
  }

  async toggleReady(roomId: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/rooms/${roomId}/ready`, method: 'POST' });
  }

  async startGame(roomId: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/rooms/${roomId}/start`, method: 'POST' });
  }

  async getGameProgress(roomId: string): Promise<ApiResponse<{
    currentScene: ScriptScene;
    unlockedClues: ScriptClue[];
    chatHistory: any[];
  }>> {
    return this.request({ url: `/rooms/${roomId}/progress` });
  }

  // ==================== NPC对话相关接口 ====================

  async sendNPCMessage(roomId: string, npcId: string, message: string, imageUrl?: string): Promise<ApiResponse<{
    reply: string;
    newClues?: ScriptClue[];
  }>> {
    return this.request({
      url: `/rooms/${roomId}/npc-chat`,
      method: 'POST',
      data: { npcId, message, imageUrl }
    });
  }

  // ==================== 非遗相关接口 ====================

  async getHeritageList(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    keyword?: string;
  }): Promise<ApiResponse<{ list: HeritageItem[]; total: number }>> {
    return this.request({ url: '/heritage', data: params });
  }

  async getHeritageDetail(id: string): Promise<ApiResponse<HeritageItem>> {
    return this.request({ url: `/heritage/${id}` });
  }

  async getHeritageTutorial(heritageId: string, tutorialId: string): Promise<ApiResponse<HeritageTutorial>> {
    return this.request({ url: `/heritage/${heritageId}/tutorials/${tutorialId}` });
  }

  async submitHeritageWork(heritageId: string, data: {
    tutorialId: string;
    images: string[];
    description: string;
  }): Promise<ApiResponse<{ feedback: string; score: number }>> {
    return this.request({
      url: `/heritage/${heritageId}/works`,
      method: 'POST',
      data
    });
  }

  async getNearbyHeritage(latitude: number, longitude: number, radius: number = 10000): Promise<ApiResponse<HeritageItem[]>> {
    return this.request({
      url: '/heritage/nearby',
      data: { latitude, longitude, radius }
    });
  }

  // ==================== 社区相关接口 ====================

  async getCommunityPosts(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    tag?: string;
  }): Promise<ApiResponse<{ list: CommunityPost[]; total: number }>> {
    return this.request({ url: '/community/posts', data: params });
  }

  async getPostDetail(postId: string): Promise<ApiResponse<CommunityPost>> {
    return this.request({ url: `/community/posts/${postId}` });
  }

  async createPost(data: {
    type: string;
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
  }): Promise<ApiResponse<CommunityPost>> {
    return this.request({ url: '/community/posts', method: 'POST', data });
  }

  async likePost(postId: string): Promise<ApiResponse<void>> {
    return this.request({ url: `/community/posts/${postId}/like`, method: 'POST' });
  }

  async getComments(postId: string, page: number = 1): Promise<ApiResponse<{ list: Comment[]; total: number }>> {
    return this.request({ url: `/community/posts/${postId}/comments`, data: { page } });
  }

  async addComment(postId: string, content: string, images?: string[]): Promise<ApiResponse<Comment>> {
    return this.request({
      url: `/community/posts/${postId}/comments`,
      method: 'POST',
      data: { content, images }
    });
  }

  async voteScript(scriptId: string, vote: 'up' | 'down', reason?: string): Promise<ApiResponse<void>> {
    return this.request({
      url: `/scripts/${scriptId}/vote`,
      method: 'POST',
      data: { vote, reason }
    });
  }

  // ==================== 反馈相关接口 ====================

  async getFeedbackForm(type: string, targetId?: string): Promise<ApiResponse<{
    questions: FeedbackQuestion[];
  }>> {
    return this.request({ url: '/feedback/form', data: { type, targetId } });
  }

  async submitFeedback(data: {
    type: string;
    targetId?: string;
    answers: { questionId: string; answer: any }[];
    images?: string[];
  }): Promise<ApiResponse<{ report: string }>> {
    return this.request({ url: '/feedback', method: 'POST', data });
  }

  async getLearningReport(userId?: string): Promise<ApiResponse<{
    totalPlayTime: number;
    scriptsPlayed: number;
    heritageProgress: Record<string, number>;
    achievements: string[];
    suggestions: string[];
  }>> {
    return this.request({ url: '/feedback/learning-report', data: { userId } });
  }
}

// 导出单例
export const apiService = new ApiService();
export default apiService;

// 导出类型
export type {
  Script,
  ScriptRole,
  ScriptClue,
  ScriptScene,
  GameRoom,
  GamePlayer,
  HeritageItem,
  HeritageTutorial,
  TutorialStep,
  CommunityPost,
  Comment,
  User,
  FeedbackData,
  FeedbackQuestion,
  ApiResponse
};