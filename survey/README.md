# 放马产品市场调研问卷部署指南

## 概述

本目录包含"放自己一马（放马）"手机应用的市场调研问卷系统。问卷数据将自动保存到Google Sheets，同时也会在用户浏览器本地备份。

## 文件说明

- `放马产品市场调研问卷.html`：基础问卷版本（无数据收集功能）
- `放马产品市场调研问卷_带数据收集.html`：完整问卷版本（带Google Sheets数据收集）

## 快速部署步骤

### 第1步：部署问卷到GitHub Pages

1. **创建GitHub仓库**
   ```bash
   # 1. 访问 https://github.com/new
   # 2. 仓库名: fangma-survey-data
   # 3. 选择 Public（公开）
   # 4. 点击 Create repository
   ```

2. **上传问卷文件**
   ```bash
   # 将本目录下的问卷文件上传到仓库根目录
   # - 放马产品市场调研问卷_带数据收集.html
   ```

3. **启用GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source: 选择 main 分支，/ (root) 目录
   - 点击 Save

4. **访问问卷**
   - 链接: `https://Oneleaf1210.github.io/fangma-survey-data/放马产品市场调研问卷_带数据收集.html`

### 第2步：设置Google Sheets数据收集（推荐）

#### A. 创建Google表格
1. 访问 [sheet.new](https://sheet.new) 创建新表格
2. 重命名表格为"放马问卷数据"
3. 在第一行添加表头（复制以下内容到A1-O1）：

```
提交时间 | 年龄 | 职业 | 压力程度 | 概念理解 | 学习兴趣 | 语言偏好 | 功能偏好 | 放松时长 | 使用场景 | 价格接受度 | 付费功能 | 推荐意愿 | 建议 | 联系方式
```

#### B. 创建Google Apps Script
1. 在Google表格中：**扩展程序 → Apps Script**
2. 删除默认代码，粘贴以下代码：

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // 整理数据为一行
    const row = [
      new Date(),
      data.age || '',
      data.occupation || '',
      data.stressLevel || '',
      data.conceptUnderstanding || '',
      data.learningInterest || '',
      data.languagePreference || '',
      data.featurePreference ? data.featurePreference.join(';') : '',
      data.relaxDuration || '',
      data.usageScenario ? data.usageScenario.join(';') : '',
      data.priceAcceptance || '',
      data.paidFeatures ? data.paidFeatures.join(';') : '',
      data.recommendation || '',
      data.suggestions || '',
      data.contact || ''
    ];

    sheet.appendRow(row);

    // 返回成功响应
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '数据保存成功' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 返回错误响应
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '保存失败: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 测试函数
function testDoPost() {
  const testData = {
    age: "25-30",
    occupation: "上班族",
    stressLevel: "7",
    conceptUnderstanding: "直观易懂",
    learningInterest: "非常感兴趣",
    languagePreference: "英语俚语",
    featurePreference: ["AI情绪陪伴", "趣味语言学习"],
    relaxDuration: "5-10分钟",
    usageScenario: ["工作间隙", "午休时间"],
    priceAcceptance: "18",
    paidFeatures: ["无限AI对话", "更多学习内容"],
    recommendation: "8",
    suggestions: "很好的想法！",
    contact: "test@example.com"
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result);
}
```

3. **保存项目**
   - 点击保存按钮（Ctrl+S）
   - 项目名称: `放马问卷数据收集`

#### C. 部署为Web应用
1. 点击 **部署 → 新建部署**
2. 类型选择：**Web 应用**
3. 配置设置：
   - 说明：放马问卷数据收集API
   - 执行身份：**我** (您的Google账号)
   - 访问权限：**任何人** (重要！)
4. 点击 **部署**
5. 授权Google账号（点击"Review Permissions" → 选择您的账号 → "Allow"）
6. **复制Web应用URL** (格式: `https://script.google.com/macros/s/XXXXXXXXXX/exec`)

#### D. 配置问卷
1. 打开 `放马产品市场调研问卷_带数据收集.html`
2. 找到第770行附近的配置区域：
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. 将 `YOUR_SCRIPT_ID` 替换为您的实际Script ID
4. 保存文件并重新上传到GitHub

### 第3步：测试数据收集
1. 访问您的问卷页面
2. 完整填写一份测试问卷
3. 提交后检查：
   - Google表格中是否新增一行数据
   - 浏览器控制台是否显示成功消息
   - 本地存储中是否有数据备份

## 数据管理

### 查看数据
1. **Google表格**：实时查看所有提交
2. **本地导出**：问卷感谢页面有"导出本地数据"按钮
3. **控制台日志**：浏览器开发者工具查看提交数据

### 数据备份
```bash
# 定期从Google表格导出
文件 → 下载 → Microsoft Excel (.xlsx)

# 或使用Google Takeout定期备份
```

## 故障排除

### 常见问题

#### 1. Google Script返回403错误
**原因**：未正确设置访问权限
**解决**：
- 重新部署Web应用
- 确保"访问权限"设置为"任何人"
- 重新授权Google账号

#### 2. 数据未保存到Google Sheets
**检查步骤**：
1. 打开浏览器开发者工具（F12）
2. 查看Console标签中的错误信息
3. 检查Network标签中的请求状态
4. 确保Google Script URL正确

#### 3. 表单提交卡住
**可能原因**：
- 网络问题
- Google Script执行超时
- 浏览器插件干扰

**解决**：
- 刷新页面重试
- 检查网络连接
- 禁用广告拦截插件

## 自动化部署脚本

本项目包含自动化部署脚本，可以简化部署流程：

```bash
# 1. 安装依赖（如果需要）
npm install

# 2. 运行部署脚本
node deploy-survey.js
```

注意：自动化部署需要事先配置GitHub和Google API凭据。

## 联系和支持

如有问题，请参考原始部署指南：[../docs/original/放马问卷数据收集部署指南.md](../docs/original/放马问卷数据收集部署指南.md)

或联系项目负责人。

---

**部署完成！** 您现在拥有一个完整的数据收集问卷系统。开始收集用户反馈，优化您的"放马"产品吧！