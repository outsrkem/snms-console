<template>
    <div>
        <router-view />
    </div>
</template>

<script>
import { Resume } from "./api/index.js";
import { loadOptions } from "./utils/common.js";

export default {
    name: "App",
    methods: {
        // 初始化 resume 配置（异步方法规范写法）
        async initResume() {
            await Resume();
        },
    },

    // 生命周期：页面创建时执行全局初始化
    created() {
        this.initResume();
        loadOptions(); // 加载全局公共选项
    },
};
</script>

<style scoped></style>
