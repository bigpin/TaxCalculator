Component({
  data: {
    dateVisible: true,
    dateText: '',
    dateValue: [],
    code: [
      {
        "label": "人民币 (CNY)",
        "value": "CNY"
      },
      {
        "label": "美元 (USD)",
        "value": "USD"
      },
      {
        "label": "日元 (JPY)",
        "value": "JPY"
      },
      {
        "label": "欧元 (EUR)",
        "value": "EUR"
      },
      {
        "label": "英镑 (GBP)",
        "value": "GBP"
      },
      {
        "label": "韩元 (KRW)",
        "value": "KRW"
      },
      {
        "label": "港币 (HKD)",
        "value": "HKD"
      },
      {
        "label": "澳大利亚元 (AUD)",
        "value": "AUD"
      },
      {
        "label": "加拿大元 (CAD)",
        "value": "CAD"
      },
      {
        "label": "阿尔及利亚第纳尔 (DZD)",
        "value": "DZD"
      },
      {
        "label": "阿根廷比索 (ARS)",
        "value": "ARS"
      },
      {
        "label": "爱尔兰镑 (IEP)",
        "value": "IEP"
      },
      {
        "label": "埃及镑 (EGP)",
        "value": "EGP"
      },
      {
        "label": "阿联酋迪拉姆 (AED)",
        "value": "AED"
      },
      {
        "label": "阿曼里亚尔 (OMR)",
        "value": "OMR"
      },
      {
        "label": "奥地利先令 (ATS)",
        "value": "ATS"
      },
      {
        "label": "澳门元 (MOP)",
        "value": "MOP"
      },
      {
        "label": "百慕大元 (BMD)",
        "value": "BMD"
      },
      {
        "label": "巴基斯坦卢比 (PKR)",
        "value": "PKR"
      },
      {
        "label": "巴拉圭瓜拉尼 (PYG)",
        "value": "PYG"
      },
      {
        "label": "巴林第纳尔 (BHD)",
        "value": "BHD"
      },
      {
        "label": "巴拿马巴尔博亚 (PAB)",
        "value": "PAB"
      },
      {
        "label": "保加利亚列弗 (BGN)",
        "value": "BGN"
      },
      {
        "label": "巴西雷亚尔 (BRL)",
        "value": "BRL"
      },
      {
        "label": "比利时法郎 (BEF)",
        "value": "BEF"
      },
      {
        "label": "冰岛克朗 (ISK)",
        "value": "ISK"
      },
      {
        "label": "博茨瓦纳普拉 (BWP)",
        "value": "BWP"
      },
      {
        "label": "波兰兹罗提 (PLN)",
        "value": "PLN"
      },
      {
        "label": "玻利维亚诺 (BOB)",
        "value": "BOB"
      },
      {
        "label": "丹麦克朗 (DKK)",
        "value": "DKK"
      },
      {
        "label": "菲律宾比索 (PHP)",
        "value": "PHP"
      },
      {
        "label": "芬兰马克 (FIM)",
        "value": "FIM"
      },
      {
        "label": "哥伦比亚比索 (COP)",
        "value": "COP"
      },
      {
        "label": "古巴比索 (CUP)",
        "value": "CUP"
      },
      {
        "label": "哈萨克坚戈 (KZT)",
        "value": "KZT"
      },
      {
        "label": "加纳塞地 (GHC)",
        "value": "GHC"
      },
      {
        "label": "捷克克朗 (CZK)",
        "value": "CZK"
      },
      {
        "label": "津巴布韦元 (ZWD)",
        "value": "ZWD"
      },
      {
        "label": "卡塔尔里亚尔 (QAR)",
        "value": "QAR"
      },
      {
        "label": "克罗地亚库纳 (HRK)",
        "value": "HRK"
      },
      {
        "label": "肯尼亚先令 (KES)",
        "value": "KES"
      },
      {
        "label": "科威特第纳尔 (KWD)",
        "value": "KWD"
      },
      {
        "label": "老挝基普 (LAK)",
        "value": "LAK"
      },
      {
        "label": "拉脱维亚拉图 (LVL)",
        "value": "LVL"
      },
      {
        "label": "黎巴嫩镑 (LBP)",
        "value": "LBP"
      },
      {
        "label": "林吉特 (MYR)",
        "value": "MYR"
      },
      {
        "label": "立陶宛立特 (LTL)",
        "value": "LTL"
      },
      {
        "label": "卢布 (RUB)",
        "value": "RUB"
      },
      {
        "label": "罗马尼亚新列伊 (RON)",
        "value": "RON"
      },
      {
        "label": "毛里求斯卢比 (MUR)",
        "value": "MUR"
      },
      {
        "label": "蒙古图格里克 (MNT)",
        "value": "MNT"
      },
      {
        "label": "孟加拉塔卡 (BDT)",
        "value": "BDT"
      },
      {
        "label": "缅甸缅元 (BUK)",
        "value": "BUK"
      },
      {
        "label": "秘鲁新索尔 (PEN)",
        "value": "PEN"
      },
      {
        "label": "摩洛哥迪拉姆 (MAD)",
        "value": "MAD"
      },
      {
        "label": "墨西哥元 (MXN)",
        "value": "MXN"
      },
      {
        "label": "南非兰特 (ZAR)",
        "value": "ZAR"
      },
      {
        "label": "挪威克朗 (NOK)",
        "value": "NOK"
      },
      {
        "label": "瑞典克朗 (SEK)",
        "value": "SEK"
      },
      {
        "label": "瑞士法郎 (CHF)",
        "value": "CHF"
      },
      {
        "label": "沙特里亚尔 (SAR)",
        "value": "SAR"
      },
      {
        "label": "斯里兰卡卢比 (LKR)",
        "value": "LKR"
      },
      {
        "label": "索马里先令 (SOS)",
        "value": "SOS"
      },
      {
        "label": "泰国铢 (THB)",
        "value": "THB"
      },
      {
        "label": "坦桑尼亚先令 (TZS)",
        "value": "TZS"
      },
      {
        "label": "新土耳其里拉 (TRY)",
        "value": "TRY"
      },
      {
        "label": "突尼斯第纳尔 (TND)",
        "value": "TND"
      },
      {
        "label": "危地马拉格查尔 (GTQ)",
        "value": "GTQ"
      },
      {
        "label": "委内瑞拉玻利瓦尔 (VEB)",
        "value": "VEB"
      },
      {
        "label": "乌拉圭新比索 (UYU)",
        "value": "UYU"
      },
      {
        "label": "希腊德拉克马 (GRD)",
        "value": "GRD"
      },
      {
        "label": "新加坡元 (SGD)",
        "value": "SGD"
      },
      {
        "label": "新台币 (TWD)",
        "value": "TWD"
      },
      {
        "label": "新西兰元 (NZD)",
        "value": "NZD"
      },
      {
        "label": "匈牙利福林 (HUF)",
        "value": "HUF"
      },
      {
        "label": "牙买加元 (JMD)",
        "value": "JMD"
      },
      {
        "label": "印度卢比 (INR)",
        "value": "INR"
      },
      {
        "label": "印尼盾 (IDR)",
        "value": "IDR"
      },
      {
        "label": "以色列谢克尔 (ILS)",
        "value": "ILS"
      },
      {
        "label": "约旦第纳尔 (JOD)",
        "value": "JOD"
      },
      {
        "label": "越南盾 (VND)",
        "value": "VND"
      },
      {
        "label": "智利比索 (CLP)",
        "value": "CLP"
      },
      {
        "label": "白俄罗斯卢布 (BYR)",
        "value": "BYR"
      }
    ]


  },
  attached: function () {
    this.data.code.forEach(element => {
      element.label = element.label + element.value;
    });
    this.selectComponent('#s1').update();
  },
  methods: {
    onColumnChange(e) {
      console.log('picker pick:', e);
    },

    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;

      console.log('picker change:', e.detail);
      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Text`]: value.join(' '),
      });
      this.triggerEvent("exchange", { from_code: value[0], to_code: value[1] });
    },

    onPickerCancel(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    // onCityPicker() {
    //   this.setData({ cityVisible: true });
    // },

    onAreaPicker() {
      this.setData({ dateVisible: true });
    },
    exchange() {
      const value = this.data.dateValue;
      [value[0], value[1]] = [value[1], value[0]];
      this.setData({
        [`dateVisible`]: false,
        [`dateValue`]: value,
        [`dateText`]: value.join(' '),
      });
      this.triggerEvent("exchange", { from_code: value[0], to_code: value[1] });
    }
  },
});
