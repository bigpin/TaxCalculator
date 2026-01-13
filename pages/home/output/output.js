// pages/home/output.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        getComponent() {
            const com = this.selectComponent("#o");
            if (!com) {
                console.error(`Component with ID '#o' not found`);
            }
            return com;
        },
        updateText(value, add=false) {
            const com = this.getComponent();
            if (com) {
                const newValue = add ? com.data.value + value : value;
                com.updateValue(newValue);
            }
        },
        clearText() {
            const com = this.getComponent();
            if (com) {
                com.updateValue("");
            }
        }
    }
})