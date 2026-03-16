// pages/guide/guide.js - 引导页面

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentStep: 0, // 当前步骤
    totalSteps: 4, // 总步骤数
    steps: [
      {
        title: '🐴 欢迎来到放马',
        description: '通过马匹管理隐喻，帮助你在忙碌生活中找到平衡',
        image: '/assets/images/guide1.png',
        buttonText: '下一步'
      },
      {
        title: '放马 - 暂停休息',
        description: '工作间隙给自己放松时刻，缓解压力，恢复精力',
        image: '/assets/images/guide2.png',
        buttonText: '下一步'
      },
      {
        title: '策马 - 回归动力',
        description: '放松结束后，正能量鼓励你重新出发',
        image: '/assets/images/guide3.png',
        buttonText: '下一步'
      },
      {
        title: '驭马 - 自我管理',
        description: '个性化设置提醒时间和学习偏好',
        image: '/assets/images/guide4.png',
        buttonText: '开始放马'
      }
    ],
    showSkip: true, // 是否显示跳过按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('引导页面加载', options);

    // 检查是否是第一次使用
    const isFirstTime = wx.getStorageSync('isFirstTime') !== false;
    if (!isFirstTime) {
      // 不是第一次使用，直接跳转到主页面
      wx.switchTab({
        url: '/pages/fangma/fangma'
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('引导页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('引导页面显示');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('引导页面隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('引导页面卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('下拉刷新');
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '放自己一马 - 找到生活平衡',
      path: '/pages/guide/guide'
    };
  },

  /**
   * 下一步按钮点击事件
   */
  onNextTap() {
    const { currentStep, totalSteps } = this.data;

    if (currentStep < totalSteps - 1) {
      // 切换到下一步
      this.setData({
        currentStep: currentStep + 1
      });
    } else {
      // 完成引导，跳转到主页面
      this.completeGuide();
    }
  },

  /**
   * 上一步按钮点击事件
   */
  onPrevTap() {
    const { currentStep } = this.data;

    if (currentStep > 0) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  /**
   * 跳过引导
   */
  onSkipTap() {
    wx.showModal({
      title: '跳过引导',
      content: '确定要跳过引导吗？建议首次使用完整查看引导。',
      success: (res) => {
        if (res.confirm) {
          this.completeGuide();
        }
      }
    });
  },

  /**
   * 完成引导
   */
  completeGuide() {
    // 标记已不是第一次使用
    wx.setStorageSync('isFirstTime', false);

    // 跳转到放马页面
    wx.switchTab({
      url: '/pages/fangma/fangma',
      success: () => {
        console.log('跳转到放马页面成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.navigateTo({
          url: '/pages/fangma/fangma'
        });
      }
    });
  },

  /**
   * 处理滑动切换
   */
  onSwiperChange(e) {
    const current = e.detail.current;
    this.setData({
      currentStep: current
    });
  },

  /**
   * 进度改变事件
   */
  onProgressChange(e) {
    const value = e.detail.value;
    this.setData({
      currentStep: Math.round(value * (this.data.totalSteps - 1))
    });
  }
});