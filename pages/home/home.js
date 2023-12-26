import list from './data/index';

Page({
    properties: {
        detailInfo: [],
    },

    data: {
        list,
        detailInfo: [],
    },
    onLoad(options) {
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
    onTap: function (e) {
        console.log('tap clear', e.detail);
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
                    let childArr = []
                    targetComponent.monthlyNetSalaryArray.forEach((netSalary, index) => {
                        // 更新List
                        this.data.detailInfo.push({
                            month: `${index + 1}月`,
                            info: `实际入账：${netSalary.salary.toFixed(2)}元\n养老保险：${netSalary.old.toFixed(2)}元\n失业保险：${netSalary.lost.toFixed(2)}元\n医疗保险：${netSalary.lost.toFixed(2)}元\n住房公积金：${netSalary.house.toFixed(2)}元\n累积缴个税：${netSalary.tax.toFixed(2)}元`
                        });
                        childArr.push({ name: `${index + 1}月`, label: `${netSalary.salary.toFixed(2)}, 累积缴个税：${netSalary.tax.toFixed(2)}` });
                    });
                    outputList.setData({ childArr: childArr });
                }
            }
        }
    }
});
