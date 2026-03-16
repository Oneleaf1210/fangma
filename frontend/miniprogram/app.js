// app.js - 放马小程序入口文件
App({
  // 小程序初始化完成时触发
  onLaunch(options) {
    console.log('放马小程序初始化完成', options);

    // 检查登录状态
    this.checkLoginStatus();

    // 初始化用户设置
    this.initUserSettings();

    // 初始化AI服务
    this.initAIService();

    // 检查更新
    this.checkUpdate();

    // 性能监控
    this.initPerformanceMonitor();
  },

  // 小程序显示时触发
  onShow(options) {
    console.log('小程序显示', options);
    // 处理场景值
    this.handleScene(options.scene);
  },

  // 小程序隐藏时触发
  onHide() {
    console.log('小程序隐藏');
    // 保存当前状态
    this.saveAppState();
  },

  // 小程序错误时触发
  onError(error) {
    console.error('小程序错误:', error);
    // 错误上报
    this.reportError(error);
  },

  // 全局数据
  globalData: {
    userInfo: null, // 用户信息
    settings: { // 用户设置
      reminderTime: '14:30', // 默认提醒时间
      relaxDuration: 5, // 默认放松时长（分钟）
      languagePreference: 'mixed', // 语言偏好：cantonese, english, mixed
      notificationEnabled: true, // 通知开关
      theme: 'light' // 主题：light, dark
    },
    learningProgress: { // 学习进度
      totalLearned: 0,
      cantoneseCount: 0,
      englishCount: 0,
      lastLearnedDate: null
    },
    aiContext: { // AI对话上下文
      recentMessages: [],
      lastInteraction: null,
      emotionState: 'neutral'
    },
    currentState: { // 当前状态
      isRelaxing: false,
      relaxStartTime: null,
      currentActivity: null // 'chat' 或 'learning'
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');

    if (token && userInfo) {
      this.globalData.userInfo = userInfo;
      console.log('用户已登录:', userInfo);
    } else {
      console.log('用户未登录，需要引导登录');
    }
  },

  // 初始化用户设置
  initUserSettings() {
    const savedSettings = wx.getStorageSync('userSettings');
    if (savedSettings) {
      this.globalData.settings = {
        ...this.globalData.settings,
        ...savedSettings
      };
      console.log('加载用户设置:', this.globalData.settings);
    }

    // 设置提醒
    this.setupReminders();
  },

  // 设置提醒
  setupReminders() {
    const { settings } = this.globalData;

    if (settings.notificationEnabled) {
      // 设置定时提醒
      this.scheduleReminder(settings.reminderTime);

      console.log(`已设置提醒: ${settings.reminderTime}, 放松时长: ${settings.relaxDuration}分钟`);
    } else {
      console.log('提醒功能已禁用');
    }
  },

  // 安排提醒
  scheduleReminder(time) {
    // 实际实现需要使用微信的定时提醒API
    // 这里只是示例
    console.log(`安排提醒在 ${time}`);

    // 示例：每分钟检查一次是否到达提醒时间
    setInterval(() => {
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                          now.getMinutes().toString().padStart(2, '0');

      if (currentTime === time && !this.globalData.currentState.isRelaxing) {
        this.triggerReminder();
      }
    }, 60000); // 每分钟检查一次
  },

  // 触发提醒
  triggerReminder() {
    console.log('触发放马提醒');

    // 显示通知
    wx.showToast({
      title: '🐴 该放马休息一下了~',
      icon: 'none',
      duration: 3000
    });

    // 震动提醒
    wx.vibrateShort();

    // 记录提醒时间
    this.globalData.lastReminderTime = new Date();
  },

  // 初始化AI服务
  initAIService() {
    console.log('初始化AI服务');
    // 加载AI配置
    const aiConfig = wx.getStorageSync('aiConfig') || {
      apiKey: '',
      model: 'claude-3-haiku',
      temperature: 0.7,
      maxTokens: 500
    };

    this.globalData.aiConfig = aiConfig;
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      console.log('检查更新结果:', res.hasUpdate);
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });

    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      });
    });
  },

  // 初始化性能监控
  initPerformanceMonitor() {
    // 监控小程序性能
    const performance = wx.getPerformance();
    const observer = performance.createObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) {
          console.warn('性能警告:', entry.name, '耗时', entry.duration, 'ms');
        }
      });
    });

    observer.observe({ entryTypes: ['render', 'script'] });
  },

  // 处理场景值
  handleScene(scene) {
    console.log('场景值:', scene);
    // 根据场景值处理不同的入口
    switch (scene) {
      case 1001: // 发现栏小程序主入口
        break;
      case 1011: // 扫描二维码
        break;
      default:
        break;
    }
  },

  // 保存应用状态
  saveAppState() {
    try {
      wx.setStorageSync('appState', {
        currentState: this.globalData.currentState,
        learningProgress: this.globalData.learningProgress,
        aiContext: this.globalData.aiContext
      });
      console.log('应用状态已保存');
    } catch (error) {
      console.error('保存应用状态失败:', error);
    }
  },

  // 错误上报
  reportError(error) {
    // 实际实现应该上报到错误监控平台
    console.error('错误上报:', error);

    const errorInfo = {
      time: new Date().toISOString(),
      error: error.message || error,
      stack: error.stack,
      userInfo: this.globalData.userInfo,
      version: '1.0.0'
    };

    // 保存到本地
    try {
      const errors = wx.getStorageSync('errorLogs') || [];
      errors.push(errorInfo);
      wx.setStorageSync('errorLogs', errors.slice(-50)); // 保留最近50条
    } catch (e) {
      console.error('保存错误日志失败:', e);
    }
  },

  // 用户登录
  login(callback) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送code到后端换取token
          this.requestToken(res.code, callback);
        } else {
          console.error('登录失败:', res.errMsg);
          callback && callback(false, '登录失败');
        }
      },
      fail: (err) => {
        console.error('登录接口调用失败:', err);
        callback && callback(false, err.errMsg);
      }
    });
  },

  // 请求token
  requestToken(code, callback) {
    // 实际实现应该调用后端API
    console.log('请求token，code:', code);

    // 模拟请求
    setTimeout(() => {
      const mockToken = 'mock_token_' + Date.now();
      const mockUserInfo = {
        nickname: '放马用户',
        avatar: 'https://example.com/avatar.jpg',
        userId: 'user_' + Date.now()
      };

      // 保存token和用户信息
      wx.setStorageSync('token', mockToken);
      wx.setStorageSync('userInfo', mockUserInfo);

      this.globalData.userInfo = mockUserInfo;

      callback && callback(true, { token: mockToken, userInfo: mockUserInfo });
    }, 500);
  },

  // 获取用户信息
  getUserInfo(callback) {
    if (this.globalData.userInfo) {
      callback && callback(this.globalData.userInfo);
      return;
    }

    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        this.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        callback && callback(userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
        callback && callback(null, err);
      }
    });
  },

  // 更新用户设置
  updateSettings(newSettings, callback) {
    this.globalData.settings = {
      ...this.globalData.settings,
      ...newSettings
    };

    // 保存到本地存储
    wx.setStorageSync('userSettings', this.globalData.settings);

    // 重新设置提醒
    this.setupReminders();

    console.log('用户设置已更新:', this.globalData.settings);
    callback && callback(true, this.globalData.settings);
  },

  // 开始放松
  startRelax(activityType) {
    this.globalData.currentState = {
      isRelaxing: true,
      relaxStartTime: new Date(),
      currentActivity: activityType
    };

    console.log(`开始${activityType}放松`);
    return this.globalData.currentState;
  },

  // 结束放松
  endRelax() {
    const { currentState } = this.globalData;

    if (currentState.isRelaxing) {
      const endTime = new Date();
      const duration = Math.round((endTime - currentState.relaxStartTime) / 1000 / 60); // 分钟

      this.globalData.currentState = {
        isRelaxing: false,
        relaxStartTime: null,
        currentActivity: null
      };

      console.log(`放松结束，时长: ${duration}分钟`);
      return { duration, activity: currentState.currentActivity };
    }

    return null;
  },

  // 记录学习进度
  recordLearning(language, content) {
    this.globalData.learningProgress.totalLearned++;

    if (language === 'cantonese') {
      this.globalData.learningProgress.cantoneseCount++;
    } else if (language === 'english') {
      this.globalData.learningProgress.englishCount++;
    }

    this.globalData.learningProgress.lastLearnedDate = new Date();

    // 保存到本地存储
    wx.setStorageSync('learningProgress', this.globalData.learningProgress);

    console.log(`学习记录: ${language} - ${content}`);
    return this.globalData.learningProgress;
  },

  // 获取今日学习内容
  getTodayLearning() {
    // 实际实现应该从后端获取或本地生成
    const today = new Date().toDateString();
    const lastLearned = this.globalData.learningProgress.lastLearnedDate;

    if (lastLearned && new Date(lastLearned).toDateString() === today) {
      return null; // 今天已经学习过了
    }

    // 模拟学习内容
    const languages = ['cantonese', 'english'];
    const language = this.globalData.settings.languagePreference === 'mixed'
      ? languages[Math.floor(Math.random() * languages.length)]
      : this.globalData.settings.languagePreference;

    const content = language === 'cantonese'
      ? { phrase: "饮茶", meaning: "喝茶", example: "得闲一起饮茶" }
      : { phrase: "Break a leg", meaning: "祝你好运", example: "Good luck on your performance, break a leg!" };

    return { language, ...content };
  }
});