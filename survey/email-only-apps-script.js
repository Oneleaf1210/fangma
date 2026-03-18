/**
 * 放马问卷数据收集 - 邮件+表格版 Google Apps Script
 *
 * 此版本同时发送邮件通知和保存到Google表格
 * 将问卷数据发送到邮箱并备份到表格
 */

// 配置：收件人邮箱（修改为你的邮箱）
const RECIPIENT_EMAIL = 'canav3ral@gmail.com';

// 配置：表格名称
const SHEET_NAME = '问卷数据';

function doPost(e) {
  console.log('收到 POST 请求');
  console.log('请求内容:', e.postData.contents);

  try {
    // 解析提交的数据
    const data = JSON.parse(e.postData.contents);
    console.log('解析后的数据:', JSON.stringify(data, null, 2));

    // 验证必填字段
    if (!data.age || !data.occupation) {
      console.warn('缺少必填字段: age 或 occupation');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: '缺少必填字段: age 和 occupation 是必填的'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    let emailSent = false;
    let sheetSaved = false;

    // 1. 保存到 Google Sheets（优先确保数据不丢失）
    try {
      saveToSheet(data);
      console.log('✅ 数据已保存到表格');
      sheetSaved = true;
    } catch (sheetError) {
      console.error('❌ 保存到表格失败:', sheetError);
    }

    // 2. 发送邮件（失败不影响整体结果）
    try {
      sendQuestionnaireEmail(data);
      console.log('✅ 邮件发送成功');
      emailSent = true;
    } catch (emailError) {
      console.error('❌ 发送邮件失败:', emailError);
    }

    // 返回成功响应
    const message = [];
    if (sheetSaved) message.push('数据已保存到表格');
    if (emailSent) message.push('邮件已发送');

    return ContentService.createTextOutput(JSON.stringify({
      success: sheetSaved || emailSent,
      message: message.length > 0 ? message.join('，') : '处理完成但有错误',
      timestamp: new Date().toISOString(),
      details: {
        sheetSaved: sheetSaved,
        emailSent: emailSent
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('处理提交时出错:', error);

    // 返回错误响应
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '处理失败: ' + error.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 保存数据到 Google Sheets
 */
function saveToSheet(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  // 如果表格不存在，创建它
  if (!sheet) {
    console.log('创建新表格:', SHEET_NAME);
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    // 添加表头
    const headers = [
      '提交时间', '年龄', '职业', '压力程度', '概念理解',
      '学习兴趣', '语言偏好', '功能偏好', '放松时长', '使用场景',
      '价格接受度', '付费功能', '推荐意愿', '建议', '联系方式'
    ];
    sheet.appendRow(headers);
    // 格式化表头
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
  }

  // 准备数据行
  const row = [
    new Date(),                                    // 提交时间
    data.age || '',                               // 年龄
    data.occupation || '',                        // 职业
    data.stressLevel || '',                       // 压力程度
    data.conceptUnderstanding || '',              // 概念理解
    data.learningInterest || '',                  // 学习兴趣
    data.languagePreference || '',                // 语言偏好
    formatArray(data.featurePreference, '; '),    // 功能偏好
    data.relaxDuration || '',                     // 放松时长
    formatArray(data.usageScenario, '; '),        // 使用场景
    data.priceAcceptance || '',                   // 价格接受度
    formatArray(data.paidFeatures, '; '),         // 付费功能
    data.recommendation || '',                    // 推荐意愿
    data.suggestions || '',                       // 建议
    data.contact || ''                            // 联系方式
  ];

  // 添加数据行
  sheet.appendRow(row);
  console.log('✅ 已添加数据行到表格');
}

/**
 * 处理 OPTIONS 预检请求（CORS）
 */
function doOptions(e) {
  console.log('收到 OPTIONS 预检请求');
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
}

/**
 * 处理 GET 请求 - 用于健康检查和直接访问
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: '放马问卷邮件服务运行正常',
      recipient: RECIPIENT_EMAIL,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 发送问卷数据邮件
 */
function sendQuestionnaireEmail(data) {
  try {
    const subject = `📋 新问卷提交 - ${data.age || '匿名用户'} - 放马产品调研`;
    const body = generateEmailBody(data);

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: subject,
      body: body
    });

    console.log('✅ 问卷邮件已发送至:', RECIPIENT_EMAIL);
    return { success: true };
  } catch (error) {
    console.error('❌ 发送邮件失败:', error);
    throw error;
  }
}

/**
 * 生成邮件正文
 */
function generateEmailBody(data) {
  const timestamp = new Date().toLocaleString('zh-CN');

  return `
📅 提交时间: ${timestamp}
🌐 来源: ${data.userAgent ? '网页问卷' : '未知'}

👤 用户基本信息
────────────────
• 年龄: ${data.age || '未填写'}
• 职业: ${data.occupation || '未填写'}
• 压力程度: ${data.stressLevel || '未填写'}/10

💡 产品概念反馈
────────────────
• 概念理解: ${data.conceptUnderstanding || '未填写'}
• 学习兴趣: ${data.learningInterest || '未填写'}
• 语言偏好: ${data.languagePreference || '未填写'}

🎯 功能偏好
────────────────
• 期待的功能: ${formatArray(data.featurePreference, '; ') || '未选择'}
• 放松时长: ${data.relaxDuration || '未填写'}
• 使用场景: ${formatArray(data.usageScenario, '; ') || '未选择'}

💰 付费意愿
────────────────
• 价格接受度: ¥${data.priceAcceptance || '未填写'}/月
• 感兴趣的付费功能: ${formatArray(data.paidFeatures, '; ') || '无'}

📊 总体反馈
────────────────
• 推荐意愿: ${data.recommendation || '未填写'}/10
• 建议: ${data.suggestions || '无建议'}

📞 联系方式
────────────────
${data.contact || '未提供'}

📋 原始数据（JSON格式）
────────────────
${JSON.stringify(data, null, 2)}

────────────────
放马产品调研问卷系统
提交时间: ${timestamp}
  `.trim();
}

/**
 * 格式化数组为字符串
 */
function formatArray(arr, separator = ', ') {
  if (!arr) return '';
  if (Array.isArray(arr)) {
    return arr.join(separator);
  }
  return String(arr);
}

/**
 * 测试函数 - 用于验证脚本是否正常工作
 */
function testSendEmail() {
  console.log('开始测试邮件发送功能...');

  // 创建测试数据
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
    suggestions: "这是一个测试提交，问卷邮件系统工作正常！建议增加更多放松场景。",
    contact: "test@example.com",
    userAgent: "Mozilla/5.0 (测试) Chrome/120.0.0.0",
    platform: "MacIntel",
    timestamp: new Date().toISOString()
  };

  try {
    const result = sendQuestionnaireEmail(testData);
    console.log('✅ 测试通过！邮件应已发送至:', RECIPIENT_EMAIL);
    console.log('请检查你的邮箱收件箱（包括垃圾邮件文件夹）');
    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 获取部署URL
 */
function getDeploymentUrl() {
  const deployments = ScriptApp.getScript().getDeployments();

  if (deployments.length === 0) {
    console.log('⚠️  尚未部署Web应用，请先部署。');
    console.log('部署步骤:');
    console.log('1. 点击"部署" → "新建部署"');
    console.log('2. 类型选择"Web 应用"');
    console.log('3. 执行身份: "我"');
    console.log('4. 访问权限: "任何人"');
    console.log('5. 点击"部署"');
    return null;
  }

  const deployment = deployments[0];
  const url = deployment.getDeploymentId();

  const fullUrl = `https://script.google.com/macros/s/${url}/exec`;
  console.log('✅ Web应用URL:', fullUrl);
  console.log('');
  console.log('📋 配置检查:');
  console.log('• 收件人邮箱:', RECIPIENT_EMAIL);
  console.log('• 部署状态: 已部署');
  console.log('');
  console.log('⚠️  重要提醒:');
  console.log('1. 首次使用时需要授权邮件发送权限');
  console.log('2. 请检查RECIPIENT_EMAIL配置是否正确');
  console.log('3. 测试邮件可能进入垃圾邮件文件夹');

  return fullUrl;
}

/**
 * 设置脚本（首次运行）
 */
function setupScript() {
  console.log('🎯 放马问卷邮件脚本设置');
  console.log('========================');
  console.log('');
  console.log('📋 当前配置:');
  console.log('• 收件人邮箱:', RECIPIENT_EMAIL);
  console.log('');
  console.log('🚀 使用步骤:');
  console.log('1. 修改RECIPIENT_EMAIL为你的邮箱');
  console.log('2. 运行 testSendEmail() 测试邮件发送');
  console.log('3. 运行 getDeploymentUrl() 获取部署URL');
  console.log('4. 将URL复制到问卷HTML文件中');
  console.log('');
  console.log('✅ 脚本已初始化');
}

// 导出函数供测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { doPost, sendQuestionnaireEmail, testSendEmail, getDeploymentUrl };
}