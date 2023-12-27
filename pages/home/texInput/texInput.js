// pages/home/texInput.js

Component({

    /**
     * 组件的属性列表
     */
    properties: {
        salaryInput: Object,
        oldInput: Object,
        lostInput: Object,
        medicalInput: Object,
        housingProvidentFundInput: Object,
        attchInput: Object,
    },

    /**
     * 组件的初始数据
     */
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
        monthlyNetSalaryArray: []
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            this.salaryInput = this.selectComponent('#salary');
            this.oldInput = this.selectComponent('#old');
            this.lostInput = this.selectComponent('#lost');
            this.medicalInput = this.selectComponent('#medical');
            this.housingProvidentFundInput = this.selectComponent('#HousingProvidentFund');
            this.attchInput = this.selectComponent('#attach');
        },
        moved: function () { },
        detached: function () { },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        resetValues(e) {
            this.salaryInput.updateValue(this.data.salary);
            this.oldInput.updateValue(this.data.old);
            this.lostInput.updateValue(this.data.lost);
            this.medicalInput.updateValue(this.data.medical);
            this.housingProvidentFundInput.updateValue(this.data.housingProvidentFund);
            this.attchInput.updateValue(this.data.attch);
        },
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
                case 'attch':
                    this.setData({ attchErr: !isNumber });
                    break;
            }

        },
        cal(e) {
            // 输出每个月的实际入账金额
            let monthlySalary = (this.salaryInput.data.value ? this.salaryInput.data.value : this.data.salary);
            // 养老
            let old = (this.oldInput.data.value ? this.oldInput.data.value : this.data.old) / 100.0;
            // 失业
            let lost = (this.lostInput.data.value ? this.lostInput.data.value : this.data.lost) / 100.0;
            // 医疗
            let medical = (this.medicalInput.data.value ? this.medicalInput.data.value : this.data.medical) / 100.0;
            // 获取住房公积金税率
            let hpf = (this.housingProvidentFundInput.data.value ? this.housingProvidentFundInput.data.value : this.data.housingProvidentFund) / 100.0;
            // 专项附加扣除
            let attch = (this.attchInput.data.value ? this.attchInput.data.value : this.data.attch);

            this.monthlyNetSalaryArray = this.calculateMonthlyNetSalary(monthlySalary, old,
                lost, medical, hpf, attch);

            console.log("每个月的实际入账金额：");
            this.monthlyNetSalaryArray.forEach((netSalary, index) => {
                console.log(`第${index + 1}月：${netSalary.salary.toFixed(2)}, 交税：${netSalary.tax.toFixed(2)}`);
            });
        },
        calculateMonthlyNetSalary(monthlySalary, old, lost, medical, hpf, attch) {
            // 五险一金比例，可根据实际情况修改
            const socialInsuranceRate = old + lost + medical + hpf; // 社会保险公积金

            // 个人所得税起征点和税率，可根据实际情况修改
            const taxThreshold = 5000; // 起征点
            const taxRates = [0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]; // 税率
            const quickDeductions = [0, 2520, 16920, 31920, 52920, 85920, 181920];
            const keyDots = [36000, 144000, 300000, 420000, 660000, 960000];

            // 计算每个月的实际入账金额
            const monthlyNetSalaryArray = [];

            // 计算五险一金
            const socialInsurance = monthlySalary * socialInsuranceRate + 3;
            const attchDeduction = attch;

            // 计算应纳税所得额，还需要减掉附加项
            const taxableIncome = monthlySalary - socialInsurance - attchDeduction - taxThreshold;

            let totalTax = 0;
            for (let i = 1; i <= 12; i++) {
                if (taxableIncome < 0) {
                    // 存储每个月的实际入账金额
                    monthlyNetSalaryArray.push({ "salary": monthlySalary - socialInsurance, "tax": totalTax });

                    continue;
                }
                // 第i个月税后总收入
                let totaltaxableIncome = taxableIncome * i;
                let currentTax = 0;
                // 使用速算数
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

                // 计算实际入账金额
                const netSalary = monthlySalary - socialInsurance - currentTax;
                totalTax += currentTax;

                // 存储每个月的实际入账金额
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
        }

    }
})