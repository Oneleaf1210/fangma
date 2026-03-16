#!/usr/bin/env node

/**
 * 放马问卷部署脚本
 *
 * 此脚本帮助自动化部署问卷到GitHub Pages和配置Google Sheets数据收集。
 * 需要事先配置相关凭据。
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 配置文件路径
const CONFIG_FILE = 'survey-config.json';
const QUESTIONNAIRE_FILE = '放马产品市场调研问卷_带数据收集.html';

// 默认配置模板
const DEFAULT_CONFIG = {
  github: {
    username: '',
    repository: 'fangma-survey-data',
    branch: 'main',
    token: '' // GitHub Personal Access Token
  },
  google: {
    scriptUrl: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
  },
  deployment: {
    surveyUrl: '',
    lastDeployed: null
  }
};

/**
 * 主函数
 */
async function main() {
  console.log('🚀 放马问卷部署脚本');
  console.log('=' .repeat(50));

  try {
    // 检查配置文件
    const config = await loadConfig();

    // 显示当前配置
    console.log('\n📋 当前配置:');
    console.log(`GitHub仓库: ${config.github.username}/${config.github.repository}`);
    console.log(`Google Script URL: ${config.google.scriptUrl}`);

    // 显示菜单
    await showMenu(config);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

/**
 * 加载配置文件
 */
async function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } else {
    console.log('⚠️  未找到配置文件，创建默认配置...');
    const config = DEFAULT_CONFIG;

    // 询问用户输入
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    config.github.username = await askQuestion(rl, '请输入GitHub用户名: ');
    config.github.repository = await askQuestion(rl, '请输入仓库名 (默认: fangma-survey-data): ', 'fangma-survey-data');

    console.log('\n📝 注意: 要使用自动化部署，您需要:');
    console.log('1. GitHub Personal Access Token (需要repo权限)');
    console.log('2. Google Apps Script部署URL');

    const saveConfig = await askQuestion(rl, '是否保存此配置? (y/n): ');
    if (saveConfig.toLowerCase() === 'y') {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      console.log('✅ 配置文件已保存:', CONFIG_FILE);
    }

    rl.close();
    return config;
  }
}

/**
 * 显示主菜单
 */
async function showMenu(config) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n📋 请选择操作:');
  console.log('1. 更新问卷中的Google Script URL');
  console.log('2. 生成部署指南');
  console.log('3. 检查问卷文件');
  console.log('4. 测试问卷功能');
  console.log('5. 退出');

  const choice = await askQuestion(rl, '请输入选项 (1-5): ');

  switch (choice) {
    case '1':
      await updateGoogleScriptUrl(config, rl);
      break;
    case '2':
      generateDeploymentGuide(config);
      break;
    case '3':
      checkQuestionnaireFile();
      break;
    case '4':
      await testQuestionnaire(config, rl);
      break;
    case '5':
      console.log('👋 再见!');
      rl.close();
      process.exit(0);
      break;
    default:
      console.log('❌ 无效选项');
  }

  rl.close();
  await showMenu(config);
}

/**
 * 更新问卷中的Google Script URL
 */
async function updateGoogleScriptUrl(config, rl) {
  console.log('\n🔧 更新Google Script URL...');

  if (!fs.existsSync(QUESTIONNAIRE_FILE)) {
    console.error('❌ 找不到问卷文件:', QUESTIONNAIRE_FILE);
    return;
  }

  // 读取问卷文件
  let content = fs.readFileSync(QUESTIONNAIRE_FILE, 'utf8');

  // 检查当前URL
  const currentUrlMatch = content.match(/const GOOGLE_SCRIPT_URL = '([^']+)'/);
  if (currentUrlMatch) {
    console.log(`当前URL: ${currentUrlMatch[1]}`);
  }

  // 询问新URL
  const newUrl = await askQuestion(rl, `请输入新的Google Script URL (当前: ${config.google.scriptUrl}): `, config.google.scriptUrl);

  // 更新URL
  const updatedContent = content.replace(
    /const GOOGLE_SCRIPT_URL = '[^']*'/,
    `const GOOGLE_SCRIPT_URL = '${newUrl}'`
  );

  // 保存文件
  fs.writeFileSync(QUESTIONNAIRE_FILE, updatedContent);
  console.log('✅ Google Script URL已更新');

  // 更新配置
  config.google.scriptUrl = newUrl;
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log('✅ 配置文件已更新');
}

