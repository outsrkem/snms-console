<template>
    <div>
        <my-header title="班级添加教师"></my-header>
        <el-tabs v-model="tabsActiveName" class="demo-tabs" @tab-change="onChangeTabs">
            <el-tab-pane label="班级添加教师" name="first">
                <div>
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
            </el-tab-pane>
            <el-tab-pane label="解除绑定关系" name="second">
                <div>
                    <el-collapse v-model="collapseActiveName" accordion @change="onCollapse">
                        <el-collapse-item v-for="(item, index) in classDetails" :key="index" :title="item.name" :name="item.id">
                            <div v-for="(item, index) in item.teachers" :key="index">
                                <div class="teacher-info" style="margin-bottom: 10px">
                                    <span>教师：{{ item.compellation }}</span>
                                    <el-button size="small" type="primary" @click="onUnbindClass(item.id)">解绑</el-button>
                                </div>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { msgcon } from "@/utils/message.js";
import { GetAllTeacher, GetAllClass, ClassAddTeacher, GetClassesDetails, DeleteClassesTeacher } from "@/api/index.js";
export default {
    name: "ClassAddTeacher",
    components: { MyHeader },
    props: {},
    data() {
        return {
            tabsActiveName: "first",
            collapseActiveName: "",
            fromData: {},
            teacherlist: "",
            classList: "",
            teacherId: "",
            classId: "",
            teachers: [],
            classDetails: [],
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
                        this.$message.warning(msgcon("您没有权限"));
                    } else {
                        this.$message.error(msgcon("系统错误"));
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
                        this.$message.warning(msgcon("您没有权限"));
                    } else {
                        this.$message.error(msgcon("系统错误"));
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
                    this.$message.success(msgcon("添加成功"));
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                    } else {
                        this.$message.error(msgcon("添加失败"));
                    }
                });
        },
        loadGetClassesDetails: function () {
            // const paths = { class_id: class_id };
            const params = { page: 1, page_size: 200 };
            GetClassesDetails(params).then((res) => {
                this.classDetails = res.payload.items;
            });
        },
        loadDeleteClassesTeacher: function (teaids, claids) {
            const data = {
                teaids: teaids,
                claids: claids,
            };
            DeleteClassesTeacher(data)
                .then(() => {
                    this.$message.success(msgcon("解绑成功"));
                    this.classDetails = [];
                    this.classList.map((item) => {
                        this.loadGetClassesDetails(item.id);
                    });
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                        return;
                    }
                    if (err.status === 404) {
                        this.$message.warning(msgcon("请求资源不存在"));
                    } else {
                        this.$message.error(msgcon("操作失败"));
                    }
                });
        },
        onClassAddTea() {
            if (this.classId === "" || this.teacherId === "") {
                this.$message.error(msgcon("未选择班级或教师"));
                return;
            }
            this.loadClassAddTeacher();
        },
        onChangeTabs() {
            this.collapseActiveName = "";
            this.classDetails = [];
            this.loadGetClassesDetails();
        },
        onCollapse() {},
        onUnbindClass(teaids) {
            this.$confirm("确认要解绑吗？", "解绑提示", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" })
                .then(() => {
                    let claids = this.collapseActiveName;
                    this.loadDeleteClassesTeacher(teaids, claids);
                })
                .catch(() => {});
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
.teacher-info {
    display: flex; /* 启用Flexbox布局 */
    justify-content: space-between; /* 两端对齐，使子元素分布在容器两端 */
    align-items: center; /* 垂直方向上居中对齐 */
}
</style>
