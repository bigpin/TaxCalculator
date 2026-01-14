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
    },
    {
        id: 'unit-converter',
        name: '单位换算器',
        icon: 'swap',
        category: 'life',
        description: '支持长度、面积、体积、重量、温度、时间、速度等常用单位互转',
        path: '/pages/tools/unit-converter/index'
    }
];

Page({
    data: {
        categories: ['finance', 'image', 'life'],
        categoryNames: TOOL_CATEGORY_NAMES,
        currentCategory: '',
        tools: TOOLS,
        filteredTools: TOOLS,
        showSearch: false,
        searchValue: ''
    },

    onLoad() {
        console.log('首页加载');
    },

    // 切换搜索框显示
    toggleSearch() {
        this.setData({
            showSearch: !this.data.showSearch,
            searchValue: '',
            filteredTools: this.filterTools('', this.data.currentCategory)
        });
    },

    // 搜索输入变化
    onSearchChange(e) {
        const searchValue = e.detail.value || '';
        this.setData({
            searchValue: searchValue,
            filteredTools: this.filterTools(searchValue, this.data.currentCategory)
        });
    },

    // 清空搜索
    onSearchClear() {
        this.setData({
            searchValue: '',
            filteredTools: this.filterTools('', this.data.currentCategory)
        });
    },

    // 根据搜索词和分类筛选工具
    filterTools(searchValue, category) {
        let result = TOOLS;
        
        // 按分类筛选
        if (category) {
            result = result.filter(tool => tool.category === category);
        }
        
        // 按搜索词筛选
        if (searchValue) {
            const keyword = searchValue.toLowerCase();
            result = result.filter(tool => 
                tool.name.toLowerCase().includes(keyword) || 
                tool.description.toLowerCase().includes(keyword)
            );
        }
        
        return result;
    },

    // 切换分类
    onCategoryChange(e) {
        const category = e.currentTarget.dataset.category || '';
        this.setData({
            currentCategory: category,
            filteredTools: this.filterTools(this.data.searchValue, category)
        });
    },

    // 点击工具
    onToolTap(e) {
        const index = e.currentTarget.dataset.index;
        const tool = this.data.filteredTools[index];
        
        console.log('点击索引:', index);
        console.log('工具数据:', tool);
        
        if (!tool || !tool.path) {
            wx.showToast({
                title: '工具数据无效',
                icon: 'none'
            });
            return;
        }
        
        wx.navigateTo({
            url: tool.path,
            fail: (err) => {
                console.error('导航失败:', err);
                wx.showToast({
                    title: '页面跳转失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    }
});
