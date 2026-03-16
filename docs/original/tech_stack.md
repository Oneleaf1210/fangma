# 放自己一马（放马）技术栈详细说明

**文档版本**：1.0
**创建日期**：2026-03-06
**关联文档**：[PRD.md](./PRD.md), [user_stories.md](./user_stories.md)

---

## 1. 技术选型概述

### 1.1 核心决策原则
1. **开发效率**：快速迭代，验证产品概念
2. **成本控制**：初期低成本启动，按需扩展
3. **用户体验**：流畅的交互，快速的响应
4. **可维护性**：清晰的架构，良好的文档
5. **可扩展性**：支持功能扩展和用户增长

### 1.2 技术方案对比
| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **微信小程序** | 无需安装，用户获取成本低，社交分享便利，生态成熟 | 平台限制，审核要求，功能受限 | ⭐⭐⭐⭐⭐ |
| **HTML5移动网页** | 跨平台，无需审核，技术灵活 | 需要推广获客，功能受限 | ⭐⭐⭐⭐ |
| **React Native** | 接近原生体验，跨平台 | 开发成本较高，需要安装 | ⭐⭐⭐ |
| **Flutter** | 高性能，跨平台 | 学习曲线，需要安装 | ⭐⭐⭐ |

**推荐方案**：微信小程序为首选，HTML5为备选方案。

---

## 2. 前端技术栈

### 2.1 微信小程序方案

#### 核心框架
- **小程序框架**：微信小程序原生框架
- **开发语言**：WXML + WXSS + JavaScript/TypeScript
- **基础库版本**：最新稳定版

#### UI组件库
- **主选**：Vant Weapp
  - 理由：组件丰富，设计现代，社区活跃
  - 安装：`npm install vant-weapp -S --production`
  - 使用：按需引入，减少包体积

- **备选**：自定义组件
  - 理由：完全控制，包体积最小
  - 适用：核心UI元素，如马匹隐喻相关组件

#### 状态管理
- **简单场景**：小程序原生 `Page.data` + `setData`
- **复杂场景**：MobX-miniprogram
  - 理由：响应式状态管理，适合复杂交互
  - 安装：`npm install mobx-miniprogram mobx-miniprogram-bindings`
  - 使用：Store模式，组件绑定

#### 网络请求
- **基础库**：`wx.request`
- **封装方案**：自定义请求拦截器
  ```javascript
  // request.js
  const request = (options) => {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
        fail: reject
      });
    });
  };
  ```

#### 本地存储
- **同步存储**：`wx.setStorageSync` / `wx.getStorageSync`
- **异步存储**：`wx.setStorage` / `wx.getStorage`
- **加密方案**：敏感数据加密后存储

#### 路由管理
- **页面跳转**：`wx.navigateTo`, `wx.redirectTo`, `wx.switchTab`
- **路由守卫**：自定义页面生命周期拦截

#### 开发工具
- **IDE**：微信开发者工具（官方） + VSCode
- **构建工具**：微信开发者工具内置
- **调试工具**：微信开发者工具调试器

### 2.2 HTML5方案（备选）

#### 核心框架
- **主选**：Vue 3 + Composition API
  - 理由：学习曲线平缓，生态丰富，性能优秀
  - 版本：Vue 3.4+
- **备选**：React 18 + Hooks
  - 理由：生态强大，灵活性高
  - 版本：React 18.2+

#### UI组件库
- **Vue方案**：Vant Mobile
  - 安装：`npm install vant`
  - 使用：按需引入，支持Tree Shaking
- **React方案**：Ant Design Mobile
  - 安装：`npm install antd-mobile`
  - 使用：按需引入

#### 状态管理
- **Vue方案**：Pinia
  - 理由：轻量，TypeScript支持好
  - 安装：`npm install pinia`
- **React方案**：Redux Toolkit
  - 理由：官方推荐，最佳实践
  - 安装：`npm install @reduxjs/toolkit react-redux`

#### 路由管理
- **Vue方案**：Vue Router 4
- **React方案**：React Router DOM 6

#### 构建工具
- **主选**：Vite
  - 理由：开发速度快，配置简单
  - 安装：`npm create vite@latest`
- **备选**：Webpack 5
  - 理由：生态成熟，配置灵活

#### 响应式设计
- **CSS框架**：Tailwind CSS 或 自定义CSS
- **适配方案**：rem + 媒体查询
- **移动端适配**：viewport配置 + 弹性布局

