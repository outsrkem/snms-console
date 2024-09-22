<template>
    <div>
        <my-header title="班级添加教师"></my-header>
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center">
            <div>
                <h3 style="margin-bottom: 15px; margin-top: 15px">班级添加教师</h3>
            </div>
        </div>
        <div class="reminder">
            <p>如果班级没有添加教师，则教师登录后选不到班级。</p>
            <p>教师账号创建后，需要登录一次营养餐系统，才能在这里选到。</p>
        </div>
        <el-text></el-text>
        <el-form label-position="top" label-width="auto" :model="fromData" size="large">
            <el-form-item label="选择班级">
                <el-select v-model="classId">
                    <el-option v-for="(item, index) in classList" :key="index" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="选择教师">
                <el-select v-model="teacherId">
                    <el-option v-for="(item, index) in teacherlist" :key="index" :label="item.compellation" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: center; align-items: center">
            <el-button style="width: 100%" size="large" type="primary" @click="onClassAddTea()">添加</el-button>
        </div>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { ElMessage } from "element-plus";
import { GetAllTeacher, GetAllClass, ClassAddTeacher } from "@/api/index.js";
export default {
    name: "ClassAddTeacher",
    components: { MyHeader },
    props: {},
    data() {
        return {
            fromData: {},
            teacherlist: "",
            classList: "",
            teacherId: "",
            classId: "",
        };
    },
    methods: {
        loadGetAllTeacher: function () {
            const params = { page: 1, page_size: 200 };
            GetAllTeacher(params)
                .then((res) => {
                    this.teacherlist = res.payload.items;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "error" });
                    } else {
                        ElMessage({
                            showClose: true,
                            message: err.data,
                            type: "error",
                            duration: 0,
                            grouping: true,
                        });
                    }
                });
        },
        loadGetAllClass: function () {
            const params = { page: 1, page_size: 200 };
            GetAllClass(params)
                .then((res) => {
                    this.classList = res.payload.class;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "error" });
                    } else {
                        ElMessage({
                            showClose: true,
                            message: err.data,
                            type: "error",
                            duration: 0,
                            grouping: true,
                        });
                    }
                });
        },
        loadClassAddTeacher: function () {
            const data = {
                cid: [this.classId],
                tid: [this.teacherId],
            };
            ClassAddTeacher(data)
                .then(() => {
                    ElMessage({
                        showClose: true,
                        message: "添加成功.",
                        type: "success",
                        duration: 0,
                        grouping: true,
                    });
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "error" });
                    } else {
                        ElMessage({
                            showClose: true,
                            message: "添加失败",
                            type: "error",
                            duration: 0,
                            grouping: true,
                        });
                    }
                });
        },
        onClassAddTea() {
            if (this.classId === "" || this.teacherId === "") {
                ElMessage({
                    showClose: true,
                    message: "未选择班级或教师",
                    type: "error",
                    duration: 0,
                    grouping: true,
                });
                return;
            }
            this.loadClassAddTeacher();
        },
    },
    created() {
        this.loadGetAllTeacher();
        this.loadGetAllClass();
    },
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
.reminder {
    width: auto;
    padding-left: 10px;
    padding-right: 10px;
    border: 1px solid #0a691ee8;
    margin-bottom: 20px;
    background-color: lavenderblush;
    border-radius: 5px;
    p {
        margin-bottom: 5px;
        margin-top: 5px;
        font-size: 12px;
        color: mediumblue;
    }
}
</style>
