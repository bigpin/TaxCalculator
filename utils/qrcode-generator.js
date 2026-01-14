// 二维码生成器
// 使用 qrcode 库在 Canvas 上生成二维码

// 尝试从 miniprogram_npm 引入（构建后的 npm 包）
// 如果不存在，则尝试从 node_modules 引入
let QRCode;
try {
    // 优先使用构建后的 npm 包
    QRCode = require('miniprogram_npm/qrcode');
} catch (e) {
    try {
        // 回退到 node_modules
        QRCode = require('qrcode');
    } catch (e2) {
        console.error('无法加载 qrcode 库:', e2);
        throw new Error('qrcode 库未找到，请确保已安装并构建 npm 包');
    }
}

/**
 * 在 Canvas 上绘制二维码
 * @param {Object} pageContext 页面上下文（this）
 * @param {string} text 要生成二维码的文本
 * @param {number} size 二维码尺寸（默认 400）
 * @returns {Promise<string>} 返回临时图片路径
 */
function generateQRCodeOnCanvas(pageContext, text, size = 400) {
    return new Promise((resolve, reject) => {
        if (!text || !text.trim()) {
            reject(new Error('文本内容不能为空'));
            return;
        }

        // 创建 Canvas 查询
        const query = wx.createSelectorQuery().in(pageContext);
        query.select('#qrcode-canvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                if (!res[0] || !res[0].node) {
                    reject(new Error('Canvas未找到'));
                    return;
                }

                const canvas = res[0].node;
                const dpr = wx.getSystemInfoSync().pixelRatio;
                
                // 设置 Canvas 尺寸（考虑 DPR）
                canvas.width = size * dpr;
                canvas.height = size * dpr;
                
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);

                // 清空画布，填充白色背景
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);

                // 使用 qrcode 库生成二维码
                // QRCode.toCanvas 返回 Promise
                // 在小程序中，我们需要使用 canvas 的 node 对象
                QRCode.toCanvas(canvas, text, {
                    width: size,
                    margin: 2,
                    color: {
                        dark: '#000000',  // 二维码前景色
                        light: '#FFFFFF'  // 二维码背景色
                    },
                    errorCorrectionLevel: 'M' // 容错级别：L, M, Q, H
                }).then(() => {
                    // 导出为临时图片
                    wx.canvasToTempFilePath({
                        canvas: canvas,
                        x: 0,
                        y: 0,
                        width: size,
                        height: size,
                        destWidth: size,
                        destHeight: size,
                        fileType: 'png',
                        quality: 1,
                        success: (res) => {
                            resolve(res.tempFilePath);
                        },
                        fail: (err) => {
                            console.error('导出二维码图片失败:', err);
                            reject(err);
                        }
                    });
                }).catch((error) => {
                    console.error('生成二维码失败:', error);
                    reject(error);
                });
            });
    });
}

module.exports = {
    generateQRCodeOnCanvas
};
