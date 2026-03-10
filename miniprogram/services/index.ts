/**
 * 服务层统一导出
 */

export { llmService } from './llm/llm-service';
export { imageService } from './image/image-service';
export { apiService } from './api/api-service';

// 导出LLM相关类型
export type {
  LLMConfig,
  Message,
  LLMResponse,
  ScriptGenerateParams,
  NPCChatParams
} from './llm/llm-service';

// 导出API相关类型
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
} from './api/api-service';