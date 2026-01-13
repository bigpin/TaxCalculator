// pages/tools/currency-exchange/index.js
const { CONFIG } = require('../../../utils/config');

Page({
    data: {
        exchangeCache: {},
        loading: false,
        fromCode: 'CNY',
        toCode: 'USD',
        resultText: ''
    },

    onLoad() {
        // 初始化
    },

    // 汇率转换
    async exchangeChanged(e) {
        const { from_code, to_code } = e.detail;
        this.setData({
            fromCode: from_code,
            toCode: to_code
        });

        const targetComponent = this.selectComponent('#exchangeInfo');
        const key = `${from_code}${to_code}`;

        try {
            const exchangeData = await this.getExchangeRate(from_code, to_code, key);
            const displayText = this.formatExchangeText(exchangeData, from_code, to_code);
            targetComponent.updateText(displayText);
            this.setData({
                resultText: displayText
            });
        } catch (error) {
            const errorText = `获取汇率信息失败：${error.message}`;
            targetComponent.updateText(errorText);
            this.setData({
                resultText: errorText
            });
            console.error('获取汇率信息失败：', error);
        }
    },

    // 获取汇率
    async getExchangeRate(from_code, to_code, key) {
        // 检查缓存
        if (this.checkExchangeCache(key)) {
            return this.data.exchangeCache[key];
        }

        // 获取新数据
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

    // 检查缓存
    checkExchangeCache(key) {
        const cachedData = this.data.exchangeCache[key];
        if (!cachedData) return false;

        const cacheTime = new Date(cachedData[0].updateTime.replace(" ", "T"));
        return (new Date() - cacheTime) < CONFIG.CACHE_EXPIRE_TIME;
    },

    // 更新缓存
    updateExchangeCache(key, data) {
        const exchangeCache = { ...this.data.exchangeCache };
        exchangeCache[key] = data;
        this.setData({ exchangeCache });
    },

    // 格式化汇率文本
    formatExchangeText(exchangeData, from_code, to_code) {
        const { currencyF_Name, currencyT_Name, exchange, updateTime } = exchangeData[0];
        return `1${currencyF_Name}(${from_code})兑换${exchange}${currencyT_Name}(${to_code})\n更新时间：${updateTime}`;
    },

    // 调换币种
    onExchangeSwap() {
        const exchangeComponent = this.selectComponent('#exchangeSetting');
        if (exchangeComponent) {
            exchangeComponent.exchange();
        }
    },

    // 查询汇率
    onQuery() {
        const exchangeComponent = this.selectComponent('#exchangeSetting');
        if (exchangeComponent) {
            const { dateValue } = exchangeComponent.data;
            if (dateValue && dateValue.length === 2) {
                this.exchangeChanged({
                    detail: {
                        from_code: dateValue[0],
                        to_code: dateValue[1]
                    }
                });
            }
        }
    },

    // 按钮点击事件
    onTap(e) {
        if (e.detail.buttonId === 'reset') {
            return this.onExchangeSwap();
        }
        if (e.detail.buttonId === 'cal') {
            return this.onQuery();
        }
    }
});