### 2.3 通用前端技术

#### TypeScript支持
- **配置**：`tsconfig.json` 严格模式
- **类型定义**：完整的接口定义
- **工具**：ESLint + Prettier 代码规范

#### 代码规范
- **ESLint配置**：Airbnb JavaScript规范 + 自定义规则
- **Prettier配置**：统一的代码格式化
- **Git Hooks**：husky + lint-staged 提交前检查

#### 测试方案
- **单元测试**：Jest + Testing Library
- **E2E测试**：Cypress 或 Playwright
- **测试覆盖度**：> 80%

#### 性能优化
- **代码分割**：路由级别分割
- **图片优化**：WebP格式，懒加载
- **缓存策略**：Service Worker缓存
- **包体积监控**：webpack-bundle-analyzer

---

## 3. 后端技术栈

### 3.1 服务端框架

#### Node.js方案（推荐）
- **框架**：Express.js 或 NestJS
  - Express：轻量灵活，快速开发
  - NestJS：企业级，TypeScript原生，架构清晰
- **版本**：Node.js 18+ LTS

#### Python方案（备选）
- **框架**：FastAPI
  - 理由：高性能，自动文档，Type hints
- **版本**：Python 3.10+

### 3.2 数据库

#### 主数据库：PostgreSQL
- **版本**：PostgreSQL 15+
- **ORM**：
  - Node.js：Prisma 或 TypeORM
  - Python：SQLAlchemy 或 Tortoise-ORM
- **连接池**：pgbouncer

#### 缓存数据库：Redis
- **用途**：会话缓存，频率限制，热点数据
- **版本**：Redis 7+
- **客户端**：
  - Node.js：ioredis
  - Python：redis-py

#### 数据模型设计
```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wechat_openid VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表
CREATE TABLE learning_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  slang_type VARCHAR(10), -- 'cantonese' 或 'english'
  slang_content TEXT,
  learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 对话历史表
CREATE TABLE chat_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_message TEXT,
  ai_response TEXT,
  emotion_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 API设计

#### RESTful API规范
- **版本控制**：URL路径版本 `api/v1/`
- **认证方式**：JWT (JSON Web Token)
- **响应格式**：
  ```json
  {
    "success": true,
    "data": {},
    "message": "操作成功",
    "code": 200
  }
  ```

#### 接口定义示例
```typescript
// TypeScript 接口定义
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

interface UserSettings {
  reminderTime: string;
  relaxDuration: number;
  languagePreference: 'cantonese' | 'english' | 'mixed';
}

interface SlangItem {
  id: number;
  type: 'cantonese' | 'english';
  phrase: string;
  meaning: string;
  example: string;
  culturalBackground: string;
}
```

#### GraphQL方案（可选）
- **框架**：Apollo Server
- **优势**：按需查询，减少请求次数
- **适用场景**：复杂数据关系查询

### 3.4 认证和授权

#### JWT实现
```javascript
// JWT工具函数
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
```

#### OAuth 2.0集成
- **微信登录**：微信开放平台OAuth
- **其他平台**：预留扩展接口

### 3.5 安全性

#### 输入验证
- **库**：Joi (Node.js) 或 Pydantic (Python)
- **策略**：所有输入都验证，白名单原则

#### SQL注入防护
- **ORM使用**：避免原生SQL
- **参数化查询**：使用预处理语句

#### XSS防护
- **输出编码**：自动HTML编码
- **CSP策略**：内容安全策略头

#### 速率限制
- **库**：express-rate-limit (Node.js)
- **策略**：IP级别和用户级别限制

---

## 4. AI集成方案

### 4.1 AI服务提供商

#### 主选：Anthropic Claude API
- **模型**：Claude 3 Haiku (成本低，响应快)
- **适用场景**：日常对话，情绪支持
- **备用模型**：Claude 3 Sonnet (需要更高质量时)

#### 备选：OpenAI GPT API
- **模型**：GPT-4 Turbo 或 GPT-3.5 Turbo
- **优势**：生态丰富，文档齐全

#### 国内备选（如需）
- **阿里云**：通义千问
- **百度**：文心一言
- **考虑因素**：成本，稳定性，内容合规

### 4.2 Prompt工程

#### 基础Prompt结构
```text
你是一个温暖、支持性的AI陪伴助手，帮助用户在繁忙生活中找到放松时刻。

