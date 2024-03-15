Component({
  data: {
    value: 'p_tax',
    list: [
      { value: 'p_tax', label: '个税' },
      { value: 'y_tax', label: '年终奖' },
      { value: 'exchange', label: '实时汇率' },
      // { value: 'user', label: '我的' },
    ],
  },

  methods: {
    onChange(e) {
      this.setData({
        value: e.detail.value,
      });
      this.triggerEvent("page_change", {'value': this.data.list.findIndex(function(element) {
        // 返回 true 表示找到满足条件的元素
        return element.value == e.detail.value;
      })});
    },
  },
});
