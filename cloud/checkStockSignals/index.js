// cloud/checkStockSignals/index.js
// 定时触发云函数：检查股票信号数据并发送通知

// 解决 BigInt 序列化问题
BigInt.prototype.toJSON = function () { return this.toString() };

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 格式化日期
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 发送订阅消息
 */
async function sendNotification(openid, stockCount, reportDate) {
  const templateId = '60NMuOzka6yvGWttPKA-SWlYiB0o580AmdsQBM0SHjg';
  
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId: templateId,
      page: 'pages/tools/stock-signals/index',
      data: {
        thing15: { value: `今日股票信号更新` },
        character_string16: { value: `共${stockCount}只股票` },
        time7: { value: reportDate }
      },
      miniprogramState: 'developer' // 开发版使用developer，正式版改为formal
    });
    
    console.log(`发送成功 - ${openid}:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`发送失败 - ${openid}:`, error);
    return { 
      success: false, 
      error: String(error.message || error),
      errorCode: error.errCode || 'UNKNOWN'
    };
  }
}

/**
 * 更新订阅者的最后通知日期
 */
async function updateLastNotifiedDate(subscriberId, date) {
  try {
    await db.collection('stock_signals_subscriber').doc(subscriberId).update({
      data: {
        lastNotifiedDate: date
      }
    });
    console.log(`已更新最后通知日期: ${subscriberId} - ${date}`);
  } catch (error) {
    console.error(`更新最后通知日期失败: ${subscriberId}`, error);
  }
}

/**
 * 主函数 - 每天4、5、6、7、8点自动执行
 */
exports.main = async (event, context) => {
  console.log('========== 股票信号检查开始 ==========');
  console.log('执行时间:', new Date().toISOString());
  
  const templateId = '60NMuOzka6yvGWttPKA-SWlYiB0o580AmdsQBM0SHjg';
  const today = formatDate(new Date());
  
  const results = {
    checked: false,
    hasNewData: false,
    stockCount: 0,
    subscribersTotal: 0,
    subscribersChecked: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    details: []
  };
  
  try {
    // 第一步：检查今天是否有新的股票信号数据
    console.log(`检查日期: ${today}`);
    
    const summaryRes = await db.collection('stock_signals')
      .where({
        doc_type: 'stock_summary',
        report_date: today
      })
      .get();
    
    const todaySummaries = summaryRes.data || [];
    results.checked = true;
    
    if (todaySummaries.length === 0) {
      console.log(`今天(${today})没有新的股票信号数据`);
      return {
        success: true,
        message: '今天没有新数据',
        ...results
      };
    }
    
    // 统计今日股票数量（去重）
    const stockCodes = new Set(todaySummaries.map(s => s.stock_code));
    results.hasNewData = true;
    results.stockCount = stockCodes.size;
    
    console.log(`今天(${today})有${results.stockCount}只股票出现信号`);
    
    // 第二步：获取所有活跃订阅者
    const MAX_LIMIT = 100;
    const countResult = await db.collection('stock_signals_subscriber').count();
    const total = countResult.total;
    results.subscribersTotal = total;
    
    console.log(`共有 ${total} 条订阅记录`);
    
    if (total === 0) {
      console.log('没有订阅者，跳过发送');
      return {
        success: true,
        message: '没有订阅者',
        ...results
      };
    }
    
    // 分批获取订阅者
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    const tasks = [];
    
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('stock_signals_subscriber')
        .where({
          status: 'active'
        })
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT)
        .get();
      tasks.push(promise);
    }
    
    const allResults = await Promise.all(tasks);
    const allSubscribers = allResults.reduce((acc, cur) => {
      return acc.concat(cur.data);
    }, []);
    
    console.log(`找到 ${allSubscribers.length} 个活跃订阅者`);
    
    // 第三步：遍历订阅者发送通知
    for (const subscriber of allSubscribers) {
      results.subscribersChecked++;
      
      const openid = subscriber._openid;
      const subscriberId = subscriber._id;
      const lastNotifiedDate = subscriber.lastNotifiedDate;
      
      // 检查今天是否已发送过
      if (lastNotifiedDate === today) {
        console.log(`跳过: ${openid} - 今天已发送过通知`);
        results.skipped++;
        results.details.push({
          openid: openid,
          status: 'skipped',
          reason: '今天已发送'
        });
        continue;
      }
      
      // 发送通知
      const sendResult = await sendNotification(openid, results.stockCount, today);
      
      if (sendResult.success) {
        results.sent++;
        // 更新最后通知日期
        await updateLastNotifiedDate(subscriberId, today);
        results.details.push({
          openid: openid,
          status: 'sent'
        });
      } else {
        results.failed++;
        results.details.push({
          openid: openid,
          status: 'failed',
          error: sendResult.error,
          errorCode: sendResult.errorCode
        });
      }
      
      // 避免请求过快，稍微延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('========== 股票信号检查完成 ==========');
    console.log(`检查: ${results.checked}, 有新数据: ${results.hasNewData}, 股票数: ${results.stockCount}`);
    console.log(`订阅者: 总计${results.subscribersTotal}, 检查${results.subscribersChecked}, 发送${results.sent}, 跳过${results.skipped}, 失败${results.failed}`);
    
    return {
      success: true,
      ...results
    };
    
  } catch (error) {
    console.error('股票信号检查失败:', error);
    return {
      success: false,
      error: String(error.message || error),
      ...results
    };
  }
};
