<template>
    <div>
        <div class="head-container">
            <div>
                <h3>{{ schoolName }}</h3>
            </div>
            <div>
                <h4>学生营养餐就餐记录系统</h4>
            </div>
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
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onSkipTo('stuclass')">班级管理</el-button>
        </div>
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onSkipTo('classAddTeacher')">班级教师管理</el-button>
        </div>
        <div class="line-row">
            <el-button style="width: 100%" size="large" type="primary" plain @click="onToConsole()">返回控制台</el-button>
        </div>
    </div>
</template>

<script>
import { toConsole } from "@/utils/common.js";
export default {
    name: "HomeIndex",
    components: {},
    props: {},
    data() {
        return {
            // schoolName: "",
        };
    },
    computed: {
        schoolName() {
            return window.localStorage.getItem("SCHOOL_NAME");
        },
    },
    methods: {
        onSkipTo(val) {
            this.$router.push({ name: val });
        },
        onToConsole() {
            toConsole();
        },
    },
    created() {},
};
</script>

<style scoped lang="less">
.head-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
h3 {
    margin-top: 0px;
    margin-bottom: 0px;
}
h4 {
    margin-top: 5px;
    margin-bottom: 0px;
}
.line-row {
    width: 100%;
    margin-top: 20px;
    margin-bottom: 35px;
}
</style>
