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
        updateText(value, add=false) {
            const com = this.selectComponent("#o");
            console.log(value)
            if (add) {
                com.updateValue(com.data.value + value);
            } else {
                com.updateValue(value);
            }
        },
        clearText() {
            const com = this.selectComponent("#o");
            com.updateValue("");
        }
    }
})