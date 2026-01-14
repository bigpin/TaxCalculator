// pages/tools/qrcode/index.js
// 二维码生成工具

const { generateQRCodeOnCanvas } = require('../../../utils/qrcode-generator');

Page({
    data: {
        // 生成相关
        inputText: '',
        qrcodePath: '',
        qrcodeSize: 400,
        generating: false
    },

    // 防抖定时器
    debounceTimer: null,

    onLoad() {
        console.log('二维码工具加载');
    },

    onUnload() {
        // 清理定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    },

    // ========== 生成二维码 ==========
    
    // 输入文本（带防抖）
    onInputChange(e) {
        const text = e.detail.value;
        this.setData({ inputText: text });
        
        // 清除之前的定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        // 如果输入为空，立即清空二维码
        if (!text.trim()) {
            this.setData({ 
                qrcodePath: '',
                generating: false
            });
            return;
        }
        
        // 显示加载状态
        this.setData({ generating: true });
        
        // 防抖：用户停止输入 500ms 后再生成二维码
        // 这样可以避免频繁生成，同时确保只生成最终输入的内容
        this.debounceTimer = setTimeout(() => {
            this.generateQRCode(text.trim());
            this.debounceTimer = null;
        }, 500);
    },

    // 生成二维码
    generateQRCode(text) {
        if (!text) {
            this.setData({ generating: false });
            return;
        }

        // 使用 qrcode 库在 Canvas 上生成二维码
        generateQRCodeOnCanvas(this, text, this.data.qrcodeSize)
            .then((tempFilePath) => {
                this.setData({
                    qrcodePath: tempFilePath,
                    generating: false
                });
            })
            .catch((err) => {
                console.error('生成二维码失败:', err);
                this.setData({ generating: false });
                wx.showToast({
                    title: '生成失败，请重试',
                    icon: 'none'
                });
            });
    },

    // 保存二维码
    saveQRCode() {
        if (!this.data.qrcodePath) {
            wx.showToast({
                title: '请先生成二维码',
                icon: 'none'
            });
            return;
        }

        wx.saveImageToPhotosAlbum({
            filePath: this.data.qrcodePath,
            success: () => {
                wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
            },
            fail: (err) => {
                console.error('保存失败:', err);
                if (err.errMsg.includes('auth deny')) {
                    wx.showModal({
                        title: '提示',
                        content: '需要授权保存到相册权限',
                        confirmText: '去设置',
                        success: (res) => {
                            if (res.confirm) {
                                wx.openSetting();
                            }
                        }
                    });
                } else {
                    wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                }
            }
        });
    },

    // 预览二维码
    previewQRCode() {
        if (this.data.qrcodePath) {
            wx.previewImage({
                urls: [this.data.qrcodePath],
                current: this.data.qrcodePath
            });
        }
    }
});
