import gulpError from './utils/gulpError';
App({
    onLaunch(options) {
        // Do something initial when launch.
    },
    onShow(options) {
        console.log(options);
        // let option = wx.getLaunchOptionsSync();
        // console.log(option);
        if (gulpError !== 'gulpErrorPlaceHolder') {
            wx.redirectTo({
                url: `/pages/gulp-error/index?gulpError=${gulpError}`,
            });
        }
    },
    onHide() {
        // Do something when hide.
    },
    onError(msg) {
        console.log(msg)
    },
    globalData: {
        currentTaxInfo: "", 
        apiKey: 'your-api-key',
        // 工具管理相关数据
        tools: [],
        currentTool: null,
      },
});
