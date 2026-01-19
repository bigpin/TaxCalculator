// pages/recent/index.js
// 最近使用页面

const storage = require('../../utils/storage');

const TOOL_CATEGORY_NAMES = {
    'finance': '财务工具',
    'image': '图片工具',
    'life': '生活工具',
    'other': '其他工具'
};

Page({
    data: {
        recentUses: [],
        favorites: [],
        categoryNames: TOOL_CATEGORY_NAMES
    },

    onLoad() {
        this.loadData();
    },

    onShow() {
        // 页面显示时刷新数据
        this.loadData();
    },

    // 加载数据
    loadData() {
        const recentUses = storage.getRecentUses();
        const favorites = storage.getFavorites();
        
        // 格式化时间
        const formattedUses = recentUses.map(item => ({
            ...item,
            relativeTime: this.formatRelativeTime(item.useTime)
        }));
        
        this.setData({
            recentUses: formattedUses,
            favorites: favorites
        });
    },

    // 点击工具
    onToolTap(e) {
        const index = e.currentTarget.dataset.index;
        const tool = this.data.recentUses[index]?.toolInfo;
        
        if (!tool || !tool.path) {
            wx.showToast({
                title: '工具数据无效',
                icon: 'none'
            });
            return;
        }
        
        // 记录使用时间
        storage.saveRecentUse(tool.id, tool);
        
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
    },

    // 收藏点击
    onFavoriteTap(e) {
        const toolId = e.currentTarget.dataset.toolId;
        const isFavorite = storage.toggleFavorite(toolId);
        
        // 更新收藏列表
        const favorites = storage.getFavorites();
        this.setData({
            favorites: favorites
        });
        
        wx.showToast({
            title: isFavorite ? '已收藏' : '已取消收藏',
            icon: 'none',
            duration: 1500
        });
    },

    // Tab点击
    onTabItemTap(e) {
        const tabValue = e.currentTarget.dataset.tab;
        
        // 如果点击的是当前Tab，不处理
        if (tabValue === 'recent') {
            return;
        }
        
        // 跳转到对应页面
        if (tabValue === 'tools') {
            wx.redirectTo({
                url: '/pages/index/index'
            });
        } else if (tabValue === 'my') {
            wx.redirectTo({
                url: '/pages/my/index'
            });
        }
    },

    // 格式化相对时间
    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) {
            return '刚刚';
        } else if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            const date = new Date(timestamp);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}月${day}日`;
        }
    }
});
