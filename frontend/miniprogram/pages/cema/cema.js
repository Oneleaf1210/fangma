// pages/cema/cema.js - 策马页面（回归工作）

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面状态
    duration: 0, // 放松时长（分钟）
    encouragement: '',
    suggestions: [],
    showConfetti: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('策马页面加载', options);

    // 获取放松时长
    const duration = options.duration || 5;
    this.setData({
      duration: parseInt(duration)
    });

    // 生成鼓励语和建议
    this.generateContent();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('策马页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('策马页面显示');
    // 显示庆祝效果
    this.showCelebration();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '刚刚完成放松，准备策马前行！',
      path: '/pages/cema/cema'
    };
  },

  /**
   * 生成鼓励内容
   */
  generateContent() {
    const encouragements = [
      '休息是为了走更远的路，现在策马前行吧！',
      '短暂的放松让你充满能量，继续前进！',
      '你已经给自己充好电，现在是出发的时候了',
      '马儿休息好了，该策马奔腾了！',
      '放松结束，带着好心情继续努力'
    ];

    const suggestions = [
      '先完成最重要的任务',
      '设定一个45分钟的工作时段',
      '喝杯水，调整坐姿',
      '列出接下来要做的3件事',
      '给接下来的工作设定一个小目标'
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    const randomSuggestions = suggestions.slice(0, 3); // 取前3个建议

    this.setData({
      encouragement: randomEncouragement,
      suggestions: randomSuggestions.map((text, index) => ({
        id: index,
        text: text,
        completed: false
      }))
    });
  },

  /**
   * 显示庆祝效果
   */
  showCelebration() {
    this.setData({
      showConfetti: true
    });

    // 3秒后隐藏
    setTimeout(() => {
      this.setData({
        showConfetti: false
      });
    }, 3000);

    // 震动反馈
    wx.vibrateShort();
  },

  /**
   * 标记建议为完成
   */
  onSuggestionTap(e) {
    const index = e.currentTarget.dataset.index;
    const { suggestions } = this.data;

    suggestions[index].completed = !suggestions[index].completed;

    this.setData({
      suggestions: suggestions
    });

    // 震动反馈
    wx.vibrateShort();
  },

  /**
   * 返回放马页面
   */
  onReturnTap() {
    wx.switchTab({
      url: '/pages/fangma/fangma'
    });
  },

  /**
   * 设置工作定时器
   */
  onSetTimerTap() {
    wx.showActionSheet({
      itemList: ['25分钟', '45分钟', '60分钟', '90分钟'],
      success: (res) => {
        const durations = [25, 45, 60, 90];
        const selectedDuration = durations[res.tapIndex];

        wx.showToast({
          title: `设置了${selectedDuration}分钟工作定时`,
          icon: 'success'
        });

        // 实际实现应该设置定时器
        console.log(`设置工作定时: ${selectedDuration}分钟`);
      }
    });
  },

  /**
   * 查看今日目标
   */
  onViewGoalsTap() {
    wx.navigateTo({
      url: '/pages/settings/settings?tab=goals'
    });
  }
});