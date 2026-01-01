# 红色剧本杀微信小程序

一款融合红色革命主题与非物质文化遗产元素的剧本杀游戏平台，支持纯文字LLM和多模态LLM适配。

## 🎯 项目特色

- 🎭 **剧本杀互动体验**：AI智能NPC对话，沉浸式剧情推理
- 🏺 **非遗文化传承**：融入剪纸、刺绣、竹编等非遗元素
- 🚩 **红色主题教育**：革命历史与传统文化相结合
- 🤖 **LLM智能适配**：支持纯文字和多模态LLM

## 📁 项目结构

```
miniprogram/
├── app.ts                    # 应用入口
├── app.json                  # 应用配置
├── app.less                  # 全局样式
├── services/                 # 服务层
│   ├── llm/                  # LLM核心服务
│   │   └── llm-service.ts    # 支持纯文字/多模态LLM
│   ├── image/                # 图片服务
│   │   └── image-service.ts  # 图片上传、压缩、处理
│   └── api/                  # API服务
│       └── api-service.ts    # 后端接口封装
├── pages/                    # 页面（12个）
│   ├── index/                # 首页
│   ├── script-library/       # 剧本库
│   ├── script-detail/        # 剧本详情
│   ├── game-room/            # 游戏房间
│   ├── npc-chat/             # NPC对话
│   ├── community/            # 社区
│   ├── create-script/        # 创作剧本
│   ├── heritage/             # 非遗列表
│   ├── heritage-detail/      # 非遗详情
│   ├── profile/              # 个人中心
│   ├── feedback/             # 反馈
│   └── logs/                 # 日志
├── components/               # 组件
├── assets/                   # 资源文件
└── utils/                    # 工具函数
```

## 🚀 快速开始

### 环境要求
- 微信开发者工具（最新版）
- Node.js 14+

### 安装运行
1. 克隆项目到本地
2. 使用微信开发者工具打开项目目录
3. 等待自动编译完成
4. 在模拟器中预览

### 配置说明

#### LLM配置（可选）
在小程序设置页面或修改 `app.ts` 中的配置：
```typescript
llmConfig: {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  multimodal: false  // 设为true启用多模态
}
```

#### 后端API配置
修改 `services/api/api-service.ts`：
```typescript
const API_CONFIG = {
  baseUrl: 'https://your-api-server.com',
  timeout: 30000
};
```

## 📱 功能模块

### 1. 剧本杀互动体验
- **剧本库**：浏览、筛选红色主题剧本
- **游戏房间**：创建/加入房间，角色选择
- **AI智能NPC**：基于LLM的动态对话系统
- **线索收集**：文字/图片线索，推理解谜

### 2. 非遗文化展示
- **非遗项目**：剪纸、刺绣、竹编等
- **学习教程**：AI生成个性化教程
- **作品展示**：上传作品，AI点评

### 3. 社区交流
- **剧本创作**：AI辅助创作剧本
- **讨论交流**：分享心得，互动评论
- **作品展示**：展示非遗学习成果

### 4. 教育反馈
- **学习追踪**：记录学习进度
- **效果评估**：AI分析学习效果
- **个性化建议**：智能推荐学习内容

## 🔧 技术架构

### LLM适配设计
| 功能 | 纯文字LLM | 多模态LLM |
|------|----------|----------|
| 剧本生成 | ✅ 文字大纲 | ✅ 图文剧本 |
| NPC对话 | ✅ 文字对话 | ✅ 图文混合对话 |
| 线索解析 | ✅ 文字线索 | ✅ 图片线索解析 |
| 非遗教程 | ✅ 文字步骤 | ✅ 图文教程 |
| 作品点评 | ✅ 文字反馈 | ✅ 图片分析点评 |

### 技术栈
- **前端**：微信小程序原生 + TypeScript + Less
- **LLM**：支持 GPT-3.5/4、GPT-4V、通义千问等
- **存储**：本地存储 + 云存储（可选）

## 📝 开发计划

- [x] 核心页面开发
- [x] LLM服务层封装
- [x] 基础UI实现
- [ ] 接入真实后端API
- [ ] 实现WebSocket实时通信
- [ ] 添加语音对话功能
- [ ] AR非遗体验

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！