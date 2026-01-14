import gulpError from './utils/gulpError';
App({
    onLaunch(options) {
        // 初始化云开发（如果已配置）
        if (typeof wx.cloud !== 'undefined') {
            wx.cloud.init({
                env: 'cloudbase-4g6zx8vx290da64e', // 云开发环境ID
                traceUser: true
            });
        }
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