用户信息：
- 姓名：[用户昵称]
- 当前情绪：[情绪状态]
- 学习偏好：[语言偏好]

对话历史：
[最近3轮对话]

当前上下文：
[用户当前输入]

你的角色：
1. 提供情绪支持和鼓励
2. 根据用户情绪调整回应方式
3. 在适当时候提供语言学习内容
4. 保持温暖、亲切的语气

请回应：
```

#### 多场景Prompt模板

**放马场景（放松引导）**
```text
[基础结构]
当前场景：用户正在工作间隙放松
目标：帮助用户放松，缓解压力
技巧：使用平静的语气，提供简单放松建议
避免：复杂话题，工作相关讨论
```

**策马场景（回归鼓励）**
```text
[基础结构]
当前场景：用户放松结束，准备回归工作
目标：提供正能量鼓励，帮助顺利过渡
技巧：使用激励性语言，简单目标建议
避免：过度延长放松话题
```

**抓马场景（语言学习）**
```text
[基础结构]
当前场景：用户选择语言学习
目标：教授有趣的语言知识，提供文化背景
内容：今日俚语：[俚语内容]
要求：解释清晰，例句实用，文化故事有趣
```

### 4.3 成本控制策略

#### 使用限制
- **用户级别**：每日免费次数限制
- **对话长度**：限制单次对话token数
- **缓存策略**：常见问题预置回答

#### 监控和优化
- **使用统计**：监控API调用量和成本
- **效果评估**：用户满意度与成本关联分析
- **Prompt优化**：定期评估和优化prompt效果

### 4.4 上下文管理

#### 短期记忆
- **存储**：Redis缓存最近对话
- **长度**：最近5-10轮对话
- **过期**：24小时自动清理

#### 长期记忆（可选）
- **存储**：PostgreSQL用户偏好和关键信息
- **使用**：个性化推荐，体验优化

---

## 5. 第三方服务集成

### 5.1 推送通知

#### 微信小程序
- **模板消息**：服务通知模板
- **订阅消息**：用户订阅后发送
- **限制**：模板审核，发送频率限制

#### HTML5方案
- **Web Push API**：浏览器推送
- **服务端**：Web Push库 + VAPID密钥

### 5.2 数据分析

#### 微信小程序
- **微信数据分析**：官方数据平台
- **自定义事件**：wx.reportAnalytics

#### 通用方案
- **Google Analytics 4**：事件跟踪
- **自定义分析**：后端事件日志 + 数据管道

#### 事件定义示例
```javascript
// 关键事件跟踪
const trackEvent = (eventName, params) => {
  // 微信小程序
  wx.reportAnalytics(eventName, params);

  // Google Analytics
  gtag('event', eventName, params);

  // 自定义后端
  api.post('/analytics/event', { eventName, params });
};

// 常用事件
trackEvent('reminder_triggered', { time: '14:30' });
trackEvent('relax_started', { duration: 5, type: 'ai_chat' });
trackEvent('learning_completed', { slang_type: 'cantonese' });
```

### 5.3 错误监控

#### 前端错误监控
- **工具**：Sentry
- **集成**：自动捕获JavaScript错误
- **信息**：用户上下文，设备信息，操作路径

#### 后端错误监控
- **日志系统**：Winston + ELK Stack
- **告警**：错误率阈值告警
- **追踪**：请求链路追踪

### 5.4 云服务

#### 存储服务
- **文件存储**：腾讯云COS 或 AWS S3
- **CDN加速**：腾讯云CDN 或 Cloudflare
- **图片处理**：云服务图片压缩和格式转换

#### 计算服务
- **服务器**：腾讯云CVM 或 AWS EC2
- **容器化**：Docker + Kubernetes（后期）
- **Serverless**：云函数（小程序云开发）

---

## 6. 开发环境和工具链

### 6.1 版本控制
- **平台**：Git + GitHub/GitLab
- **分支策略**：Git Flow 或 GitHub Flow
- **提交规范**：Conventional Commits

### 6.2 持续集成/持续部署
- **CI平台**：GitHub Actions 或 GitLab CI
- **构建流程**：
  ```
  代码提交 → 代码检查 → 单元测试 → 构建 → 部署
  ```
- **部署环境**：
  - 开发环境：develop分支自动部署
  - 测试环境：release分支手动部署
  - 生产环境：main分支手动审核部署

### 6.3 开发环境配置
```yaml
# docker-compose.yml 示例
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/app
      REDIS_URL: redis://redis:6379
