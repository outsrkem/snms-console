<template>
    <div>
        <div style="display: flex; justify-content: center; align-items: center">
            <h3>学生营养餐就餐记录系统</h3>
        </div>
        <el-divider style="margin-top: 10px; margin-bottom: 10px" />
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onSkipTo('meals')">登记就餐数据</el-button>
        </div>
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onSkipTo('report')">查看报表</el-button>
        </div>
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onSkipTo('record')">查看记录明细</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: "HomeIndex",
    components: {},
    props: {},
    data() {
        return {};
    },
    methods: {
        onSkipTo(val) {
            this.$router.push({ name: val });
        },
    },
    created() {},
};
</script>

<style scoped lang="less">
.line-row {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 35px;
}
h3 {
    margin-top: 0px;
    margin-bottom: 0px;
}
</style>
