// pages/tools/anniversary/index.js
const dateUtils = require('../../../utils/dateUtils');

// 纪念日类型配置
const TYPE_CONFIG = {
  birthday: { name: '生日', theme: 'primary' },
  anniversary: { name: '恋爱纪念日', theme: 'danger' },
  payment: { name: '还款日', theme: 'warning' },
  holiday: { name: '节日', theme: 'success' },
  custom: { name: '自定义', theme: 'default' }
};

Page({
  data: {
    anniversaryList: [],
    showActionSheet: false,
    showDeleteDialog: false,
    currentItem: null, // 当前选中的纪念日
    showTestButton: true // 是否显示测试按钮（开发调试用）
  },

  onLoad() {
    this.loadAnniversaryList();
    this.checkAndSendNotification();
  },

  onShow() {
    // 每次显示页面时重新加载数据（可能从编辑页返回）
    this.loadAnniversaryList();
  },

  /**
   * 从本地存储加载纪念日列表
   */
  loadAnniversaryList() {
    try {
      const list = wx.getStorageSync('anniversaryList') || [];
      const processedList = this.processAnniversaryList(list);
      this.setData({
        anniversaryList: processedList
      });
    } catch (error) {
      console.error('加载纪念日列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 处理纪念日列表：计算天数、排序、格式化显示
   */
  processAnniversaryList(list) {
    const today = new Date();
    const processed = list.map(item => {
      const result = dateUtils.calculateDaysDifference(item.date, today);
      const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.custom;
      
      // 生成显示文本
      let daysText = '';
      if (result.isToday) {
        daysText = '今天';
      } else if (result.isPast) {
        daysText = `已过去 ${result.days} 天`;
      } else {
        daysText = `还有 ${result.days} 天`;
      }

      return {
        ...item,
        days: result.days,
        isPast: result.isPast,
        isToday: result.isToday,
        daysText: daysText,
        displayDate: dateUtils.getFriendlyDateText(item.date),
        typeName: typeConfig.name,
        typeTheme: typeConfig.theme
      };
    });

    // 按剩余天数排序：未过期的按天数升序，已过期的排在后面
    processed.sort((a, b) => {
      if (a.isPast && !b.isPast) return 1;
      if (!a.isPast && b.isPast) return -1;
      if (a.isPast && b.isPast) return b.days - a.days; // 已过期的按天数降序
      return a.days - b.days; // 未过期的按天数升序
    });

    return processed;
  },

  /**
   * 点击卡片
   */
  onCardTap(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      currentItem: item,
      showActionSheet: true
    });
  },

  /**
   * 操作菜单显示状态变化
   */
  onActionSheetChange(e) {
    this.setData({
      showActionSheet: e.detail.visible
    });
  },

  /**
   * 取消操作
   */
  onCancelAction() {
    this.setData({
      showActionSheet: false,
      currentItem: null
    });
  },

  /**
   * 点击编辑
   */
  onEditClick() {
    this.setData({
      showActionSheet: false
    });
    
    if (this.data.currentItem) {
      wx.navigateTo({
        url: `/pages/tools/anniversary/add?id=${this.data.currentItem.id}`
      });
    }
    
    this.setData({ currentItem: null });
  },

  /**
   * 点击删除
   */
  onDeleteClick() {
    this.setData({
      showActionSheet: false,
      showDeleteDialog: true
    });
  },

  /**
   * 确认删除
   */
  confirmDelete() {
    if (!this.data.currentItem) {
      this.setData({ showDeleteDialog: false });
      return;
    }

    try {
      const list = wx.getStorageSync('anniversaryList') || [];
      const newList = list.filter(item => item.id !== this.data.currentItem.id);
      wx.setStorageSync('anniversaryList', newList);
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });

      this.setData({
        showDeleteDialog: false,
        currentItem: null
      });

      // 重新加载列表
      this.loadAnniversaryList();
    } catch (error) {
      console.error('删除失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 取消删除
   */
  cancelDelete() {
    this.setData({
      showDeleteDialog: false,
      currentItem: null
    });
  },

  /**
   * 点击添加按钮
   */
  onAddClick() {
    wx.navigateTo({
      url: '/pages/tools/anniversary/add'
    });
  },

  /**
   * 检查并发送订阅消息通知
   */
  checkAndSendNotification() {
    // 请求订阅消息权限
    wx.requestSubscribeMessage({
      tmplIds: ['_sxu2b5a-gmqPcBSbtJVn3sdJy7r70qkkaKEynCQVxY'],
      success: (res) => {
        console.log('订阅消息授权结果:', res);
        // 检查需要发送通知的纪念日
        this.sendNotifications();
      },
      fail: (err) => {
        console.log('订阅消息授权失败:', err);
        // 即使授权失败，也检查通知（用户可能之前已授权）
        this.sendNotifications();
      }
    });
  },

  /**
   * 发送通知
   */
  sendNotifications() {
    try {
      const list = wx.getStorageSync('anniversaryList') || [];
      const today = new Date();
      
      list.forEach(item => {
        const result = dateUtils.calculateDaysDifference(item.date, today);
        
        // 如果剩余天数为 1、3、7 天，发送通知
        if (!result.isPast && (result.days === 1 || result.days === 3 || result.days === 7)) {
          this.sendNotificationMessage(item, result.days);
        }
      });
    } catch (error) {
      console.error('检查通知失败:', error);
    }
  },

  /**
   * 测试推送消息（开发调试用）
   */
  testNotification() {
    wx.showModal({
      title: '测试推送',
      content: '将发送一条测试推送消息，请确保已配置云开发',
      success: (res) => {
        if (res.confirm) {
          // 创建一个测试纪念日
          const testItem = {
            id: 'test_' + Date.now(),
            name: '测试纪念日',
            date: dateUtils.formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // 明天
            type: 'custom',
            note: '测试用'
          };
          
          // 请求订阅消息权限
          wx.requestSubscribeMessage({
            tmplIds: ['_sxu2b5a-gmqPcBSbtJVn3sdJy7r70qkkaKEynCQVxY'],
            success: (res) => {
              console.log('订阅消息授权结果:', res);
              // 直接调用推送方法
              this.sendNotificationMessage(testItem, 1);
              wx.showToast({
                title: '测试推送已发送',
                icon: 'success'
              });
            },
            fail: (err) => {
              console.error('订阅消息授权失败:', err);
              wx.showToast({
                title: '授权失败，请重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 发送订阅消息
   */
  sendNotificationMessage(item, daysLeft) {
    // 检查是否已发送过通知（避免重复发送）
    const notificationKey = `notification_${item.id}_${daysLeft}`;
    const lastNotification = wx.getStorageSync(notificationKey);
    const today = dateUtils.formatDate(new Date());
    
    if (lastNotification === today) {
      // 今天已发送过，不再发送
      return;
    }

    // 检查是否已初始化云开发
    if (typeof wx.cloud === 'undefined') {
      console.log('云开发未初始化，跳过订阅消息发送');
      return;
    }

    // 调用云函数发送订阅消息
    wx.cloud.callFunction({
      name: 'sendAnniversaryMsg',
      data: {
        templateId: '_sxu2b5a-gmqPcBSbtJVn3sdJy7r70qkkaKEynCQVxY',
        data: {
          thing1: { value: item.name },
          time2: { value: item.date },
          thing3: { value: `提前${daysLeft}天提醒` },
          thing4: { value: item.notes || '请记得这个重要日子' }
        }
      },
      success: (res) => {
        console.log('云函数调用成功，返回结果:', res);
        if (res.result && res.result.success) {
          console.log('订阅消息发送成功:', res.result);
          wx.showToast({
            title: '推送发送成功',
            icon: 'success'
          });
          // 记录已发送
          wx.setStorageSync(notificationKey, today);
        } else {
          console.error('订阅消息发送失败:', res.result);
          const errorMsg = res.result.error || res.result.errorCode || '发送失败';
          const errorDetail = res.result.errorDetail;
          
          // 显示详细错误信息
          let displayMsg = errorMsg;
          if (errorDetail && errorDetail.errCode) {
            displayMsg = `${errorMsg} (错误码: ${errorDetail.errCode})`;
          }
          
          wx.showModal({
            title: '推送失败',
            content: displayMsg + '\n\n请查看控制台获取详细错误信息',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      },
      fail: (err) => {
        console.error('云函数调用失败:', err);
        wx.showToast({
          title: '调用失败: ' + (err.errMsg || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    });
  }
});
