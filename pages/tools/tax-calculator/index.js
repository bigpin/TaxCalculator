// pages/tools/tax-calculator/index.js
Page({
    data: {
        salary: '50000',
        old: '8',
        lost: '0.5',
        medical: '2',
        housingProvidentFund: '12',
        attch: '6000',
        pension: '0',
        salaryErr: false,
        oldErr: false,
        lostErr: false,
        medicalErr: false,
        housingProvidentFundErr: false,
        attchErr: false,
        pensionErr: false,
        monthlyNetSalaryArray: [],
        detailInfo: [],
        resultList: []
    },

    onLoad() {
        // 组件引用将在 ready 中初始化
    },

    onReady() {
        // 在组件渲染完成后初始化引用
        this.initInputRefs();
    },

    initInputRefs() {
        this.salaryInput = this.selectComponent('#salary');
        this.oldInput = this.selectComponent('#old');
        this.lostInput = this.selectComponent('#lost');
        this.medicalInput = this.selectComponent('#medical');
        this.housingProvidentFundInput = this.selectComponent('#HousingProvidentFund');
        this.attchInput = this.selectComponent('#attach');
        this.pensionInput = this.selectComponent('#pension');
    },

    // 输入验证
    onTexInput(e) {
        const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);

        switch (e.currentTarget.id) {
            case 'salary':
                this.setData({ salaryErr: !isNumber });
                break;
            case 'old':
                this.setData({ oldErr: !isNumber });
                break;
            case 'lost':
                this.setData({ lostErr: !isNumber });
                break;
            case 'medical':
                this.setData({ medicalErr: !isNumber });
                break;
            case 'HousingProvidentFund':
                this.setData({ housingProvidentFundErr: !isNumber });
                break;
            case 'attach':
                this.setData({ attchErr: !isNumber });
                break;
            case 'pension':
                this.setData({ pensionErr: !isNumber });
                break;
        }
    },

    // 恢复默认值
    resetValues() {
        if (this.salaryInput) this.salaryInput.updateValue(this.data.salary);
        if (this.oldInput) this.oldInput.updateValue(this.data.old);
        if (this.lostInput) this.lostInput.updateValue(this.data.lost);
        if (this.medicalInput) this.medicalInput.updateValue(this.data.medical);
        if (this.housingProvidentFundInput) this.housingProvidentFundInput.updateValue(this.data.housingProvidentFund);
        if (this.attchInput) this.attchInput.updateValue(this.data.attch);
        if (this.pensionInput) this.pensionInput.updateValue(this.data.pension);
        this.setData({
            monthlyNetSalaryArray: [],
            detailInfo: [],
            resultList: []
        });
    },

    // 获取输入值的辅助方法
    getInputValue(component, defaultValue) {
        if (component && component.data && component.data.value) {
            return component.data.value;
        }
        return defaultValue;
    },

    // 计算
    calculate() {
        // 确保组件引用已初始化
        if (!this.salaryInput) {
            this.initInputRefs();
        }
        
        const monthlySalary = this.getInputValue(this.salaryInput, this.data.salary);
        const old = this.getInputValue(this.oldInput, this.data.old) / 100.0;
        const lost = this.getInputValue(this.lostInput, this.data.lost) / 100.0;
        const medical = this.getInputValue(this.medicalInput, this.data.medical) / 100.0;
        const hpf = this.getInputValue(this.housingProvidentFundInput, this.data.housingProvidentFund) / 100.0;
        const attch = this.getInputValue(this.attchInput, this.data.attch);
        const pension = this.getInputValue(this.pensionInput, this.data.pension);

        const monthlyNetSalaryArray = this.calculateMonthlyNetSalary(monthlySalary, old, lost, medical, hpf, attch, pension);
        
        // 更新结果列表（避免多次点击计算导致 detailInfo 叠加）
        const detailInfo = [];
        const resultList = monthlyNetSalaryArray.map((netSalary, index) => {
            detailInfo.push({
                month: `${index + 1}月`,
                info: this.formatTaxInfo(netSalary),
            });

            return {
                name: `${index + 1}月`,
                label: `${netSalary.salary.toFixed(2)}, 本月个税：${(netSalary.monthTax || 0).toFixed(2)}, 累计个税：${(netSalary.cumTax || 0).toFixed(2)}`,
            };
        });

        this.setData({
            monthlyNetSalaryArray: monthlyNetSalaryArray,
            resultList: resultList,
            detailInfo,
        });

        // 保存到全局数据
        getApp().globalData.currentTaxInfo = monthlyNetSalaryArray;
    },

    // 计算累计应纳税额（综合所得预扣预缴：累计预扣法）
    // cumulativeTaxableIncome: 当年累计应纳税所得额（>=0）
    calcCumulativeTax(cumulativeTaxableIncome) {
        const taxRates = [0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45];
        const quickDeductions = [0, 2520, 16920, 31920, 52920, 85920, 181920];
        const thresholds = [36000, 144000, 300000, 420000, 660000, 960000];

        let level = 0;
        while (level < thresholds.length && cumulativeTaxableIncome > thresholds[level]) {
            level++;
        }
        const rate = taxRates[level];
        const quick = quickDeductions[level];
        return cumulativeTaxableIncome * rate - quick;
    },

    // 计算每月净工资
    calculateMonthlyNetSalary(monthlySalary, old, lost, medical, hpf, attch, pension) {
        const socialInsuranceRate = old + lost + medical + hpf;
        const taxThreshold = 5000;

        const monthlyNetSalaryArray = [];
        const salaryNum = parseFloat(monthlySalary);
        const attchDeduction = parseFloat(attch || 0);
        const pensionDeduction = parseFloat(pension || 0);
        const socialInsurance = salaryNum * socialInsuranceRate + 3;
        // 个人养老金（年限额 12000，按月不超过 1000）
        const pensionDeductionCapped = Math.min(pensionDeduction, 1000);
        // 每月应纳税所得额（当月）：工资 - 五险一金 - 专项附加扣除 - 个人养老金 - 起征点
        const monthlyTaxableIncome = salaryNum - socialInsurance - attchDeduction - pensionDeductionCapped - taxThreshold;

        let totalTaxPaid = 0; // 已累计缴税（用于计算本月应缴）
        for (let i = 1; i <= 12; i++) {
            // 当月应纳税所得额为负：本月不缴税
            if (monthlyTaxableIncome <= 0) {
                monthlyNetSalaryArray.push({ 
                    "salary": salaryNum - socialInsurance, 
                    "monthTax": 0,
                    "cumTax": totalTaxPaid,
                    "old": salaryNum * old,
                    "lost": salaryNum * lost,
                    "medical": salaryNum * medical + 3,
                    "house": salaryNum * hpf,
                    "pension": pensionDeductionCapped
                });
                continue;
            }
            
            const cumulativeTaxableIncome = monthlyTaxableIncome * i;
            const cumulativeTax = this.calcCumulativeTax(cumulativeTaxableIncome);
            // 本月应缴税 = 累计应纳税额 - 已累计缴税
            let currentTax = cumulativeTax - totalTaxPaid;
            if (currentTax < 0) currentTax = 0;

            const netSalary = salaryNum - socialInsurance - currentTax;
            totalTaxPaid += currentTax;

            monthlyNetSalaryArray.push({
                "salary": netSalary,
                "old": salaryNum * old,
                "lost": salaryNum * lost,
                "medical": salaryNum * medical + 3,
                "house": salaryNum * hpf,
                "pension": pensionDeductionCapped,
                "monthTax": currentTax,
                "cumTax": totalTaxPaid
            });
        }

        return monthlyNetSalaryArray;
    },

    // 格式化税务信息
    formatTaxInfo(netSalary) {
        return `实际入账：${netSalary.salary.toFixed(2)}元
养老保险：${netSalary.old.toFixed(2)}元
失业保险：${netSalary.lost.toFixed(2)}元
医疗保险：${netSalary.medical.toFixed(2)}元
住房公积金：${netSalary.house.toFixed(2)}元
个人养老金：${(netSalary.pension || 0).toFixed(2)}元
本月个税：${(netSalary.monthTax || 0).toFixed(2)}元
累计缴个税：${(netSalary.cumTax || 0).toFixed(2)}元`;
    },

    // 按钮点击事件
    onTap(e) {
        if (e.detail.buttonId === 'reset') {
            return this.resetValues();
        }
        if (e.detail.buttonId === 'cal') {
            return this.calculate();
        }
    },

    // 点击结果项
    clickHandle(e) {
        const item = e.detail;
        const index = parseInt(item.name) - 1;
        if (this.data.detailInfo[index]) {
            wx.navigateTo({
                url: `/pages/detail/detail?index=${index}`
            });
        }
    }
});
