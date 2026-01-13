import list from './data/index'; 
import { CONFIG } from './config';

Page({
    properties: {
        // 移除重复的 detailInfo
    },

    data: {
        list,
        detailInfo: [],
        currentTab: 0,
        exchangeCache: {},
        loading: false
    },

    // 汇率转换相关方法
    async exchangeChanged(e) {
        const { from_code, to_code } = e.detail;
        const targetComponent = this.selectComponent('#exchangeInfo');
        const key = `${from_code}${to_code}`;

        try {
            const exchangeData = await this.getExchangeRate(from_code, to_code, key);
            const displayText = this.formatExchangeText(exchangeData);
            targetComponent.updateText(displayText);
        } catch (error) {
            targetComponent.updateText(`获取汇率信息失败：${error.message}`);
            console.error('获取汇率信息失败：', error);
        }
    },

    async getExchangeRate(from_code, to_code, key) {
        // 检查缓存
        if (this.checkExchangeCache(key)) {
            return this.data.exchangeCache[key];
        }

        // 获取新数��
        this.setData({ loading: true });
        try {
            const res = await wx.request({
                url: `${CONFIG.EXCHANGE_API_URL}`,
                method: 'GET',
                data: {
                    from: from_code,
                    to: to_code,
                    version: 2,
                    key: CONFIG.JUHE_API_KEY
                }
            });

            const exchangeRateData = res.data.result;
            this.updateExchangeCache(key, exchangeRateData);
            return exchangeRateData;
        } finally {
            this.setData({ loading: false });
        }
    },

    checkExchangeCache(key) {
        const cachedData = this.data.exchangeCache[key];
        if (!cachedData) return false;

        const cacheTime = new Date(cachedData[0].updateTime.replace(" ", "T"));
        return (new Date() - cacheTime) < CONFIG.CACHE_EXPIRE_TIME;
    },

    updateExchangeCache(key, data) {
        const exchangeCache = { ...this.data.exchangeCache };
        exchangeCache[key] = data;
        this.setData({ exchangeCache });
    },

    formatExchangeText(exchangeData) {
        const { currencyF_Name, currencyT_Name, exchange, updateTime } = exchangeData[0];
        return `1${currencyF_Name}${from_code}兑换${exchange}${currencyT_Name}${to_code}\n${updateTime}`;
    },

    // 税收计算相关方法
    onTap(e) {
        const taxInput = this.selectComponent('#taxInput');
        if (!taxInput) return;

        if (e.detail.buttonId === 'reset') {
            return taxInput.resetValues();
        }

        this.calculateAndDisplayTax(taxInput);
    },

    calculateAndDisplayTax(taxInput) {
        taxInput.cal();
        this.updateTaxDisplay(taxInput.monthlyNetSalaryArray);
        this.updateTaxList(taxInput.monthlyNetSalaryArray);
    },

    updateTaxDisplay(salaryArray) {
        const output = this.selectComponent('#taxInfo');
        if (!output) return;

        output.clearText();
        salaryArray.forEach((netSalary, index) => {
            const text = `第${index + 1}月：${netSalary.salary.toFixed(2)}, 合计交税：${netSalary.tax.toFixed(2)}\n`;
            output.updateTax(text, true);
        });
    },

    updateTaxList(salaryArray) {
        const outputList = this.selectComponent('#taxInfoList');
        if (!outputList) return;

        const tempArr = salaryArray.map((netSalary, index) => {
            this.data.detailInfo.push({
                month: `${index + 1}月`,
                info: this.formatTaxInfo(netSalary)
            });

            return {
                name: `${index + 1}月`,
                label: `${netSalary.salary.toFixed(2)}, 累积缴个税：${netSalary.tax.toFixed(2)}`
            };
        });

        outputList.setData({ childArr: tempArr });
    },

    formatTaxInfo(netSalary) {
        return `实际入账：${netSalary.salary.toFixed(2)}元
养老保险：${netSalary.old.toFixed(2)}元
失业保险：${netSalary.lost.toFixed(2)}元
医疗保险：${netSalary.medical.toFixed(2)}元
住房公积金：${netSalary.house.toFixed(2)}元
累积缴个税：${netSalary.tax.toFixed(2)}元`;
    },

    onTabClick(e) {
        console.log('Tab click event detail:', e.detail);  // 保留这行调试信息
        const tabIndex = e.detail;
        
        // 更新当前选中的 tab
        this.setData({ 
            currentTab: tabIndex 
        });

        // 根据不同的 tab 执行相应的操作
        if (tabIndex === 0) {
            // 个税计算
            const taxComponent = this.selectComponent('#taxInput');
            if (taxComponent) {
                taxComponent.resetValues();
            }
        } else if (tabIndex === 1) {
            // 养老金计算
            const yebComponent = this.selectComponent('#yebInput');
            if (yebComponent) {
                yebComponent.resetValues();
            }
        } else if (tabIndex === 2) {
            // 汇率计算
            const exchangeComponent = this.selectComponent('#exchangeInfo');
            if (exchangeComponent) {
                exchangeComponent.clearText();
            }
        }
    },

    // 其他方法保持不变...
});
