// pages/tools/stock-signals/index.js
const db = wx.cloud.database();

// 信号类型中文映射
const SIGNAL_TYPE_MAP = {
  'kdj_oversold': 'KDJ超卖',
  'kdj_overbought': 'KDJ超买',
  'dmi_adx_strong': 'ADX强势',
  'dmi_adx_weak': 'ADX弱势',
  'kdj_golden_cross': 'KDJ金叉',
  'kdj_death_cross': 'KDJ死叉',
  'rsi_golden_cross': 'RSI金叉',
  'rsi_death_cross': 'RSI死叉',
  'rsi_oversold': 'RSI超卖',
  'rsi_overbought': 'RSI超买',
  'cci_zero_cross': 'CCI零轴上穿',
  'cci_zero_down': 'CCI零轴下穿',
  'cci_oversold': 'CCI超卖',
  'cci_overbought': 'CCI超买',
  'roc_zero_cross': 'ROC零轴上穿',
  'roc_zero_down': 'ROC零轴下穿',
  'macd_golden_cross': 'MACD金叉',
  'macd_death_cross': 'MACD死叉',
  'boll_lower': '布林下轨',
  'boll_upper': '布林上轨',
  'boll_middle': '布林中轨',
  'boll_width_expand': 'BOLL带宽扩张',
  'boll_bottom_touch': 'BOLL下轨支撑',
  'boll_top_touch': 'BOLL上轨压力',
  'ma_golden_cross': '均线金叉',
  'ma_death_cross': '均线死叉',
  'ma_support': 'MA20支撑',
  'ma_resistance': 'MA20阻力',
  'volume_surge': '成交量放大',
  'volume_shrink': '成交量萎缩',
  'price_breakthrough': '价格突破',
  'support_line': '支撑线',
  'resistance_line': '阻力线'
};

