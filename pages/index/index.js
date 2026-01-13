// pages/index/index.js
// 工具分类首页

// 工具分类定义
const TOOL_CATEGORIES = {
    FINANCE: 'finance',
    IMAGE: 'image',
    LIFE: 'life',
    OTHER: 'other'
};

const TOOL_CATEGORY_NAMES = {
    'finance': '财务工具',
    'image': '图片工具',
    'life': '生活工具',
    'other': '其他工具'
};

// 工具配置列表
const TOOLS = [
    {
        id: 'tax-calculator',
        name: '个税计算器',
        icon: 'money-circle',
        category: 'finance',
        description: '计算个人所得税，支持多个月份累计计算',
        path: '/pages/tools/tax-calculator/index'
    },
    {
        id: 'pension-calculator',
        name: '年终奖计算器',
        icon: 'wallet',
        category: 'finance',
        description: '计算年终奖缴税金额',
        path: '/pages/tools/pension-calculator/index'
    },
    {
        id: 'currency-exchange',
        name: '汇率转换',
        icon: 'swap',
        category: 'finance',
        description: '实时查询和转换多种货币汇率',
        path: '/pages/tools/currency-exchange/index'
    },
    {
        id: 'photo-privacy',
        name: '照片隐私清除',
        icon: 'image',
        category: 'image',
        description: '去除照片中的位置、时间等隐私信息',
        path: '/pages/tools/photo-privacy/index'
    }
];

Page({
    data: {
        categories: ['finance', 'image'],
        categoryNames: TOOL_CATEGORY_NAMES,
        currentCategory: '',
        tools: TOOLS,
        filteredTools: TOOLS
    },

    onLoad() {
        console.log('首页加载');
    },

    // 切换分类
    onCategoryChange(e) {
        const category = e.currentTarget.dataset.category || '';
        let filteredTools;
        if (category === '') {
            filteredTools = TOOLS;
        } else {
            filteredTools = TOOLS.filter(tool => tool.category === category);
        }
        this.setData({
            currentCategory: category,
            filteredTools: filteredTools
        });
    },

    // 点击工具
    onToolTap(e) {
        const tool = e.currentTarget.dataset.tool;
        if (tool && tool.path) {
            wx.navigateTo({
                url: tool.path,
                fail: (err) => {
                    console.error('导航失败:', err);
                    wx.showToast({
                        title: '页面不存在',
                        icon: 'none'
                    });
                }
            });
        }
    }
});
