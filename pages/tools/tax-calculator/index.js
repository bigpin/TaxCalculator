// pages/tools/tax-calculator/index.js
Page({
    data: {
        salary: '50000',
        old: '8',
        lost: '0.5',
        medical: '2',
        housingProvidentFund: '12',
        attch: '6000',
        salaryErr: false,
        oldErr: false,
        lostErr: false,
        medicalErr: false,
        housingProvidentFundErr: false,
        attchErr: false,
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

        const monthlyNetSalaryArray = this.calculateMonthlyNetSalary(monthlySalary, old, lost, medical, hpf, attch);
        
        // 更新结果列表
        const resultList = monthlyNetSalaryArray.map((netSalary, index) => {
            this.data.detailInfo.push({
                month: `${index + 1}月`,
                info: this.formatTaxInfo(netSalary)
            });

            return {
                name: `${index + 1}月`,
                label: `${netSalary.salary.toFixed(2)}, 累积缴个税：${netSalary.tax.toFixed(2)}`
            };
        });

        this.setData({
            monthlyNetSalaryArray: monthlyNetSalaryArray,
            resultList: resultList
        });

        // 保存到全局数据
        getApp().globalData.currentTaxInfo = monthlyNetSalaryArray;
    },

    // 计算每月净工资
    calculateMonthlyNetSalary(monthlySalary, old, lost, medical, hpf, attch) {
        const socialInsuranceRate = old + lost + medical + hpf;
        const taxThreshold = 5000;
        const taxRates = [0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45];
        const quickDeductions = [0, 2520, 16920, 31920, 52920, 85920, 181920];
        const keyDots = [36000, 144000, 300000, 420000, 660000, 960000];

        const monthlyNetSalaryArray = [];
        const socialInsurance = monthlySalary * socialInsuranceRate + 3;
        const attchDeduction = attch;
        const taxableIncome = monthlySalary - socialInsurance - attchDeduction - taxThreshold;

        let totalTax = 0;
        for (let i = 1; i <= 12; i++) {
            if (taxableIncome < 0) {
                monthlyNetSalaryArray.push({ 
                    "salary": monthlySalary - socialInsurance, 
                    "tax": totalTax,
                    "old": monthlySalary * old,
                    "lost": monthlySalary * lost,
                    "medical": monthlySalary * medical + 3,
                    "house": monthlySalary * hpf
                });
                continue;
            }
            
            let totaltaxableIncome = taxableIncome * i;
            let currentTax = 0;
            
            for (let j = 0; j < keyDots.length - 1; j++) {
                if (totaltaxableIncome <= keyDots[0]) {
                    currentTax = totaltaxableIncome * taxRates[j];
                    break;
                }

                if (totaltaxableIncome > keyDots[j] && totaltaxableIncome <= keyDots[j + 1]) {
                    currentTax = totaltaxableIncome * taxRates[j + 1] - quickDeductions[j + 1] - totalTax;
                    break;
                }
            }
            if (totaltaxableIncome > 960000) {
                currentTax = totaltaxableIncome * taxRates[taxRates.length - 1] - quickDeductions[quickDeductions.length - 1] - totalTax;
            }

            const netSalary = monthlySalary - socialInsurance - currentTax;
            totalTax += currentTax;

            monthlyNetSalaryArray.push({
                "salary": netSalary,
                "old": monthlySalary * old,
                "lost": monthlySalary * lost,
                "medical": monthlySalary * medical + 3,
                "house": monthlySalary * hpf,
                "tax": totalTax
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
累积缴个税：${netSalary.tax.toFixed(2)}元`;
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