Page({
  data: {
    // 数据相关
    allSignals: [], // 所有信号数据
    groupedSignals: [], // 按日期分组后的数据（已废弃，保留兼容）
    currentPageData: [], // 当前页显示的数据（包含补充的signal_event数据）
    otherDatesData: [], // 其他日期的汇总数据（只包含日期和股票数量）
    loading: false,
    
    // 数据统计
    totalSignals: 0,
    
    // UI状态
    expandedCards: {}, // 展开的卡片ID集合（股票详情）
    expandedSignals: {}, // 展开的信号列表（默认全部折叠）
    expandedDateGroups: {}, // 展开的日期分组（默认全部展开）
    expandedOtherDates: {}, // 展开的其他日期（默认全部收起）
    loadingOtherDates: {}, // 正在加载的其他日期
    showRules: false, // 是否显示规则说明（默认收起）
    
    // 订阅相关
    isSubscribed: false, // 是否已订阅
    subscribing: false, // 订阅中
    unsubscribing: false // 取消订阅中
  },

  onLoad() {
    // 加载数据
    this.loadSignals();
    // 检查订阅状态
    this.checkSubscribeStatus();
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.loadSignals().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    // 滑动到底部不做任何操作（已移除分页功能）
  },

  /**
   * 从云数据库加载信号数据
   * 第一步：从stock_summary获取最近一天的股票列表
   * 第二步：使用report_id加载signal_event补充详细信息
   */
  async loadSignals() {
    this.setData({ loading: true });
    
    try {
      // 第一步：查询最近一天的stock_summary数据
      const summaryRes = await db.collection('stock_signals')
        .where({
          doc_type: 'stock_summary'
        })
        .orderBy('report_date', 'desc')
        .limit(1000) // 限制数量，避免查询过多
        .get();
      
      const summaries = summaryRes.data || [];
      console.log('总股票汇总数:', summaries.length);
      
      if (summaries.length === 0) {
        this.setData({
          currentPageData: [],
          totalSignals: 0,
          loading: false
        });
        return;
      }
      
      // 获取最近的日期（第一条数据的日期）
      const latestDate = summaries[0].report_date || summaries[0].signal_date;
      console.log('最近日期:', latestDate);
      
      // 按日期分组所有汇总数据
      const dateGrouped = {};
      summaries.forEach(summary => {
        const date = summary.report_date || summary.signal_date;
        if (!date) return;
        
        if (!dateGrouped[date]) {
          dateGrouped[date] = [];
        }
        dateGrouped[date].push(summary);
      });
      
      // 获取所有日期列表（按日期倒序）
      const allDates = Object.keys(dateGrouped).sort((a, b) => b.localeCompare(a));
      console.log('所有日期:', allDates);
      
      // 筛选出最近一天的股票
      const latestSummaries = dateGrouped[latestDate] || [];
      console.log('最近一天的股票数:', latestSummaries.length);
      
      // 构建其他日期的汇总数据（只包含日期和股票数量）
      const otherDatesData = allDates
        .filter(date => date !== latestDate)
        .map(date => {
          // 统计该日期有多少只不同的股票
          const stockSet = new Set();
          dateGrouped[date].forEach(s => {
            if (s.stock_code) {
              stockSet.add(s.stock_code);
            }
          });
          return {
            date: date,
            stockCount: stockSet.size,
            summaries: dateGrouped[date] // 保存汇总数据，展开时使用
          };
        });
      
      // 按股票代码分组处理（同一天同一只股票只保留一条）
      const stockMap = {};
      latestSummaries.forEach(summary => {
        const stockCode = summary.stock_code;
        if (!stockCode) return;
        
        if (!stockMap[stockCode]) {
          stockMap[stockCode] = {
            stock_code: stockCode,
            stock_name: summary.stock_name,
            date: latestDate,
            report_id: summary.report_id || summary._id,
            overall_success_rate: summary.overall_success_rate || 0,
            total_signal_count: summary.total_signal_count || 0,
            signals: [] // 稍后从signal_event补充
          };
        }
      });
      
      const stocks = Object.values(stockMap).sort((a, b) => 
        a.stock_code.localeCompare(b.stock_code)
      );
      
      // 收集所有report_id
      const reportIds = stocks.map(s => s.report_id).filter(Boolean);
      console.log('收集到的report_id:', {
        total: reportIds.length,
        sample: reportIds.slice(0, 5),
        stocksWithoutReportId: stocks.filter(s => !s.report_id).length,
        allReportIds: reportIds
      });
      
      // 检查sh601231的report_id
      const sh601231Stock = stocks.find(s => s.stock_code === 'sh601231');
      if (sh601231Stock) {
        console.log('sh601231的report_id:', sh601231Stock.report_id);
      }
      
      // 初始化日期分组展开状态
      const expandedDateGroups = { [latestDate]: true };
      
      // 初始化信号列表展开状态（默认全部折叠）
      const expandedSignals = {};
      
      // 第二步：使用report_id查询对应的signal_event数据
      // 改为对每个report_id单独查询，避免in查询的限制
      if (reportIds.length > 0) {
        try {
          const allSignals = [];
          
          // 对每个report_id单独查询，确保获取所有数据
          for (let i = 0; i < reportIds.length; i++) {
            const reportId = reportIds[i];
            console.log(`查询第${i + 1}/${reportIds.length}个report_id: ${reportId}`);
            
            try {
              const signalRes = await db.collection('stock_signals')
                .where({
                  doc_type: 'signal_event',
                  report_id: reportId
                })
                .limit(1000) // 设置最大限制为1000条
                .get();
              
              const signals = signalRes.data || [];
              allSignals.push(...signals);
              console.log(`  ${reportId} 查询到${signals.length}条信号数据`);
              
              // 如果返回的数据达到1000条，可能还有更多数据
              if (signals.length >= 1000) {
                console.warn(`  ${reportId} 查询达到1000条限制，可能还有更多数据未查询`);
              }
            } catch (error) {
              console.error(`查询 ${reportId} 失败:`, error);
            }
          }
          
          // 在客户端排序（按report_date和signal_date倒序）
          allSignals.sort((a, b) => {
            const dateA = a.report_date || a.signal_date || '';
            const dateB = b.report_date || b.signal_date || '';
            if (dateB !== dateA) {
              return dateB.localeCompare(dateA);
            }
            const signalDateA = a.signal_date || '';
            const signalDateB = b.signal_date || '';
            return signalDateB.localeCompare(signalDateA);
          });
          
          console.log(`总共查询到${allSignals.length}条信号数据，使用的report_id数量: ${reportIds.length}`);
          
          // 统计每个report_id对应的信号数量
          const signalCountByReportId = {};
          allSignals.forEach(signal => {
            const reportId = signal.report_id;
            if (reportId) {
              signalCountByReportId[reportId] = (signalCountByReportId[reportId] || 0) + 1;
            }
          });
          console.log('每个report_id的信号数量统计:', signalCountByReportId);
          
          // 检查sh601231的report_id对应的信号
          const sh601231ReportId = reportIds.find(id => id.includes('sh601231'));
          if (sh601231ReportId) {
            const sh601231Signals = allSignals.filter(s => s.report_id === sh601231ReportId);
            console.log(`sh601231 (report_id: ${sh601231ReportId}) 查询到的信号:`, {
              count: sh601231Signals.length,
              signals: sh601231Signals.map(s => ({
                _id: s._id,
                signal_type: s.signal_type,
                signal_label: s.signal_label,
                signal_date: s.signal_date,
                report_id: s.report_id
              }))
            });
          }
          
          // 将signal_event数据补充到对应的股票中
          allSignals.forEach(signal => {
            const reportId = signal.report_id;
            const stockCode = signal.stock_code;
            
            if (!reportId || !stockCode) {
              console.warn('信号数据缺少report_id或stock_code:', signal);
              return;
            }
            
            // 查找对应的股票
            const stock = stocks.find(s => 
              s.report_id === reportId && s.stock_code === stockCode
            );
            
            if (stock) {
              // 添加信号到股票的信号列表
              const signalCN = this.getSignalTypeCN(signal.signal_type || signal.signal_label);
              stock.signals.push({
                ...signal,
                metricsArray: this.formatMetrics(signal.metrics),
                signal_type_cn: signalCN
              });
            } else {
              console.warn(`未找到对应的股票: report_id=${reportId}, stock_code=${stockCode}`);
            }
          });
          
          // 计算每个股票的信号类型统计
          stocks.forEach(stock => {
            const signalTypeCount = {};
            stock.signals.forEach(s => {
              const typeCN = s.signal_type_cn || s.signal_label || s.signal_type;
              signalTypeCount[typeCN] = (signalTypeCount[typeCN] || 0) + 1;
            });
            stock.signalTypeStats = Object.keys(signalTypeCount).map(type => ({
              type: type,
              count: signalTypeCount[type]
            }));
          });
          
          // 统计每个股票匹配到的信号数量
          const stockSignalCounts = {};
          stocks.forEach(stock => {
            stockSignalCounts[stock.stock_code] = {
              report_id: stock.report_id,
              signalCount: stock.signals.length,
              expectedCount: stock.total_signal_count || 0
            };
          });
          console.log('每个股票的信号数量统计:', stockSignalCounts);
          
          // 检查是否有股票信号数量不匹配
          const mismatchedStocks = stocks.filter(stock => {
            const expected = stock.total_signal_count || 0;
            const actual = stock.signals.length;
            return expected > 0 && actual !== expected;
          });
          if (mismatchedStocks.length > 0) {
            console.warn('信号数量不匹配的股票:', mismatchedStocks.map(s => ({
              stock_code: s.stock_code,
              report_id: s.report_id,
              expected: s.total_signal_count,
              actual: s.signals.length
            })));
          }
          
          // 检查sh601231的数据
          const sh601231Stock = stocks.find(s => s.stock_code === 'sh601231');
          if (sh601231Stock) {
            console.log(`sh601231的信号数:`, {
              actual: sh601231Stock.signals.length,
              expected: sh601231Stock.total_signal_count,
              report_id: sh601231Stock.report_id
            });
          }
          
        } catch (error) {
          console.error('加载信号详情失败:', error);
        }
      }
      
      // 构建当前页数据
      const currentPageData = [{
        date: latestDate,
        stocks: stocks
      }];
      
      // 初始化其他日期的展开状态（默认全部收起）
      const expandedOtherDates = {};
      const loadingOtherDates = {};
      
      this.setData({
        currentPageData: currentPageData,
        otherDatesData: otherDatesData,
        totalSignals: stocks.length,
        expandedDateGroups: expandedDateGroups,
        expandedSignals: expandedSignals,
        expandedOtherDates: expandedOtherDates,
        loadingOtherDates: loadingOtherDates,
        loading: false
      });
      
      console.log('数据加载完成:', {
        date: latestDate,
        stocksCount: stocks.length,
        totalSignals: stocks.reduce((sum, s) => sum + s.signals.length, 0)
      });
      
    } catch (error) {
      console.error('加载信号数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 处理stock_summary数据，按日期和股票代码分组
   */
  processSummaries(summaries) {
    const dateGrouped = {};
    
    summaries.forEach(summary => {
      const date = summary.report_date || summary.signal_date;
      if (!date) return;
      
      if (!dateGrouped[date]) {
        dateGrouped[date] = {};
      }
      
      const stockCode = summary.stock_code;
      if (!stockCode) return;
      
      // 如果该股票在该日期已存在，跳过（避免重复）
      if (!dateGrouped[date][stockCode]) {
        dateGrouped[date][stockCode] = {
          stock_code: stockCode,
          stock_name: summary.stock_name,
          date: date,
          report_id: summary.report_id || summary._id, // 保存report_id用于查询signal_event
          overall_success_rate: summary.overall_success_rate || 0,
          total_signal_count: summary.total_signal_count || 0,
          signals: [] // 稍后从signal_event补充
        };
      }
    });
    
    // 转换为数组结构
    const result = [];
    Object.keys(dateGrouped)
      .sort((a, b) => b.localeCompare(a)) // 日期倒序
      .forEach(date => {
        const stocks = Object.values(dateGrouped[date]);
        // 按股票代码排序
        stocks.sort((a, b) => a.stock_code.localeCompare(b.stock_code));
        result.push({
          date: date,
          stocks: stocks
        });
      });
    
    return result;
  },

  /**
   * 按日期和股票代码分组处理信号数据（同一天同一只股票聚合在一起）
   */
  processSignals(signals) {
    // 第一层：按日期分组
    const dateGrouped = {};
    
    signals.forEach(signal => {
      const date = signal.report_date || signal.signal_date;
      if (!dateGrouped[date]) {
        dateGrouped[date] = {};
      }
      
      // 第二层：按股票代码分组
      const stockCode = signal.stock_code;
      if (!dateGrouped[date][stockCode]) {
        dateGrouped[date][stockCode] = {
          stock_code: stockCode,
          stock_name: signal.stock_name,
          date: date,
          signals: [],
          overall_success_rate: signal.overall_success_rate || 0,
          total_signal_count: 0,
          total_success_count: 0
        };
      }
      
      // 添加信号到该股票
      const signalCN = this.getSignalTypeCN(signal.signal_type || signal.signal_label);
      dateGrouped[date][stockCode].signals.push({
        ...signal,
        signal_type_cn: signalCN
      });
    });
    
    // 计算每个股票的信号类型统计
    Object.keys(dateGrouped).forEach(date => {
      Object.keys(dateGrouped[date]).forEach(stockCode => {
        const stock = dateGrouped[date][stockCode];
        // 统计信号类型
        const signalTypeCount = {};
        stock.signals.forEach(s => {
          const typeCN = s.signal_type_cn || s.signal_label || s.signal_type;
          signalTypeCount[typeCN] = (signalTypeCount[typeCN] || 0) + 1;
        });
        stock.signalTypeStats = Object.keys(signalTypeCount).map(type => ({
          type: type,
          count: signalTypeCount[type]
        }));
      });
    });
    
    // 转换为数组结构
    const result = [];
    Object.keys(dateGrouped)
      .sort((a, b) => b.localeCompare(a)) // 日期倒序
      .forEach(date => {
        const stocks = Object.values(dateGrouped[date]);
        // 按股票代码排序
        stocks.sort((a, b) => a.stock_code.localeCompare(b.stock_code));
        result.push({
          date: date,
          stocks: stocks
        });
      });
    
    return result;
  },

  /**
   * 获取信号类型中文名称
   */
  getSignalTypeCN(signalType) {
    if (!signalType) return '';
    
    // 先尝试直接匹配
    if (SIGNAL_TYPE_MAP[signalType]) {
      return SIGNAL_TYPE_MAP[signalType];
    }
    
    // 如果已经是中文，直接返回
    if (/[\u4e00-\u9fa5]/.test(signalType)) {
      return signalType;
    }
    
    // 尝试模糊匹配（不区分大小写）
    const lowerType = signalType.toLowerCase();
    for (const [key, value] of Object.entries(SIGNAL_TYPE_MAP)) {
      if (key.toLowerCase() === lowerType) {
        return value;
      }
    }
    
    // 如果包含常见关键词，尝试转换
    if (lowerType.includes('kdj') && lowerType.includes('oversold')) return 'KDJ超卖';
    if (lowerType.includes('kdj') && lowerType.includes('overbought')) return 'KDJ超买';
    if (lowerType.includes('kdj') && lowerType.includes('golden')) return 'KDJ金叉';
    if (lowerType.includes('kdj') && lowerType.includes('death')) return 'KDJ死叉';
    if (lowerType.includes('rsi') && lowerType.includes('golden')) return 'RSI金叉';
    if (lowerType.includes('rsi') && lowerType.includes('death')) return 'RSI死叉';
    if (lowerType.includes('macd') && lowerType.includes('golden')) return 'MACD金叉';
    if (lowerType.includes('macd') && lowerType.includes('death')) return 'MACD死叉';
    if (lowerType.includes('adx') && lowerType.includes('strong')) return 'ADX强势';
    if (lowerType.includes('cci') && lowerType.includes('zero') && lowerType.includes('cross')) return 'CCI零轴上穿';
    if (lowerType.includes('roc') && lowerType.includes('zero') && lowerType.includes('cross')) return 'ROC零轴上穿';
    
    // 否则返回原值（可能已经是中文标签）
    return signalType;
  },

  /**
   * 切换卡片展开/收起（现在使用stock_code+date作为key）
   */
  toggleCardExpand(e) {
    const cardId = e.currentTarget.dataset.id;
    const expandedCards = { ...this.data.expandedCards };
    
    if (expandedCards[cardId]) {
      delete expandedCards[cardId];
    } else {
      expandedCards[cardId] = true;
    }
    
    this.setData({ expandedCards });
  },

  /**
   * 点击股票代码跳转
   */
  onStockCodeTap(e) {
    const stockCode = e.currentTarget.dataset.code;
    if (!stockCode) return;
    
    // 处理股票代码格式
    let code = stockCode;
    let prefix = '';
    
    // 判断是上海还是深圳
    if (code.startsWith('sh') || code.startsWith('sz')) {
      prefix = code.substring(0, 2);
      code = code.substring(2);
    } else if (code.startsWith('6')) {
      prefix = 'sh'; // 6开头是上海
    } else if (code.startsWith('0') || code.startsWith('3')) {
      prefix = 'sz'; // 0或3开头是深圳
    }
    
    // 构建多个数据源的URL
    const urls = {
      eastmoney: `https://quote.eastmoney.com/${prefix}${code}.html`,
      sina: `https://finance.sina.com.cn/realstock/company/${prefix}${code}/nc.shtml`
    };
    
    // 显示选择菜单
    wx.showActionSheet({
      itemList: ['东方财富', '新浪财经', '复制代码'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 东方财富
          this.openStockUrl(urls.eastmoney, stockCode);
        } else if (res.tapIndex === 1) {
          // 新浪财经
          this.openStockUrl(urls.sina, stockCode);
        } else if (res.tapIndex === 2) {
          // 复制代码
          wx.setClipboardData({
            data: stockCode,
            success: () => {
              wx.showToast({
                title: '代码已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  /**
   * 打开股票URL（复制到剪贴板或提示配置业务域名）
   */
  openStockUrl(url, stockCode) {
    // 由于小程序限制，无法直接打开外部链接
    // 需要配置业务域名使用web-view，或复制链接
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: `${stockCode} 的详情页链接已复制到剪贴板，请在浏览器中打开`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  },

  /**
   * 切换规则说明展开/收起
   */
  toggleRules() {
    this.setData({
      showRules: !this.data.showRules
    });
  },

  /**
   * 切换日期分组展开/收起
   */
  toggleDateGroup(e) {
    const date = e.currentTarget.dataset.date;
    const expandedDateGroups = { ...this.data.expandedDateGroups };
    
    if (expandedDateGroups[date]) {
      expandedDateGroups[date] = false;
    } else {
      expandedDateGroups[date] = true;
    }
    
    this.setData({ expandedDateGroups });
  },

  /**
   * 切换信号列表展开/收起
   */
  toggleSignalsList(e) {
    const stockId = e.currentTarget.dataset.id;
    const expandedSignals = { ...this.data.expandedSignals };
    
    if (expandedSignals[stockId]) {
      expandedSignals[stockId] = false;
    } else {
      expandedSignals[stockId] = true;
    }
    
    this.setData({ expandedSignals });
  },

  /**
   * 切换其他日期展开/收起
   */
  async toggleOtherDate(e) {
    const date = e.currentTarget.dataset.date;
    const expandedOtherDates = { ...this.data.expandedOtherDates };
    const loadingOtherDates = { ...this.data.loadingOtherDates };
    
    if (expandedOtherDates[date]) {
      // 收起
      expandedOtherDates[date] = false;
      this.setData({ expandedOtherDates });
    } else {
      // 展开
      expandedOtherDates[date] = true;
      this.setData({ expandedOtherDates });
      
      // 如果还没有加载过该日期的数据，则加载
      if (!loadingOtherDates[date]) {
        loadingOtherDates[date] = true;
        this.setData({ loadingOtherDates });
        await this.loadOtherDate(date);
      }
    }
  },

  /**
   * 加载指定日期的详细信息
   */
  async loadOtherDate(date) {
    try {
      // 从otherDatesData中找到该日期的汇总数据
      const dateData = this.data.otherDatesData.find(d => d.date === date);
      if (!dateData || !dateData.summaries) {
        console.warn(`未找到日期 ${date} 的汇总数据`);
        return;
      }
      
      const summaries = dateData.summaries;
      
      // 按股票代码分组处理（同一天同一只股票只保留一条）
      const stockMap = {};
      summaries.forEach(summary => {
        const stockCode = summary.stock_code;
        if (!stockCode) return;
        
        if (!stockMap[stockCode]) {
          stockMap[stockCode] = {
            stock_code: stockCode,
            stock_name: summary.stock_name,
            date: date,
            report_id: summary.report_id || summary._id,
            overall_success_rate: summary.overall_success_rate || 0,
            total_signal_count: summary.total_signal_count || 0,
            signals: [] // 稍后从signal_event补充
          };
        }
      });
      
      const stocks = Object.values(stockMap).sort((a, b) => 
        a.stock_code.localeCompare(b.stock_code)
      );
      
      // 收集所有report_id
      const reportIds = stocks.map(s => s.report_id).filter(Boolean);
      
      // 使用report_id查询对应的signal_event数据
      if (reportIds.length > 0) {
        const allSignals = [];
        
        // 对每个report_id单独查询
        for (let i = 0; i < reportIds.length; i++) {
          const reportId = reportIds[i];
          try {
            const signalRes = await db.collection('stock_signals')
              .where({
                doc_type: 'signal_event',
                report_id: reportId
              })
              .limit(1000)
              .get();
            
            const signals = signalRes.data || [];
            allSignals.push(...signals);
          } catch (error) {
            console.error(`查询 ${reportId} 失败:`, error);
          }
        }
        
        // 在客户端排序
        allSignals.sort((a, b) => {
          const dateA = a.report_date || a.signal_date || '';
          const dateB = b.report_date || b.signal_date || '';
          if (dateB !== dateA) {
            return dateB.localeCompare(dateA);
          }
          const signalDateA = a.signal_date || '';
          const signalDateB = b.signal_date || '';
          return signalDateB.localeCompare(signalDateA);
        });
        
        // 将signal_event数据补充到对应的股票中
        allSignals.forEach(signal => {
          const reportId = signal.report_id;
          const stockCode = signal.stock_code;
          
          if (!reportId || !stockCode) return;
          
          const stock = stocks.find(s => 
            s.report_id === reportId && s.stock_code === stockCode
          );
          
          if (stock) {
            const signalCN = this.getSignalTypeCN(signal.signal_type || signal.signal_label);
            stock.signals.push({
              ...signal,
              metricsArray: this.formatMetrics(signal.metrics),
              signal_type_cn: signalCN
            });
          }
        });
        
        // 计算每个股票的信号类型统计
        stocks.forEach(stock => {
          const signalTypeCount = {};
          stock.signals.forEach(s => {
            const typeCN = s.signal_type_cn || s.signal_label || s.signal_type;
            signalTypeCount[typeCN] = (signalTypeCount[typeCN] || 0) + 1;
          });
          stock.signalTypeStats = Object.keys(signalTypeCount).map(type => ({
            type: type,
            count: signalTypeCount[type]
          }));
        });
      }
      
      // 更新otherDatesData中该日期的数据
      const otherDatesData = this.data.otherDatesData.map(item => {
        if (item.date === date) {
          return {
            ...item,
            stocks: stocks,
            loaded: true
          };
        }
        return item;
      });
      
      const loadingOtherDates = { ...this.data.loadingOtherDates };
      loadingOtherDates[date] = false;
      
      this.setData({
        otherDatesData: otherDatesData,
        loadingOtherDates: loadingOtherDates
      });
      
      console.log(`日期 ${date} 的数据加载完成，股票数: ${stocks.length}`);
      
    } catch (error) {
      console.error(`加载日期 ${date} 的数据失败:`, error);
      const loadingOtherDates = { ...this.data.loadingOtherDates };
      loadingOtherDates[date] = false;
      this.setData({ loadingOtherDates });
    }
  },

  /**
   * 获取信号强度等级
   */
  getSignalStrength(successRate) {
    if (successRate >= 80) return { level: '高', color: '#00c853' };
    if (successRate >= 60) return { level: '中', color: '#ff6f00' };
    return { level: '低', color: '#d32f2f' };
  },

  /**
   * 格式化日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  },

  /**
   * 检查订阅状态
   */
  async checkSubscribeStatus() {
    try {
      // 查询当前用户的订阅记录（数据库会自动根据_openid过滤）
      const res = await db.collection('stock_signals_subscriber')
        .where({
          status: 'active'
        })
        .get();
      
      this.setData({
        isSubscribed: res.data && res.data.length > 0
      });
    } catch (error) {
      console.error('检查订阅状态失败:', error);
    }
  },

  /**
   * 处理订阅
   */
  async handleSubscribe() {
    if (this.data.subscribing) return;
    
    this.setData({ subscribing: true });
    
    try {
      // 1. 请求订阅消息授权
      const templateId = '60NMuOzka6yvGWttPKA-SWlYiB0o580AmdsQBM0SHjg';
      const subscribeRes = await wx.requestSubscribeMessage({
        tmplIds: [templateId]
      });
      
      console.log('订阅消息授权结果:', subscribeRes);
      
      // 检查授权结果
      if (subscribeRes[templateId] === 'reject') {
        wx.showToast({
          title: '需要授权才能订阅',
          icon: 'none'
        });
        this.setData({ subscribing: false });
        return;
      }
      
      // 2. 检查是否已有订阅记录
      const existingRes = await db.collection('stock_signals_subscriber')
        .where({
          status: 'active'
        })
        .get();
      
      const now = new Date();
      
      if (existingRes.data && existingRes.data.length > 0) {
        // 如果已有记录，更新为活跃状态
        await db.collection('stock_signals_subscriber')
          .doc(existingRes.data[0]._id)
          .update({
            data: {
              status: 'active',
              subscribeTime: now
            }
          });
      } else {
        // 如果没有记录，创建新记录
        await db.collection('stock_signals_subscriber').add({
          data: {
            subscribeTime: now,
            status: 'active',
            lastNotifiedDate: null
          }
        });
      }
      
      // 3. 更新UI状态
      this.setData({
        isSubscribed: true,
        subscribing: false
      });
      
      wx.showToast({
        title: '订阅成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('订阅失败:', error);
      wx.showToast({
        title: '订阅失败，请重试',
        icon: 'none'
      });
      this.setData({ subscribing: false });
    }
  },

  /**
   * 处理取消订阅
   */
  async handleUnsubscribe() {
    if (this.data.unsubscribing) return;
    
    // 确认对话框
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '确认取消订阅',
        content: '取消后将不再收到股票信号推送通知',
        success: (res) => resolve(res.confirm),
        fail: () => resolve(false)
      });
    });
    
    if (!res) return;
    
    this.setData({ unsubscribing: true });
    
    try {
      // 更新订阅状态为inactive（数据库会自动根据_openid过滤）
      const subscriberRes = await db.collection('stock_signals_subscriber')
        .where({
          status: 'active'
        })
        .get();
      
      if (subscriberRes.data && subscriberRes.data.length > 0) {
        const promises = subscriberRes.data.map(item => 
          db.collection('stock_signals_subscriber').doc(item._id).update({
            data: {
              status: 'inactive'
            }
          })
        );
        
        await Promise.all(promises);
      }
      
      // 更新UI状态
      this.setData({
        isSubscribed: false,
        unsubscribing: false
      });
      
      wx.showToast({
        title: '已取消订阅',
        icon: 'success'
      });
    } catch (error) {
      console.error('取消订阅失败:', error);
      wx.showToast({
        title: '取消订阅失败，请重试',
        icon: 'none'
      });
      this.setData({ unsubscribing: false });
    }
  },

  /**
   * 将metrics对象转换为数组（用于WXML渲染）
   */
  formatMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') return [];
    return Object.keys(metrics).map(key => ({
      key: key,
      value: metrics[key]
    }));
  }
});
