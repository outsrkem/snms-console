<template>
    <div>
        <my-header title="班级管理"></my-header>
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
            <div>
                <h3 style="margin-bottom: 15px; margin-top: 15px">创建班级</h3>
            </div>
        </div>
        <el-form label-position="top" label-width="auto" :model="fromData" size="large">
            <el-form-item label="输入年级">
                <el-input v-model="yearClass" @input="initClassData()" placeholder="示例：三年级">
                    <template #prepend>输入年级</template>
                </el-input>
            </el-form-item>
            <el-form-item label="输入班级（输入阿拉伯数字即可）">
                <el-input v-model.number="NoClass" @input="initClassData()" placeholder="示例：3">
                    <template #prepend>输入班级</template>
                </el-input>
            </el-form-item>
        </el-form>
        <div style="margin-bottom: 30px">
            <p>当前输入的班级是：{{ className }}</p>
        </div>
        <div style="display: flex; justify-content: center; align-items: center">
            <el-button style="width: 100%" size="large" type="primary" @click="onCreateClass()">创建班级</el-button>
        </div>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { ElMessage } from "element-plus";
import { CreateClass } from "@/api/index.js";
export default {
    name: "StuClass",
    components: { MyHeader },
    data() {
        return {
            fromData: {},
            teacherlist: "",
            teacherId: "",
            yearClass: "", //年级
            NoClass: "", // 班
            className: "", //班级名称
        };
    },
    methods: {
        loadCreateClass() {
            const data = { name: this.className };
            CreateClass(data)
                .then(() => {
                    ElMessage({
                        showClose: true,
                        message: "创建成功.",
                        type: "success",
                        duration: 0,
                        grouping: true,
                    });
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "warning" });
                    } else {
                        ElMessage({
                            showClose: true,
                            message: `创建失败${err.data.metadata.message}`,
                            type: "error",
                            duration: 0,
                            grouping: true,
                        });
                    }
                });
        },
        initClassData() {
            let a = this.yearClass;
            let b = this.NoClass;
            this.className = `${a}（${b}）班`;
        },
        onCreateClass() {
            if (this.yearClass == "") {
                ElMessage({
                    showClose: true,
                    message: "请输入年级",
                    type: "error",
                    duration: 0,
                    grouping: true,
                });
                return;
            }
            if (this.NoClass === "") {
                ElMessage({
                    showClose: true,
                    message: "请输入班级",
                    type: "error",
                    duration: 0,
                    grouping: true,
                });
                return;
            }
            if (!Number.isInteger(this.NoClass)) {
                ElMessage({
                    showClose: true,
                    message: "班级不是整数",
                    type: "error",
                    duration: 0,
                    grouping: true,
                });
                return;
            }
            this.loadCreateClass();
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
