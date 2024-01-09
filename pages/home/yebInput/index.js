// pages/home/texInput.js

Component({

    /**
     * 组件的属性列表
     */
    properties: {
        salaryInput: Object,
        // oldInput: Object,
        // lostInput: Object,
        // medicalInput: Object,
        // housingProvidentFundInput: Object,
        // attchInput: Object,
    },

    /**
     * 组件的初始数据
     */
    data: {
        salary: '50000',
        // old: '8',
        // lost: '0.5',
        // medical: '2',
        // housingProvidentFund: '12',
        // attch: '6000',
        salaryErr: false,
        oldErr: false,
        lostErr: false,
        medicalErr: false,
        housingProvidentFundErr: false,
        attchErr: false,
        yebAndTax: {}
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        attached: function () {
            this.salaryInput = this.selectComponent('#salary');
            // this.oldInput = this.selectComponent('#old');
            // this.lostInput = this.selectComponent('#lost');
            // this.medicalInput = this.selectComponent('#medical');
            // this.housingProvidentFundInput = this.selectComponent('#HousingProvidentFund');
            // this.attchInput = this.selectComponent('#attach');
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
            // this.oldInput.updateValue(this.data.old);
            // this.lostInput.updateValue(this.data.lost);
            // this.medicalInput.updateValue(this.data.medical);
            // this.housingProvidentFundInput.updateValue(this.data.housingProvidentFund);
            // this.attchInput.updateValue(this.data.attch);
        },
        onTexInput(e) {
            const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);

            switch (e.currentTarget.id) {
                case 'salary':
                    this.setData({ salaryErr: !isNumber });
                    break;
                // case 'old':
                //     this.setData({ oldErr: !isNumber });
                //     break;
                // case 'lost':
                //     this.setData({ lostErr: !isNumber });
                //     break;
                // case 'medical':
                //     this.setData({ medicalErr: !isNumber });
                //     break;
                // case 'HousingProvidentFund':
                //     this.setData({ housingProvidentFundErr: !isNumber });
                //     break;
                // case 'attch':
                //     this.setData({ attchErr: !isNumber });
                //     break;
            }

        },
        cal(e) {
            // 输出年终奖金额
            let yeb = parseInt(this.salaryInput.data.value ? this.salaryInput.data.value : this.data.salary);

            this.yebAndTax = this.calculateYearEndBounds(yeb);

            console.log("年终奖需要缴税金额：");
            console.log(`年终奖总计：${this.yebAndTax.salary}\n交税：${this.yebAndTax.tax.toFixed(2)}\n余额：${this.yebAndTax.balance.toFixed(2)}`);
        },
        calculateYearEndBounds(yeb) {
            const taxRates = [0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45]; // 税率
            const quickDeductions = [0, 210, 1410, 2660, 4410, 7160, 15160];
            const keyDots = [3000, 12000, 25000, 35000, 55000, 80000];

            let totalTax = 0;
            let yeb_monthly = yeb / 12;
            let tax_rate = 0
            // 使用速算数
            for (let j = 0; j < keyDots.length - 1; j++) {
                // 小于1500则不用缴税
                if (yeb_monthly <= keyDots[0]) {
                    tax_rate = taxRates[0];
                    totalTax = yeb * taxRates[0] - quickDeductions[0];
                    break;
                }

                if (yeb_monthly > keyDots[j] && yeb_monthly <= keyDots[j + 1]) {
                    tax_rate = taxRates[j + 1];
                    totalTax = yeb * taxRates[j + 1] - quickDeductions[j + 1];
                    break;
                }
            }
            if (yeb_monthly > 80000) {
                tax_rate = taxRates[taxRates.length - 1];
                totalTax = yeb * taxRates[taxRates.length - 1] - quickDeductions[quickDeductions.length - 1];
            }

            return {
                "salary": yeb,
                "tax_rate": tax_rate * 100,
                "tax": totalTax,
                "balance": yeb - totalTax
            };
        }

    }
})