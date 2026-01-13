Page({
    data: {
        failImage: 'error-circle-filled',
    },
    toHome() {
        wx.reLaunch({
            url: '/pages/index/index',
        });
    },
});
