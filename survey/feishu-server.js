#!/usr/bin/env node

/**
 * 飞书表格数据收集服务器
 *
 * 此服务器接收问卷数据并通过飞书API保存到飞书多维表格
 * 需要配置飞书开放平台应用和多维表格
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 检查依赖是否安装
try {
  require('express');
  require('cors');
  require('axios');
} catch (error) {
  console.error('❌ 缺少依赖，请先运行: npm install express cors axios');
  process.exit(1);
}

// 配置文件路径
const CONFIG_FILE = 'feishu-config.json';
const CONFIG_TEMPLATE = 'feishu-config.template.json';

// 默认配置
let config = {
  feishu: {
    appId: '',
    appSecret: '',
    appToken: '',
    tableId: ''
  },
  server: {
    port: 3000,
    corsOrigin: '*'
  },
  storage: {
    enableLocalBackup: true,
    backupFilePath: './data/backup.json'
  }
};

// 加载配置文件
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const fileContent = fs.readFileSync(CONFIG_FILE, 'utf8');
      const loadedConfig = JSON.parse(fileContent);
      config = { ...config, ...loadedConfig };
      console.log('✅ 配置文件加载成功');
      return true;
    } else {
      console.warn(`⚠️  配置文件 ${CONFIG_FILE} 不存在`);
      console.log(`📝 请复制 ${CONFIG_TEMPLATE} 为 ${CONFIG_FILE} 并填写配置`);
      return false;
    }
  } catch (error) {
    console.error('❌ 加载配置文件失败:', error.message);
    return false;
  }
}

// 飞书API工具类
class FeishuAPI {
  constructor(appId, appSecret, appToken, tableId) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.appToken = appToken;
    this.tableId = tableId;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  // 获取访问令牌
  async getAccessToken() {
    const now = Date.now();

    // 如果令牌还有效，直接返回
    if (this.accessToken && this.tokenExpiresAt > now + 60000) { // 提前1分钟刷新
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        app_id: this.appId,
        app_secret: this.appSecret
      }, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (response.data.code === 0) {
        this.accessToken = response.data.tenant_access_token;
        this.tokenExpiresAt = now + (response.data.expire * 1000);
        console.log('✅ 飞书访问令牌获取成功');
        return this.accessToken;
      } else {
        throw new Error(`获取令牌失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('❌ 获取飞书访问令牌失败:', error.message);
      throw error;
    }
  }

  // 添加记录到多维表格
  async addRecord(data) {
    const token = await this.getAccessToken();

    // 将问卷数据转换为飞表格字段格式
    const fields = this.mapQuestionnaireToFields(data);

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.appToken}/tables/${this.tableId}/records`,
        {
          fields: fields
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 0) {
        console.log('✅ 数据已保存到飞书表格');
        return {
          success: true,
          recordId: response.data.data.record.record_id,
          message: '数据保存成功'
        };
      } else {
        console.error('❌ 保存到飞书表格失败:', response.data.msg);
        return {
          success: false,
          message: `飞书API错误: ${response.data.msg}`
        };
      }
    } catch (error) {
      console.error('❌ 调用飞书API失败:', error.message);
      return {
        success: false,
        message: `网络错误: ${error.message}`
      };
    }
  }

  // 将问卷数据映射到飞书表格字段
  mapQuestionnaireToFields(data) {
    // 这里需要根据实际的飞书表格字段结构进行映射
    // 假设飞书表格有以下字段：提交时间、年龄、职业、压力程度、概念理解等

    return {
      '提交时间': new Date().toISOString(),
      '年龄': data.age || '',
      '职业': data.occupation || '',
      '压力程度': data.stressLevel || '',
      '概念理解': data.conceptUnderstanding || '',
      '学习兴趣': data.learningInterest || '',
      '语言偏好': data.languagePreference || '',
      '功能偏好': Array.isArray(data.featurePreference) ? data.featurePreference.join(';') : (data.featurePreference || ''),
      '放松时长': data.relaxDuration || '',
      '使用场景': Array.isArray(data.usageScenario) ? data.usageScenario.join(';') : (data.usageScenario || ''),
      '价格接受度': data.priceAcceptance || '',
      '付费功能': Array.isArray(data.paidFeatures) ? data.paidFeatures.join(';') : (data.paidFeatures || ''),
      '推荐意愿': data.recommendation || '',
      '建议': data.suggestions || '',
      '联系方式': data.contact || '',
      '用户代理': data.userAgent || '',
      '平台': data.platform || ''
    };
  }

  // 测试API连接
  async testConnection() {
    try {
      const token = await this.getAccessToken();
      return {
        success: true,
        message: '飞书API连接测试成功'
      };
    } catch (error) {
      return {
        success: false,
        message: `连接测试失败: ${error.message}`
      };
    }
  }
}

// 本地数据备份
function backupDataLocally(data, filePath) {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 读取现有数据
    let backups = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      backups = JSON.parse(content);
    }

    // 添加新数据
    backups.push({
      timestamp: new Date().toISOString(),
      data: data
    });

    // 保存数据
    fs.writeFileSync(filePath, JSON.stringify(backups, null, 2), 'utf8');
    console.log(`✅ 数据已备份到本地: ${filePath}`);
    return true;
  } catch (error) {
    console.error('❌ 本地备份失败:', error.message);
    return false;
  }
}

// 初始化Express应用
const app = express();

// 中间件
app.use(cors({
  origin: config.server.corsOrigin
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'fangma-feishu-server',
    timestamp: new Date().toISOString()
  });
});

// 测试飞书连接
app.get('/test', async (req, res) => {
  try {
    const feishu = new FeishuAPI(
      config.feishu.appId,
      config.feishu.appSecret,
      config.feishu.appToken,
      config.feishu.tableId
    );

    const result = await feishu.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `测试失败: ${error.message}`
    });
  }
});

// 主数据提交端点
app.post('/submit', async (req, res) => {
  try {
    const data = req.body;

    console.log('📥 收到问卷提交:', {
      timestamp: new Date().toISOString(),
      age: data.age,
      occupation: data.occupation
    });

    // 验证必要字段
    if (!data.age || !data.occupation) {
      return res.status(400).json({
        success: false,
        message: '缺少必要字段: age 和 occupation 是必填的'
      });
    }

    // 本地备份
    if (config.storage.enableLocalBackup) {
      backupDataLocally(data, config.storage.backupFilePath);
    }

    // 保存到飞书表格
    const feishu = new FeishuAPI(
      config.feishu.appId,
      config.feishu.appSecret,
      config.feishu.appToken,
      config.feishu.tableId
    );

    const result = await feishu.addRecord(data);

    if (result.success) {
      res.json({
        success: true,
        message: '问卷数据保存成功',
        timestamp: new Date().toISOString(),
        recordId: result.recordId
      });
    } else {
      // 即使飞书保存失败，也返回200（因为已本地备份）
      res.json({
        success: true,
        message: '问卷数据已本地备份（飞书保存失败）',
        timestamp: new Date().toISOString(),
        warning: result.message
      });
    }

  } catch (error) {
    console.error('❌ 处理提交时出错:', error);
    res.status(500).json({
      success: false,
      message: `服务器错误: ${error.message}`
    });
  }
});

// 导出本地备份数据
app.get('/export', (req, res) => {
  try {
    const filePath = config.storage.backupFilePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '暂无备份数据'
      });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const filename = `fangma_backup_${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `导出失败: ${error.message}`
    });
  }
});

// 启动服务器
function startServer() {
  if (!loadConfig()) {
    console.log('⚠️  使用默认配置启动服务器，部分功能可能不可用');
  }

  const port = config.server.port;

  app.listen(port, () => {
    console.log(`🚀 飞书数据收集服务器已启动`);
    console.log(`📍 本地地址: http://localhost:${port}`);
    console.log(`📍 健康检查: http://localhost:${port}/health`);
    console.log(`📍 连接测试: http://localhost:${port}/test`);
    console.log(`📍 提交端点: http://localhost:${port}/submit (POST)`);
    console.log('');
    console.log('📋 配置信息:');
    console.log(`   - 飞书App ID: ${config.feishu.appId ? '已配置' : '未配置'}`);
    console.log(`   - 飞书表格Token: ${config.feishu.appToken ? '已配置' : '未配置'}`);
    console.log(`   - 本地备份: ${config.storage.enableLocalBackup ? '启用' : '禁用'}`);
  });
}

// 命令行接口
if (require.main === module) {
  startServer();
}

// 导出供测试使用
module.exports = {
  app,
  FeishuAPI,
  backupDataLocally,
  loadConfig
};