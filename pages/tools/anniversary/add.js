// pages/tools/anniversary/add.js
const dateUtils = require('../../../utils/dateUtils');

// 纪念日类型配置
const TYPE_CONFIG = {
  birthday: { name: '生日', theme: 'primary' },
  anniversary: { name: '恋爱纪念日', theme: 'danger' },
  payment: { name: '还款日', theme: 'warning' },
  holiday: { name: '节日', theme: 'success' },
  custom: { name: '自定义', theme: 'default' }
};

// 提醒频率选项
const REMIND_OPTIONS = [
  { value: 7, label: '提前7天' },
  { value: 3, label: '提前3天' },
  { value: 1, label: '提前1天' },
  { value: 0, label: '当天提醒' }
];

// 获取云数据库引用
const db = wx.cloud.database();

Page({
  data: {
    isEdit: false,
    editId: null,
    cloudId: null, // 云数据库记录ID
    formData: {
      name: '',
      date: '',
      type: 'birthday',
      typeName: '生日',
      note: '',
      remindDays: [7, 3, 1] // 默认提醒频率
    },
    nameError: false,
    typePickerVisible: false,
    typeIndex: 0,
    typeOptions: [],
    remindOptions: REMIND_OPTIONS,
    // 预计算的选中状态
    remindSelected: {
      7: true,
      3: true,
      1: true,
      0: false
    },
    saving: false,
    minDate: '1900-01-01'
  },

  onLoad(options) {
    // 生成类型选项
    const typeOptions = Object.keys(TYPE_CONFIG).map((key, index) => ({
      label: TYPE_CONFIG[key].name,
      value: key
    }));
    
    this.setData({
      typeOptions: typeOptions,
      minDate: dateUtils.formatDate(new Date('1900-01-01'))
    });

    // 如果是编辑模式
    if (options.id) {
      this.setData({
        isEdit: true,
        editId: options.id
      });
      this.loadAnniversaryData(options.id);
    }
  },

  /**
   * 加载要编辑的纪念日数据
   */
  async loadAnniversaryData(id) {
    try {
      // 优先从云端加载
      let item = null;
      try {
        const res = await db.collection('anniversary').doc(id).get();
        if (res.data) {
          item = res.data;
          this.setData({ cloudId: id });
        }
      } catch (cloudErr) {
        console.log('云端加载失败，尝试本地:', cloudErr);
      }

      // 云端没有则从本地加载
      if (!item) {
        const list = wx.getStorageSync('anniversaryList') || [];
        item = list.find(i => i.id === id || i._id === id);
      }
      
      if (item) {
        // 找到对应的类型索引
        const typeKeys = Object.keys(TYPE_CONFIG);
        const typeIndex = typeKeys.indexOf(item.type);
        
        // 计算选中状态
        const remindDays = item.remindDays || [7, 3, 1];
        const remindSelected = {
          7: remindDays.includes(7),
          3: remindDays.includes(3),
          1: remindDays.includes(1),
          0: remindDays.includes(0)
        };
        
        this.setData({
          formData: {
            name: item.name,
            date: item.date,
            type: item.type,
            note: item.note || '',
            typeName: TYPE_CONFIG[item.type] ? TYPE_CONFIG[item.type].name : '自定义',
            remindDays: remindDays
          },
          typeIndex: typeIndex >= 0 ? typeIndex : 0,
          remindSelected: remindSelected
        });
      } else {
        wx.showToast({
          title: '纪念日不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 名称输入
   */
  onNameChange(e) {
    const name = e.detail.value.trim();
    this.setData({
      'formData.name': name,
      nameError: !name
    });
  },

  /**
   * 日期改变
   */
  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      'formData.date': date
    });
  },

  /**
   * 类型选择器点击
   */
  onTypePickerClick() {
    this.setData({
      typePickerVisible: true
    });
  },

  /**
   * 类型改变
   */
  onTypeChange(e) {
    const selectedValue = e.detail.value[0]; // 这是选项的 value 值，如 'birthday'
    const typeConfig = TYPE_CONFIG[selectedValue];
    
    // 找到对应的索引
    const typeKeys = Object.keys(TYPE_CONFIG);
    const typeIndex = typeKeys.indexOf(selectedValue);
    
    this.setData({
      typeIndex: typeIndex >= 0 ? typeIndex : 0,
      'formData.type': selectedValue,
      'formData.typeName': typeConfig ? typeConfig.name : '自定义',
      typePickerVisible: false
    });
  },

  /**
   * 类型选择器取消
   */
  onTypePickerCancel() {
    this.setData({
      typePickerVisible: false
    });
  },

  /**
   * 备注输入
   */
  onNoteChange(e) {
    this.setData({
      'formData.note': e.detail.value
    });
  },

  /**
   * 提醒频率切换
   */
  onRemindToggle(e) {
    const value = parseInt(e.currentTarget.dataset.value);
    const remindDays = [...this.data.formData.remindDays];
    const remindSelected = { ...this.data.remindSelected };
    const index = remindDays.indexOf(value);
    
    if (index > -1) {
      // 已选中，取消选择
      remindDays.splice(index, 1);
      remindSelected[value] = false;
    } else {
      // 未选中，添加选择
      remindDays.push(value);
      remindSelected[value] = true;
    }
    
    // 排序，保持顺序一致
    remindDays.sort((a, b) => b - a);
    
    this.setData({
      'formData.remindDays': remindDays,
      remindSelected: remindSelected
    });
  },

  /**
   * 保存
   */
  async onSave() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    this.setData({ saving: true });

    try {
      const formData = this.data.formData;
      const now = Date.now();

      // 构建数据对象
      const anniversaryData = {
        name: formData.name,
        date: formData.date,
        type: formData.type,
        note: formData.note,
        remindDays: formData.remindDays,
        notified: {}, // 已发送记录
        updatedAt: now
      };

      let cloudId = this.data.cloudId;

      if (this.data.isEdit && cloudId) {
        // 编辑模式：更新云数据库
        await db.collection('anniversary').doc(cloudId).update({
          data: anniversaryData
        });
      } else {
        // 添加模式：新增到云数据库
        anniversaryData.createdAt = now;
        const addRes = await db.collection('anniversary').add({
          data: anniversaryData
        });
        cloudId = addRes._id;
      }

      // 同步到本地存储
      const localData = {
        ...anniversaryData,
        _id: cloudId,
        id: cloudId // 兼容旧字段
      };
      
      const list = wx.getStorageSync('anniversaryList') || [];
      const existingIndex = list.findIndex(item => item._id === cloudId || item.id === cloudId);
      
      if (existingIndex !== -1) {
        list[existingIndex] = localData;
      } else {
        list.push(localData);
      }
      
      wx.setStorageSync('anniversaryList', list);

      // 请求订阅消息授权
      this.requestSubscribeAuth();

      wx.showToast({
        title: this.data.isEdit ? '保存成功' : '添加成功',
        icon: 'success'
      });

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败: ' + (error.message || '未知错误'),
        icon: 'none',
        duration: 3000
      });
    } finally {
      this.setData({ saving: false });
    }
  },

  /**
   * 请求订阅消息授权
   */
  requestSubscribeAuth() {
    wx.requestSubscribeMessage({
      tmplIds: ['_sxu2b5a-gmqPcBSbtJVn3sdJy7r70qkkaKEynCQVxY'],
      success: (res) => {
        console.log('订阅授权结果:', res);
      },
      fail: (err) => {
        console.log('订阅授权失败:', err);
      }
    });
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { name, date, type } = this.data.formData;

    if (!name || !name.trim()) {
      this.setData({ nameError: true });
      wx.showToast({
        title: '请输入纪念日名称',
        icon: 'none'
      });
      return false;
    }

    if (!date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return false;
    }

    if (!type) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none'
      });
      return false;
    }

    return true;
  }
});