```

### 6.4 文档和协作
- **API文档**：Swagger/OpenAPI
- **组件文档**：Storybook (前端)
- **知识库**：Confluence 或 Wiki
- **任务管理**：Jira 或 GitHub Projects

---

## 7. 性能优化策略

### 7.1 前端性能
- **包体积优化**：代码分割，Tree Shaking
- **资源优化**：图片懒加载，字体子集
- **渲染优化**：虚拟列表，防抖节流
- **缓存策略**：Service Worker，HTTP缓存

### 7.2 后端性能
- **数据库优化**：索引优化，查询优化
- **缓存策略**：Redis多级缓存
- **连接池**：数据库和Redis连接池
- **异步处理**：耗时操作队列处理

### 7.3 网络性能
- **CDN加速**：静态资源CDN
- **HTTP/2**：启用HTTP/2协议
- **压缩**：Brotli/Gzip压缩
- **预加载**：关键资源预加载

---

## 8. 安全策略

### 8.1 数据安全
- **传输加密**：全站HTTPS，HSTS头
- **存储加密**：敏感数据加密存储
- **密钥管理**：环境变量，密钥管理服务

### 8.2 访问安全
- **认证授权**：JWT + RBAC
- **速率限制**：API访问频率限制
- **IP黑名单**：恶意IP自动封禁

### 8.3 监控和响应
- **安全日志**：完整访问日志
- **入侵检测**：异常行为检测
- **应急响应**：安全事件响应流程

---

## 9. 部署架构

### 9.1 初期架构（用户<10,000）
```
用户 → CDN → 负载均衡 → 后端服务器 → 数据库
                              ↓
                            Redis
                              ↓
                           AI API
```

### 9.2 扩展架构（用户>10,000）
```
用户 → CDN → 负载均衡 → API网关 → 微服务集群
       ↓                    ↓          ↓
   静态资源             认证服务   业务服务
                              ↓          ↓
                            Redis    数据库集群
                              ↓          ↓
                          消息队列   读写分离
```

### 9.3 云原生架构（用户>100,000）
```
用户 → CDN → Ingress → Kubernetes集群
       ↓                    ↓
   对象存储             微服务 + Serverless
                              ↓
                          云数据库
                              ↓
                         AI服务集群
```

---

## 10. 成本估算

### 10.1 初期成本（月）
| 项目 | 预估成本 | 说明 |
|------|----------|------|
| **服务器** | ¥200-500 | 基础云服务器 |
| **数据库** | ¥100-300 | PostgreSQL云服务 |
| **AI API** | ¥500-2000 | 按使用量计费 |
| **CDN/存储** | ¥100-300 | 流量和存储费用 |
| **域名/SSL** | ¥50-100 | 域名和证书 |
| **总计** | ¥950-3200 | 月均成本 |

### 10.2 扩展成本
- **用户增长**：成本随用户量线性增长
- **AI成本**：主要成本项，需重点优化
- **运维成本**：自动化降低人力成本

### 10.3 成本优化策略
1. **AI成本**：缓存，使用限制，模型选择
2. **服务器成本**：自动扩缩容，预留实例
3. **存储成本**：生命周期策略，压缩优化

---

## 11. 技术风险和对策

### 11.1 技术债务
- **风险**：快速开发积累技术债务
- **对策**：定期重构，代码规范，自动化测试

### 11.2 第三方依赖
- **风险**：第三方服务不稳定或变更
- **对策**：抽象层，降级方案，多供应商备份

### 11.3 性能瓶颈
- **风险**：用户增长后性能下降
- **对策**：性能监控，容量规划，渐进式优化

### 11.4 安全漏洞
- **风险**：安全漏洞导致数据泄露
- **对策**：安全开发流程，定期安全审计，漏洞奖励

---

## 12. 技术团队要求

### 12.1 团队构成
- **前端开发**：1-2人（小程序/H5专家）
- **后端开发**：1-2人（Node.js/Python）
- **AI/算法**：1人（Prompt工程，AI集成）
- **运维/DevOps**：1人（部署，监控）

### 12.2 技能要求
- **前端**：小程序开发，Vue/React，移动端优化
- **后端**：RESTful API，数据库设计，性能优化
- **AI**：Prompt工程，AI API使用，成本控制
- **运维**：云服务，容器化，监控告警

---

**文档结束**