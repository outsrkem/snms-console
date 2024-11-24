<template>
    <div>
        <my-header title="班级管理"></my-header>
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
            <div>
                <h3 style="margin-bottom: 15px; margin-top: 15px">创建班级</h3>
            </div>
        </div>
        <div class="reminder">
            <p>班级码为3位数，最高位是年级，低2位是班级</p>
            <p>班级码取值范围：[101,999]，示例如下：</p>
            <p>一年级（3）班 ：103</p>
            <p>一年级（11）班 ：111</p>
            <p>五年级（24）班 ：524</p>
        </div>
        <el-form label-position="top" label-width="auto" :model="fromData" :rules="rules">
            <el-form-item label="输入班级码" prop="clsCode">
                <el-input v-model.number="clsCode" clearable placeholder="示例：304"> </el-input>
            </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: center; align-items: center">
            <el-button style="width: 100%" type="primary" @click="onCreateClass()">创建班级</el-button>
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
            clsCode: "", // 班级代码
            rules: {
                clsCode: [],
            },
        };
    },
    methods: {
        loadCreateClass() {
            const data = { cls: { code: this.clsCode } };
            CreateClass(data)
                .then(() => {
                    ElMessage({
                        showClose: true,
                        message: "创建成功.",
                        type: "success",
                        duration: 2000,
                        grouping: true,
                        plain: true,
                    });
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "warning" });
                    } else {
                        ElMessage({
                            showClose: true,
                            message: `创建失败，请检查班级是否已经存在`,
                            type: "error",
                            duration: 2000,
                            grouping: true,
                            plain: true,
                        });
                    }
                });
        },
        onCreateClass() {
            if (this.clsCode === "") {
                ElMessage({
                    showClose: true,
                    message: "请输入班级码",
                    type: "error",
                    duration: 2000,
                    grouping: true,
                    plain: true,
                });
                return;
            }
            if (!Number.isInteger(this.clsCode)) {
                ElMessage({
                    showClose: true,
                    message: "班级码不是整数",
                    type: "error",
                    duration: 2000,
                    grouping: true,
                    plain: true,
                });
                return;
            }
            if (this.clsCode < 101 || this.clsCode > 999) {
                ElMessage({
                    showClose: true,
                    message: "班级码必须大于101小于999",
                    type: "error",
                    duration: 2000,
                    grouping: true,
                    plain: true,
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
