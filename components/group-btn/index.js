Component({
    properties: {
        first: { 
            type: String,
            value: "恢复默认值"
        },
        second: { 
            type: String,
            value: "计算"
        },
    },
    methods: {
        onTap(e) {
            this.triggerEvent("tap", { 'buttonId': e.target.id });
        },
    }
});
