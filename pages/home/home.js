import list from './data/index';

Page({
    properties: {
        detailInfo: [],
    },

    data: {
        list,
        detailInfo: [],
        currentTab: 0,
        exchangeCache: {}
    },
    onLoad(options) {
        // this.setData({
        //     currentTab: 0,
        //   });
        // const { path, q } = options;
        // console.log(path);
        // if (q) {
        //     const str = this.getQueryByUrl(decodeURIComponent(q));
        //     console.log(str, str.page);
        //     wx.navigateTo({
        //         url: `/pages/${str.page}/${str.page}`,
        //     });
        // }
    },
    clickHandle(e) {
        let { name, label = '' } = e.detail.item;
        this.data.detailInfo.forEach((month, index) => {
            if (month.month == name) {
                getApp().globalData.currentTaxInfo = month.info;
            }
        });
        wx.navigateTo({
            url: '/pages/detail/detail',
            fail: () => {
                wx.navigateTo({
                    url: '/pages/home/navigateFail/navigateFail',
                });
            },
        });
    },
    onShareAppMessage() {
        return {
            title: '个税计算器',
            path: '/pages/home/home',
        };
    },
    // getQueryByUrl(url) {
    //     const data = {};
    //     const queryArr = `${url}`.match(/([^=&#?]+)=[^&#]+/g) || [];
    //     if (queryArr.length) {
    //         queryArr.forEach((para) => {
    //             const d = para.split('=');
    //             const val = decodeURIComponent(d[1]);
    //             if (data[d[0]] !== undefined) {
    //                 data[d[0]] += `,${val}`;
    //             }
    //             else {
    //                 data[d[0]] = val;
    //             }
    //         });
    //     }
    //     return data;
    // },
    // bindKeyInput: function (e) {
    //     this.setData({
    //         inputValue: e.detail.value
    //     })
    // },
    onTabClick: function (e) {
        console.log('page_change', e.detail);
        this.setData({
            currentTab: e.detail,
        });
        if (e.detail = 2) {
            const targetComponent = this.selectComponent('#exchangeInfo');

            // wx.request({
            //     url: 'http://op.juhe.cn/onebox/exchange/list?key=9d9e5a11240974a2fa51f4ce3c7c671c&version=2',
            //     method: 'GET',
            //     success: function(res) {
            //       // 请求成功时，解析返回的汇率数据
            //       var exchangeRateData = res.data.result.list;
            //       // 处理您的汇率数据，更新小程序页面显示
            //       // 例如：this.setData({ exchangeRate: exchangeRateData });
            //       console.log(exchangeRateData);
            //       targetComponent.updateText(exchangeRateData);
            //     },
            //     fail: function(error) {
            //       // 请求失败时的处理
            //       console.error('获取汇率信息失败：', error);
            //     }
            //   });
        }
    },
    exchangeChanged: function (e) {
        const targetComponent = this.selectComponent('#exchangeInfo');
        var from_code = e.detail.from_code;
        var to_code = e.detail.to_code;
        // 先查一下有没有cache
        var key = from_code + to_code;
        if (this.data.exchangeCache[key] &&
            new Date() - new Date(this.data.exchangeCache[key][0].updateTime.replace(" ", "T")) < 30 * 60000) {
            var exchangeRateData = this.data.exchangeCache[key];
            console.log('already in cache');
            var from_name = exchangeRateData[0].currencyF_Name;
            var to_name = exchangeRateData[0].currencyT_Name;
            var count = exchangeRateData[0].exchange;
            var updateTime = exchangeRateData[0].updateTime;
            var t = '1' + from_name + from_code + '兑换' + count + to_name + to_code + '\n' + updateTime;
            targetComponent.updateText(t);
        } else {
            // 没有数据，从新获取实时数据
            // 保存需要使用的数据
            const exchangeCache = this.data.exchangeCache;
            wx.request({
                url: 'https://op.juhe.cn/onebox/exchange/currency?from=' + from_code + '&to=' + to_code + '&version=2&key=9d9e5a11240974a2fa51f4ce3c7c671c',
                method: 'GET',
                success: function (res) {
                    // 请求成功时，解析返回的汇率数据
                    var exchangeRateData = res.data.result;
                    exchangeCache[key] = exchangeRateData;
                    // 处理您的汇率数据，更新小程序页面显示
                    // 例如：this.setData({ exchangeRate: exchangeRateData });
                    console.log(exchangeRateData);
                    var from_name = exchangeRateData[0].currencyF_Name;
                    var to_name = exchangeRateData[0].currencyT_Name;
                    var count = exchangeRateData[0].exchange;
                    var updateTime = exchangeRateData[0].updateTime;
                    var t = '1' + from_name + from_code + '兑换' + count + to_name + to_code + '\n' + updateTime;
                    targetComponent.updateText(t);
                },
                fail: function (error) {
                    // 请求失败时的处理
                    targetComponent.updateText('获取汇率信息失败：' + error.errMsg + error.errno);
                    console.error('获取汇率信息失败：', error);
                }
            });
        }

    },

    // 计算个税
    onTap: function (e) {
        const targetComponent = this.selectComponent('#taxInput');

        // 调用被调用组件的函数
        if (targetComponent) {
            if (e.detail.buttonId === 'reset') {
                targetComponent.resetValues();
            } else {
                targetComponent.cal();

                const output = this.selectComponent('#taxInfo')
                if (output) {
                    output.clearText()
                    targetComponent.monthlyNetSalaryArray.forEach((netSalary, index) => {
                        // console.log(`第${index + 1}月：${netSalary.salary.toFixed(2)}, 交税：${netSalary.tax.toFixed(2)}`);
                        output.updateTax(`第${index + 1}月：${netSalary.salary.toFixed(2)}, 合计交税：${netSalary.tax.toFixed(2)}\n`, true);
                        // 更新List
                        childArr.push({ name: `第${index + 1}月：${netSalary.salary.toFixed(2)}, 合计交税：${netSalary.tax.toFixed(2)}`, label: '' });
                    });
                }
                const outputList = this.selectComponent('#taxInfoList');
                if (outputList) {
                    let tempArr = []
                    targetComponent.monthlyNetSalaryArray.forEach((netSalary, index) => {
                        // 更新List
                        this.data.detailInfo.push({
                            month: `${index + 1}月`,
                            info: `实际入账：${netSalary.salary.toFixed(2)}元\n养老保险：${netSalary.old.toFixed(2)}元\n失业保险：${netSalary.lost.toFixed(2)}元\n医疗保险：${netSalary.medical.toFixed(2)}元\n住房公积金：${netSalary.house.toFixed(2)}元\n累积缴个税：${netSalary.tax.toFixed(2)}元`
                        });
                        tempArr.push({ name: `${index + 1}月`, label: `${netSalary.salary.toFixed(2)}, 累积缴个税：${netSalary.tax.toFixed(2)}` });
                    });
                    outputList.setData({ childArr: tempArr });
                }
            }
        }
    },
    // 计算年终奖
    onTapYEB: function (e) {
        const targetComponent = this.selectComponent('#taxInput');

        // 调用被调用组件的函数
        if (targetComponent) {
            if (e.detail.buttonId === 'reset') {
                targetComponent.resetValues();
            } else {
                targetComponent.cal();
                const output = this.selectComponent('#taxInfo')
                if (output) {
                    output.clearText()
                    output.updateText(`年终奖总计：${targetComponent.yebAndTax.salary}\n税率：${targetComponent.yebAndTax.tax_rate.toFixed(0)}%\n缴税：${targetComponent.yebAndTax.tax.toFixed(2)}\n到手：${targetComponent.yebAndTax.balance.toFixed(2)}`);
                }
            }
        }
    },
    // 查询汇率
    onTapExchange: function (e) {
        const targetComponent = this.selectComponent('#exchangeSetting');

        // 调用被调用组件的函数
        if (targetComponent) {
            targetComponent.exchange();
        }
    }
});
