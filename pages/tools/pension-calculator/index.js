// pages/tools/pension-calculator/index.js
Page({
    data: {
        salary: '50000',
        salaryErr: false,
        result: null
    },

    onLoad() {
        this.salaryInput = this.selectComponent('#salary');
    },

    // 输入验证
    onTexInput(e) {
        const isNumber = /^\d+(\.\d+)?$/.test(e.detail.value);
        if (e.currentTarget.id === 'salary') {
            this.setData({ salaryErr: !isNumber });
        }
    },

    // 恢复默认值
    resetValues() {
        if (this.salaryInput) {
            this.salaryInput.updateValue(this.data.salary);
        }
        this.setData({
            result: null
        });
        const output = this.selectComponent('#taxInfo');
        if (output) {
            output.clearText();
        }
    },

    // 计算
    calculate() {
        const yeb = parseInt(this.salaryInput.data.value ? this.salaryInput.data.value : this.data.salary);
        const result = this.calculateYearEndBounds(yeb);
        
        this.setData({
            result: result
        });

        // 显示结果
        const output = this.selectComponent('#taxInfo');
        if (output) {
            const resultText = `年终奖总计：${result.salary}元\n税率：${result.tax_rate.toFixed(2)}%\n交税：${result.tax.toFixed(2)}元\n余额：${result.balance.toFixed(2)}元`;
            output.updateText(resultText);
        }
    },

    // 计算年终奖
    calculateYearEndBounds(yeb) {
        const taxRates = [0.03, 0.1, 0.2, 0.25, 0.3, 0.35, 0.45];
        const quickDeductions = [0, 210, 1410, 2660, 4410, 7160, 15160];
        const keyDots = [3000, 12000, 25000, 35000, 55000, 80000];

        let totalTax = 0;
        let yeb_monthly = yeb / 12;
        let tax_rate = 0;

        for (let j = 0; j < keyDots.length - 1; j++) {
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
    },

    // 按钮点击事件
    onTap(e) {
        if (e.detail.buttonId === 'reset') {
            return this.resetValues();
        }
        if (e.detail.buttonId === 'cal') {
            return this.calculate();
        }
    }
});
