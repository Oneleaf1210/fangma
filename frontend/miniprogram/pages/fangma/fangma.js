// pages/fangma/fangma.js - 放马页面（主页面）

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面状态
    isRelaxing: false,
    relaxTimeLeft: 300, // 剩余放松时间（秒）
    timer: null,

    // 活动选项
    activities: [
      {
        id: 'chat',
        title: '🤖 AI情绪陪伴',
        description: '与AI聊天，倾诉压力，获得支持',
        icon: '/assets/icons/chat.png',
        color: '#64b5f6'
      },
      {
        id: 'learning',
        title: '📚 趣味学习',
        description: '学习有趣的粤语/英语俚语',
        icon: '/assets/icons/learning.png',
        color: '#4caf50'
      },
      {
        id: 'breathe',
        title: '🌬️ 呼吸练习',
        description: '3分钟引导式呼吸放松',
        icon: '/assets/icons/breathe.png',
        color: '#ff9800'
      }
    ],

    // 今日状态
    todayStats: {
      relaxCount: 0,
      totalDuration: 0,
      lastRelaxTime: null
    },

    // 提示信息
    tips: [
      '深呼吸，感受此刻的平静',
      '工作再忙，也要记得放马休息',
      '短暂的停顿是为了更好的前行',
      '给自己一个温柔的暂停时刻'
    ],
    currentTipIndex: 0,

    // 马匹动画状态
    horseAnimation: 'idle',

    // 天气/时间信息
    currentTime: '',
    greeting: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('放马页面加载', options);

    // 加载今日状态
    this.loadTodayStats();

    // 设置初始提示
    this.rotateTips();

    // 更新时间
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // 每分钟更新一次

    // 设置问候语
    this.setGreeting();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('放马页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('放马页面显示');

    // 检查是否在放松中
    const { currentState } = app.globalData;
    if (currentState.isRelaxing) {
      this.startRelaxTimer(currentState.relaxStartTime, currentState.currentActivity);
    }

    // 刷新今日状态
    this.loadTodayStats();

    // 开始提示轮换
    this.startTipRotation();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('放马页面隐藏');

    // 停止提示轮换
    this.stopTipRotation();

    // 停止计时器
    this.stopRelaxTimer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('放马页面卸载');
    this.stopTipRotation();
    this.stopRelaxTimer();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新');

    // 刷新数据
    this.loadTodayStats();
    this.rotateTips();
    this.updateTime();

    // 停止下拉刷新
    wx.stopPullDownRefresh();

    // 显示提示
    wx.showToast({
      title: '已刷新',
      icon: 'success'
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我正在放马休息，你要一起来吗？',
      path: '/pages/fangma/fangma',
      imageUrl: '/assets/images/share-fangma.jpg'
    };
  },

  /**
   * 加载今日状态
   */
  loadTodayStats() {
    const today = new Date().toDateString();
    const stats = wx.getStorageSync('todayStats') || {
      date: today,
      relaxCount: 0,
      totalDuration: 0,
      lastRelaxTime: null
    };

    // 如果是新的一天，重置状态
    if (stats.date !== today) {
      stats.date = today;
      stats.relaxCount = 0;
      stats.totalDuration = 0;
      stats.lastRelaxTime = null;
    }

    this.setData({
      todayStats: stats
    });

    // 保存到本地
    wx.setStorageSync('todayStats', stats);
  },

  /**
   * 轮换提示信息
   */
  rotateTips() {
    const { tips, currentTipIndex } = this.data;
    const nextIndex = (currentTipIndex + 1) % tips.length;

    this.setData({
      currentTipIndex: nextIndex
    });
  },

  /**
   * 开始提示轮换
   */
  startTipRotation() {
    this.tipInterval = setInterval(() => {
      this.rotateTips();
    }, 10000); // 每10秒轮换一次
  },

  /**
   * 停止提示轮换
   */
  stopTipRotation() {
    if (this.tipInterval) {
      clearInterval(this.tipInterval);
      this.tipInterval = null;
    }
  },

  /**
   * 更新时间
   */
  updateTime() {
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' +
                      now.getMinutes().toString().padStart(2, '0');

    this.setData({
      currentTime: timeString
    });
  },

  /**
   * 设置问候语
   */
  setGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 6) {
      greeting = '深夜好，还在工作吗？';
    } else if (hour < 12) {
      greeting = '早上好，开始美好的一天';
    } else if (hour < 14) {
      greeting = '中午好，午休时间到';
    } else if (hour < 18) {
      greeting = '下午好，继续加油';
    } else if (hour < 22) {
      greeting = '晚上好，放松一下';
    } else {
      greeting = '夜深了，该休息了';
    }

    this.setData({
      greeting: greeting
    });
  },

  /**
   * 开始放松
   */
  startRelax(activityId) {
    if (this.data.isRelaxing) {
      wx.showToast({
        title: '已经在放松中',
        icon: 'none'
      });
      return;
    }

    // 调用全局开始放松
    const relaxState = app.startRelax(activityId);

    // 计算放松结束时间
    const { settings } = app.globalData;
    const relaxDuration = settings.relaxDuration * 60; // 转换为秒

    // 开始计时器
    this.startRelaxTimer(new Date(), activityId);

    // 更新页面状态
    this.setData({
      isRelaxing: true,
      relaxTimeLeft: relaxDuration,
      selectedActivity: activityId
    });

    // 马匹动画
    this.startHorseAnimation('running');

    // 记录开始时间
    this.relaxStartTime = new Date();

    console.log(`开始${activityId}放松，时长: ${settings.relaxDuration}分钟`);

    // 显示提示
    wx.showToast({
      title: '放松开始，享受这一刻~',
      icon: 'success'
    });
  },

  /**
   * 开始放松计时器
   */
  startRelaxTimer(startTime, activityId) {
    const { settings } = app.globalData;
    const totalDuration = settings.relaxDuration * 60; // 转换为秒

    // 计算已过去的时间
    const now = new Date();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const timeLeft = Math.max(0, totalDuration - elapsedSeconds);

    this.setData({
      isRelaxing: true,
      relaxTimeLeft: timeLeft,
      selectedActivity: activityId
    });

    // 启动计时器
    this.stopRelaxTimer();
    this.relaxTimer = setInterval(() => {
      let { relaxTimeLeft } = this.data;

      if (relaxTimeLeft <= 0) {
        this.endRelax();
        return;
      }

      relaxTimeLeft--;

      this.setData({
        relaxTimeLeft: relaxTimeLeft
      });

      // 最后30秒提示
      if (relaxTimeLeft === 30) {
        wx.showToast({
          title: '还剩30秒',
          icon: 'none'
        });

        // 震动提示
        wx.vibrateShort();
      }

      // 最后10秒提示
      if (relaxTimeLeft === 10) {
        wx.showToast({
          title: '还剩10秒',
          icon: 'none'
        });

        // 震动提示
        wx.vibrateShort();
      }
    }, 1000);
  },

  /**
   * 停止放松计时器
   */
  stopRelaxTimer() {
    if (this.relaxTimer) {
      clearInterval(this.relaxTimer);
      this.relaxTimer = null;
    }
  },

  /**
   * 结束放松
   */
  endRelax() {
    if (!this.data.isRelaxing) {
      return;
    }

    // 调用全局结束放松
    const relaxResult = app.endRelax();

    // 停止计时器
    this.stopRelaxTimer();

    // 更新今日状态
    this.updateTodayStats(relaxResult);

    // 更新页面状态
    this.setData({
      isRelaxing: false,
      relaxTimeLeft: 300,
      selectedActivity: null
    });

    // 马匹动画
    this.startHorseAnimation('resting');

    console.log('放松结束', relaxResult);

    // 显示结束提示
    wx.showToast({
      title: '放松完成，感觉好点了吗？',
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转到策马页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/cema/cema?duration=' + (relaxResult?.duration || 0)
      });
    }, 2000);
  },

  /**
   * 更新今日状态
   */
  updateTodayStats(relaxResult) {
    const { todayStats } = this.data;

    todayStats.relaxCount++;
    todayStats.totalDuration += relaxResult?.duration || 0;
    todayStats.lastRelaxTime = new Date();

    this.setData({
      todayStats: todayStats
    });

    // 保存到本地
    wx.setStorageSync('todayStats', todayStats);

    // 更新全局学习进度（如果是学习活动）
    if (relaxResult?.activity === 'learning') {
      // 记录学习
      const learningContent = app.getTodayLearning();
      if (learningContent) {
        app.recordLearning(learningContent.language, learningContent.phrase);
      }
    }
  },

  /**
   * 开始马匹动画
   */
  startHorseAnimation(state) {
    this.setData({
      horseAnimation: state
    });

    // 动画结束后恢复空闲状态
    if (state !== 'idle') {
      setTimeout(() => {
        this.setData({
          horseAnimation: 'idle'
        });
      }, 2000);
    }
  },

  /**
   * 活动选择事件
   */
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id;

    // 如果已经在放松中，询问是否切换
    if (this.data.isRelaxing) {
      wx.showModal({
        title: '切换活动',
        content: '当前正在放松中，确定要切换活动吗？',
        success: (res) => {
          if (res.confirm) {
            // 结束当前放松
            this.endRelax();

            // 延迟开始新活动
            setTimeout(() => {
              this.startRelax(activityId);
            }, 500);
          }
        }
      });
    } else {
      this.startRelax(activityId);
    }
  },

  /**
   * 手动结束放松
   */
  onEndRelaxTap() {
    if (!this.data.isRelaxing) {
      return;
    }

    wx.showModal({
      title: '结束放松',
      content: '确定要提前结束放松吗？',
      success: (res) => {
        if (res.confirm) {
          this.endRelax();
        }
      }
    });
  },

  /**
   * 查看今日统计
   */
  onViewStatsTap() {
    wx.showModal({
      title: '今日放松统计',
      content: `放松次数: ${this.data.todayStats.relaxCount}次\n总时长: ${this.data.todayStats.totalDuration}分钟\n上次放松: ${this.data.todayStats.lastRelaxTime ? '今天' : '暂无'}`,
      showCancel: false,
      confirmText: '好的'
    });
  },

  /**
   * 跳转到设置页面
   */
  onSettingsTap() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * 跳转到学习页面
   */
  onLearningTap() {
    wx.navigateTo({
      url: '/pages/learning/learning'
    });
  },

  /**
   * 跳转到聊天页面
   */
  onChatTap() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  /**
   * 格式化时间显示
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
});