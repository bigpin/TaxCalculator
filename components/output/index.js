Component({
    properties: {
        label: {
            type: String,
            value: "信息:"
        },
        placeholder: {
            type: String,
            value: "请输入"
        }
    },

    data: {
        value: ""
    },

    methods: {
        updateText(value, add = false) {
            const newValue = add ? this.data.value + value : value;
            this.setData({ value: newValue });
        },
        clearText() {
            this.setData({ value: "" });
        },
        getValue() {
            return this.data.value;
        }
    }
});
