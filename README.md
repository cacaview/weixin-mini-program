# 红色剧本杀微信小程序

一款融合红色革命主题与非物质文化遗产元素的剧本杀游戏平台，支持纯文字LLM和多模态LLM适配。

## 🎯 项目特色

- 🎭 **剧本杀互动体验**：AI智能NPC对话，沉浸式剧情推理
- 🏺 **非遗文化传承**：融入剪纸、刺绣、竹编等非遗元素
- 🚩 **红色主题教育**：革命历史与传统文化相结合
- 🤖 **LLM智能适配**：支持纯文字和多模态LLM，兼容llamacpp-server

## 📁 项目结构

```
miniprogram/
├── app.ts                    # 应用入口（含LLM初始化）
├── app.json                  # 应用配置
├── app.less                  # 全局样式
├── services/                 # 服务层
│   ├── llm/                  # LLM核心服务
│   │   └── llm-service.ts    # 支持纯文字/多模态LLM，兼容llamacpp-server
│   ├── image/                # 图片服务
│   │   └── image-service.ts  # 图片上传、压缩、处理
│   └── api/                  # API服务
│       └── api-service.ts    # 后端接口封装
├── pages/                    # 页面（13个）
│   ├── index/                # 首页
│   ├── script-library/       # 剧本库
│   ├── script-detail/        # 剧本详情
│   ├── game-room/            # 游戏房间
│   ├── npc-chat/             # NPC对话（集成LLM）
│   ├── community/            # 社区
│   ├── create-script/        # 创作剧本（集成LLM）
│   ├── heritage/             # 非遗列表
│   ├── heritage-detail/      # 非遗详情（集成LLM教程生成）
│   ├── profile/              # 个人中心
│   ├── feedback/             # 反馈（集成LLM学习报告）
│   ├── settings/             # 设置（LLM配置）
│   └── logs/                 # 日志
├── components/               # 组件
├── assets/                   # 资源文件
└── utils/                    # 工具函数
```

## 🚀 快速开始

### 环境要求
- 微信开发者工具（最新版）
- Node.js 14+
- llamacpp-server（可选，用于本地LLM服务）

### 安装运行
1. 克隆项目到本地
2. 使用微信开发者工具打开项目目录
3. 等待自动编译完成
4. 在模拟器中预览

### LLM服务配置

#### 方式一：使用llamacpp-server（推荐）
1. 启动llamacpp-server服务
2. 在小程序"设置"页面配置服务器地址（默认：http://172.20.1.114:8080）
3. 点击"测试连接"验证配置

#### 方式二：使用OpenAI API
1. 在"设置"页面选择"OpenAI官方"
2. 输入API Key
3. 保存配置

#### 配置说明
```typescript
// 默认配置
llmConfig: {
  baseUrl: 'http://172.20.1.114:8080',  // llamacpp-server地址
  apiKey: '',                            // 可选，llamacpp通常不需要
  model: 'default',                      // 模型名称
  maxTokens: 2000,                       // 最大token数
  temperature: 0.7                       // 温度参数
}
```

## 📱 功能模块

### 1. 剧本杀互动体验
- **剧本库**：浏览、筛选红色主题剧本
- **游戏房间**：创建/加入房间，角色选择
- **AI智能NPC**：基于LLM的动态对话系统，支持上下文记忆
- **线索收集**：文字/图片线索，推理解谜

### 2. 非遗文化展示
- **非遗项目**：剪纸、刺绣、竹编等
- **AI教程生成**：根据难度级别生成个性化学习教程
- **作品展示**：上传作品，AI点评

### 3. AI辅助创作
- **剧本生成**：AI根据主题、非遗元素自动生成剧本大纲
- **角色设计**：智能生成角色背景和对话
- **线索设计**：自动生成线索和谜题

### 4. 学习反馈
- **学习追踪**：记录学习进度
- **AI学习报告**：智能分析学习效果
- **个性化建议**：根据数据推荐学习内容

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
- **LLM**：支持 llamacpp-server、GPT-3.5/4、GPT-4V、通义千问等
- **存储**：本地存储 + 云存储（可选）

### API兼容性
LLM服务层兼容OpenAI API格式，支持：
- llamacpp-server
- OpenAI官方API
- Azure OpenAI
- 其他兼容OpenAI格式的服务

## 📝 开发计划

- [x] 核心页面开发
- [x] LLM服务层封装
- [x] 基础UI实现
- [x] 集成llamacpp-server支持
- [x] NPC对话LLM集成
- [x] 剧本创作LLM集成
- [x] 非遗教程AI生成
- [x] 学习报告AI分析
- [x] LLM配置页面
- [ ] 接入真实后端API
- [ ] 实现WebSocket实时通信
- [ ] 添加语音对话功能
- [ ] AR非遗体验

## 🔄 最近更新

### v0.2.0 (2026-01-01)
- 新增LLM服务层，支持llamacpp-server
- NPC对话页面集成真实LLM调用
- 剧本创作页面集成AI生成功能
- 非遗详情页面添加AI教程生成
- 反馈页面添加AI学习报告分析
- 新增设置页面，支持LLM配置
- 优化UI交互体验

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！