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

Page({
  data: {
    isEdit: false,
    editId: null,
    formData: {
      name: '',
      date: '',
      type: 'birthday',
      typeName: '生日',
      note: ''
    },
    nameError: false,
    typePickerVisible: false,
    typeIndex: 0,
    typeOptions: [],
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
  loadAnniversaryData(id) {
    try {
      const list = wx.getStorageSync('anniversaryList') || [];
      const item = list.find(item => item.id === id);
      
      if (item) {
        // 找到对应的类型索引
        const typeKeys = Object.keys(TYPE_CONFIG);
        const typeIndex = typeKeys.indexOf(item.type);
        
        this.setData({
          formData: {
            name: item.name,
            date: item.date,
            type: item.type,
            note: item.note || '',
            typeName: TYPE_CONFIG[item.type] ? TYPE_CONFIG[item.type].name : '自定义'
          },
          typeIndex: typeIndex >= 0 ? typeIndex : 0
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
   * 保存
   */
  onSave() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    this.setData({ saving: true });

    try {
      const list = wx.getStorageSync('anniversaryList') || [];
      const formData = this.data.formData;

      if (this.data.isEdit) {
        // 编辑模式：更新现有项
        const index = list.findIndex(item => item.id === this.data.editId);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            name: formData.name,
            date: formData.date,
            type: formData.type,
            note: formData.note
          };
        }
      } else {
        // 添加模式：创建新项
        const newItem = {
          id: Date.now().toString(), // 使用时间戳作为ID
          name: formData.name,
          date: formData.date,
          type: formData.type,
          note: formData.note,
          createdAt: Date.now()
        };
        list.push(newItem);
      }

      // 保存到本地存储
      wx.setStorageSync('anniversaryList', list);

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
        title: '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ saving: false });
    }
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
