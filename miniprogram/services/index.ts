/**
 * 服务层统一导出
 */

export { llmService } from './llm/llm-service';
export { imageService } from './image/image-service';
export { apiService } from './api/api-service';

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
} from './api/api-service';