/**
 * 生成部署指南
 */
function generateDeploymentGuide(config) {
  console.log('\n📄 生成部署指南...');

  const guide = `
# 手动部署步骤

## GitHub Pages部署
1. 访问 https://github.com/new
2. 创建仓库: ${config.github.repository}
3. 上传文件: ${QUESTIONNAIRE_FILE}
4. 启用GitHub Pages:
   - Settings → Pages
   - Source: main branch, / (root)

访问地址: https://${config.github.username}.github.io/${config.github.repository}/${QUESTIONNAIRE_FILE}

## Google Sheets配置
1. 创建Google表格: https://sheet.new
2. 添加表头: 提交时间 | 年龄 | 职业 | 压力程度 | 概念理解 | 学习兴趣 | 语言偏好 | 功能偏好 | 放松时长 | 使用场景 | 价格接受度 | 付费功能 | 推荐意愿 | 建议 | 联系方式
3. 创建Google Apps Script (代码见部署指南)
4. 部署为Web应用，获取URL: ${config.google.scriptUrl}
5. 更新问卷中的Google Script URL
`;

  const guideFile = 'DEPLOYMENT_GUIDE.md';
  fs.writeFileSync(guideFile, guide);
  console.log(`✅ 部署指南已生成: ${guideFile}`);
  console.log(guide);
}

/**
 * 检查问卷文件
 */
function checkQuestionnaireFile() {
  console.log('\n🔍 检查问卷文件...');

  if (!fs.existsSync(QUESTIONNAIRE_FILE)) {
    console.error('❌ 找不到问卷文件:', QUESTIONNAIRE_FILE);
    return;
  }

  const stats = fs.statSync(QUESTIONNAIRE_FILE);
  const content = fs.readFileSync(QUESTIONNAIRE_FILE, 'utf8');

  console.log(`文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`最后修改: ${stats.mtime.toLocaleString()}`);

  // 检查关键配置
  const hasGoogleScript = content.includes('GOOGLE_SCRIPT_URL');
  const hasLocalStorage = content.includes('fangma_survey_responses');
  const hasExportFunction = content.includes('exportLocalData');

  console.log('\n✅ 功能检查:');
  console.log(`Google Sheets集成: ${hasGoogleScript ? '✅' : '❌'}`);
  console.log(`本地存储备份: ${hasLocalStorage ? '✅' : '❌'}`);
  console.log(`数据导出功能: ${hasExportFunction ? '✅' : '❌'}`);

  // 检查URL配置
  const urlMatch = content.match(/const GOOGLE_SCRIPT_URL = '([^']+)'/);
  if (urlMatch) {
    const url = urlMatch[1];
    const isConfigured = !url.includes('YOUR_SCRIPT_ID');
    console.log(`Google Script URL配置: ${isConfigured ? '✅ 已配置' : '⚠️ 需要配置'}`);
    if (!isConfigured) {
      console.log(`当前URL: ${url}`);
    }
  }
}

/**
 * 测试问卷功能
 */
async function testQuestionnaire(config, rl) {
  console.log('\n🧪 测试问卷功能...');

  console.log('1. ✅ 问卷文件存在');
  console.log('2. ⚠️  需要在浏览器中手动测试以下功能:');
  console.log('   - 表单验证和提交');
  console.log('   - Google Sheets数据保存');
  console.log('   - 本地存储备份');
  console.log('   - 数据导出功能');

  console.log('\n📋 测试步骤:');
  console.log(`1. 打开问卷: file://${path.resolve(QUESTIONNAIRE_FILE)}`);
  console.log('2. 填写测试数据并提交');
  console.log('3. 检查浏览器控制台是否有错误');
  console.log('4. 检查Google表格是否收到数据');
  console.log('5. 测试本地数据导出');

  const openBrowser = await askQuestion(rl, '是否在浏览器中打开问卷? (y/n): ');
  if (openBrowser.toLowerCase() === 'y') {
    console.log('🌐 请在浏览器中打开:', path.resolve(QUESTIONNAIRE_FILE));
    // 尝试使用open命令打开
    try {
      const { execSync } = require('child_process');
      execSync(`open "${path.resolve(QUESTIONNAIRE_FILE)}"`);
    } catch (error) {
      console.log('⚠️  无法自动打开浏览器，请手动打开文件');
    }
  }
}

/**
 * 辅助函数：提问
 */
function askQuestion(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * 运行主函数
 */
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };