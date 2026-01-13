Component({
  data: {
    dateVisible: false,
    dateText: '请选择币种',
    dateValue: ['CNY', 'USD'],
    code: [
      { "label": "人民币 (CNY)", "value": "CNY" },
      { "label": "美元 (USD)", "value": "USD" },
      { "label": "日元 (JPY)", "value": "JPY" },
      { "label": "欧元 (EUR)", "value": "EUR" },
      { "label": "英镑 (GBP)", "value": "GBP" },
      { "label": "韩元 (KRW)", "value": "KRW" },
      { "label": "港币 (HKD)", "value": "HKD" },
      { "label": "澳大利亚元 (AUD)", "value": "AUD" },
      { "label": "加拿大元 (CAD)", "value": "CAD" },
      { "label": "新加坡元 (SGD)", "value": "SGD" },
      { "label": "新台币 (TWD)", "value": "TWD" },
      { "label": "泰国铢 (THB)", "value": "THB" },
      { "label": "瑞士法郎 (CHF)", "value": "CHF" },
      { "label": "俄罗斯卢布 (RUB)", "value": "RUB" },
      { "label": "印度卢比 (INR)", "value": "INR" },
      { "label": "越南盾 (VND)", "value": "VND" },
      { "label": "马来西亚林吉特 (MYR)", "value": "MYR" },
      { "label": "菲律宾比索 (PHP)", "value": "PHP" },
      { "label": "印尼盾 (IDR)", "value": "IDR" },
      { "label": "新西兰元 (NZD)", "value": "NZD" }
    ]
  },
  
  lifetimes: {
    attached() {
      this.setData({
        dateText: `${this.data.dateValue[0]} → ${this.data.dateValue[1]}`
      });
    }
  },
  
  methods: {
    onColumnChange(e) {
      console.log('picker pick:', e);
    },

    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;

      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Text`]: `${value[0]} → ${value[1]}`,
      });
      this.triggerEvent("exchange", { from_code: value[0], to_code: value[1] });
    },

    onPickerCancel(e) {
      const { key } = e.currentTarget.dataset;
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    onAreaPicker() {
      this.setData({ dateVisible: true });
    },
    
    exchange() {
      const value = [...this.data.dateValue];
      [value[0], value[1]] = [value[1], value[0]];
      this.setData({
        dateVisible: false,
        dateValue: value,
        dateText: `${value[0]} → ${value[1]}`,
      });
      this.triggerEvent("exchange", { from_code: value[0], to_code: value[1] });
    }
  },
});
