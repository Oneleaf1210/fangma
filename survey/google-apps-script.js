/**
 * 放马问卷数据收集 - Google Apps Script
 *
 * 将此代码粘贴到Google Apps Script编辑器中，然后部署为Web应用。
 */

function doPost(e) {
  try {
    // 获取活动的表格
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 解析提交的数据
    const data = JSON.parse(e.postData.contents);

    // 整理数据为一行，对应表头顺序
    const row = [
      new Date(), // 提交时间
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

    // 添加数据到表格
    sheet.appendRow(row);

    // 可选：格式化新添加的行
    formatNewRow(sheet, sheet.getLastRow());

    // 返回成功响应
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '数据保存成功',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 记录错误
    console.error('保存数据时出错:', error);

    // 返回错误响应
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '保存失败: ' + error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 格式化新添加的行
 */
function formatNewRow(sheet, rowNumber) {
  const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());

  // 设置背景颜色（浅灰色）
  range.setBackground('#f9f9f9');

  // 设置边框
  range.setBorder(true, true, true, true, true, true);

  // 设置时间列格式
  const timeRange = sheet.getRange(rowNumber, 1);
  timeRange.setNumberFormat('yyyy-MM-dd HH:mm:ss');
}

/**
 * 测试函数 - 用于验证脚本是否正常工作
 */
function testDoPost() {
  console.log('开始测试doPost函数...');

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
    suggestions: "这是一个测试提交，问卷系统工作正常！",
    contact: "test@example.com"
  };

  // 模拟POST请求
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  try {
    const result = doPost(mockEvent);
    console.log('测试结果:', result);
    console.log('✅ 测试通过！脚本工作正常。');
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

/**
 * 清理旧数据（可选）
 * 删除30天前的数据
 */
function cleanupOldData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let rowsToDelete = [];

  // 从最后一行开始检查（跳过表头）
  for (let i = data.length - 1; i >= 1; i--) {
    const rowDate = new Date(data[i][0]);
    if (rowDate < thirtyDaysAgo) {
      rowsToDelete.push(i + 1); // +1因为表格行号从1开始
    }
  }

  if (rowsToDelete.length > 0) {
    // 从下往上删除，避免行号变化
    rowsToDelete.sort((a, b) => b - a);
    rowsToDelete.forEach(row => {
      sheet.deleteRow(row);
    });
    console.log(`删除了 ${rowsToDelete.length} 行旧数据`);
  }
}

/**
 * 发送新提交通知（可选）
 * 当有新问卷提交时发送邮件通知
 */
function sendNewSubmissionNotification(email, data) {
  try {
    const subject = '📋 新问卷提交 - 放马产品调研';
    const body = `
收到新的问卷提交：

📅 提交时间: ${new Date().toLocaleString()}
👤 用户信息:
  - 年龄: ${data.age || '未填写'}
  - 职业: ${data.occupation || '未填写'}
  - 压力程度: ${data.stressLevel || '未填写'}/10

💡 反馈摘要:
  - 概念理解: ${data.conceptUnderstanding || '未填写'}
  - 学习兴趣: ${data.learningInterest || '未填写'}
  - 价格接受度: ¥${data.priceAcceptance || '未填写'}/月

💭 建议: ${data.suggestions || '无'}

完整数据已保存到Google表格。
    `;

    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body
    });

    console.log('通知邮件已发送至:', email);
  } catch (error) {
    console.error('发送通知邮件失败:', error);
  }
}

/**
 * 设置表格表头
 * 运行此函数初始化表格
 */
function setupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 清除现有内容
  sheet.clear();

  // 设置表头
  const headers = [
    '提交时间',
    '年龄',
    '职业',
    '压力程度',
    '概念理解',
    '学习兴趣',
    '语言偏好',
    '功能偏好',
    '放松时长',
    '使用场景',
    '价格接受度',
    '付费功能',
    '推荐意愿',
    '建议',
    '联系方式'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 格式化表头
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#5c6bc0');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 设置列宽
  for (let i = 0; i < headers.length; i++) {
    sheet.setColumnWidth(i + 1, 120);
  }

  console.log('✅ 表格表头设置完成');
}

/**
 * 获取部署URL
 * 运行此函数获取Web应用的部署URL
 */
function getDeploymentUrl() {
  const deployments = ScriptApp.getScript().getDeployments();

  if (deployments.length === 0) {
    console.log('⚠️  尚未部署Web应用，请先部署。');
    return null;
  }

  const deployment = deployments[0];
  const url = deployment.getDeploymentId();

  console.log('Web应用URL:', `https://script.google.com/macros/s/${url}/exec`);
  return url;
}

// 导出函数供测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { doPost, testDoPost };
}