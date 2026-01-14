// cloud/sendAnniversaryMsg/index.js
// 云函数：发送纪念日订阅消息

// 解决 BigInt 序列化问题
BigInt.prototype.toJSON = function () { return this.toString() };

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 发送订阅消息
 */
exports.main = async (event, context) => {
  console.log('========== 云函数开始执行 ==========');
  console.log('接收到的参数:', JSON.stringify(event, null, 2));
  
  const wxContext = cloud.getWXContext();
  const { templateId, data } = event;

  console.log('OpenID:', wxContext.OPENID);
  console.log('AppID:', wxContext.APPID);
  console.log('模板ID:', templateId);
  console.log('模板数据:', JSON.stringify(data, null, 2));

  // 参数验证
  if (!templateId) {
    return {
      success: false,
      error: '模板ID不能为空',
      errorCode: 'INVALID_PARAM'
    };
  }

  if (!data) {
    return {
      success: false,
      error: '模板数据不能为空',
      errorCode: 'INVALID_PARAM'
    };
  }

  if (!wxContext.OPENID) {
    return {
      success: false,
      error: '无法获取用户OpenID',
      errorCode: 'NO_OPENID'
    };
  }

  try {
    console.log('准备调用订阅消息接口...');
    
    // 调用微信订阅消息接口
    const result = await cloud.openapi.subscribeMessage.send({
      touser: wxContext.OPENID,
      templateId: templateId,
      page: 'pages/tools/anniversary/index',
      data: data,
      miniprogramState: 'developer' // 开发版使用developer，正式版改为formal
    });

    console.log('订阅消息发送成功:', JSON.stringify(result, null, 2));

    // 安全序列化结果，避免 BigInt 问题
    return {
      success: true,
      result: {
        errCode: String(result.errCode || 0),
        errMsg: String(result.errMsg || 'ok')
      },
      message: '发送成功'
    };
  } catch (error) {
    console.error('========== 发送订阅消息失败 ==========');
    console.error('错误对象:', error);
    console.error('错误类型:', typeof error);
    console.error('错误消息:', error.message);
    console.error('错误代码:', error.errCode);
    console.error('完整错误:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // 提取详细的错误信息，确保转换为字符串避免 BigInt 序列化问题
    let errorCode = 'UNKNOWN';
    let errorMsg = '发送失败';
    
    if (error.errCode) {
      errorCode = String(error.errCode);
      errorMsg = String(error.errMsg || error.message || '发送失败');
    } else if (error.code) {
      errorCode = String(error.code);
      errorMsg = String(error.message || '发送失败');
    } else if (error.message) {
      errorMsg = String(error.message);
    }
    
    console.error('错误码:', errorCode);
    console.error('错误信息:', errorMsg);
    
    return {
      success: false,
      error: errorMsg,
      errorCode: errorCode,
      errorDetail: {
        message: String(error.message || ''),
        errCode: String(error.errCode || ''),
        errMsg: String(error.errMsg || ''),
        code: String(error.code || ''),
        stack: String(error.stack || '')
      }
    };
  }
};
