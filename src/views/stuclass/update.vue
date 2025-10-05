<template>
    <div>
        <el-dialog v-model="dialogVisible" title="更新班级信息" width="600" :close-on-click-modal="false">
            <div v-loading="loading">
                <el-form :model="from" label-width="auto" :rules="fromRules" ref="rules-from">
                    <el-form-item label="早餐人数" prop="zcrs">
                        <el-input v-model.number="from.zcrs" class="no-spinner" input-mode="numeric" pattern="[0-9]*" />
                    </el-form-item>
                    <el-form-item label="午餐人数" prop="zwrs">
                        <el-input v-model.number="from.zwrs" class="no-spinner" input-mode="numeric" pattern="[0-9]*" />
                    </el-form-item>
                    <el-form-item label="晚餐人数" prop="wsrs">
                        <el-input v-model.number="from.wsrs" class="no-spinner" input-mode="numeric" pattern="[0-9]*" />
                    </el-form-item>
                    <el-form-item label="企业餐人数" prop="qyrs">
                        <el-input v-model.number="from.qyrs" class="no-spinner" input-mode="numeric" pattern="[0-9]*" />
                    </el-form-item>
                    <el-form-item label="关联教师" prop="teachers">
                        <el-select v-model="from.teachers" multiple placeholder="选择教师" @remove-tag="handleRemoveTeacher">
                            <el-option v-for="item in teacherList" :key="item.id" :label="item.compellation" :value="item.id" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div style="display: flex; justify-content: flex-end">
                    <el-button round class="round-button" @click="dialogVisible = false">取消</el-button>
                    <el-button round class="round-button" type="primary" @click="onSubmit">确定</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { msgcon } from "../../utils/message.js";
import { GetAllTeacher, ClassAddTeacher, DeleteClassesTeacher, UpdateClassJcrs } from "../../api/index.js";
export default {
    name: "UpdateClass",
    components: {},

    data() {
        // 自定义数字验证规则，确保值为非负整数
        const validateNonNegativeNumber = (rule, value, callback) => {
            // 转换为数字
            const num = Number(value);

            // 检查是否为有效数字
            if (isNaN(num)) {
                return callback(new Error("请输入有效的数字"));
            }

            // 检查是否为非负数
            if (num < 0) {
                return callback(new Error("不能为负数"));
            }

            // 检查是否为整数
            if (!Number.isInteger(num)) {
                return callback(new Error("请输入整数"));
            }

            callback();
        };

        return {
            dialogVisible: false,
            loading: false,
            from: {
                id: null,
                zcrs: 0, // 默认为0
                zwrs: 0, // 默认为0
                wsrs: 0, // 默认为0
                qyrs: 0, // 默认为0
                teachers: [],
            },
            // 存储原始教师ID用于比较
            originalTeachers: [],
            // 存储原始人数数据用于比较
            originalCounts: {},
            teacherList: [],
            fromRules: {
                zcrs: [
                    { required: true, message: "请输入早餐人数", trigger: "blur" },
                    { validator: validateNonNegativeNumber, trigger: ["blur", "change"] },
                ],
                zwrs: [
                    { required: true, message: "请输入午餐人数", trigger: "blur" },
                    { validator: validateNonNegativeNumber, trigger: ["blur", "change"] },
                ],
                wsrs: [
                    { required: true, message: "请输入晚餐人数", trigger: "blur" },
                    { validator: validateNonNegativeNumber, trigger: ["blur", "change"] },
                ],
                qyrs: [
                    { required: true, message: "请输入企业餐人数", trigger: "blur" },
                    { validator: validateNonNegativeNumber, trigger: ["blur", "change"] },
                ],
            },
        };
    },
    methods: {
        openDialog(val) {
            // 保存原始数据
            this.from = { ...val };
            // 确保人数为数字类型
            this.from.zcrs = Number(this.from.zcrs) || 0;
            this.from.zwrs = Number(this.from.zwrs) || 0;
            this.from.wsrs = Number(this.from.wsrs) || 0;
            this.from.qyrs = Number(this.from.qyrs) || 0;

            // 存储原始教师ID用于后续比较
            this.originalTeachers = val.teachers && val.teachers.length ? val.teachers.map((teacher) => teacher.id) : [];
            // 初始化当前选中的教师ID
            this.from.teachers = [...this.originalTeachers];
            // 存储原始人数数据
            this.originalCounts = {
                zcrs: this.from.zcrs,
                zwrs: this.from.zwrs,
                wsrs: this.from.wsrs,
                qyrs: this.from.qyrs,
            };

            this.loadGetAllTeacher();
            this.dialogVisible = true;
        },
        submitSuccess() {
            this.dialogVisible = false;
            this.$parent.onRefresh();
        },
        loadGetAllTeacher: function () {
            GetAllTeacher({ page_size: 100 })
                .then((res) => {
                    this.teacherList = res.payload?.items || [];
                })
                .catch((err) => {
                    this.$message.error(msgcon("获取教师列表失败"));
                    console.error(err);
                });
        },
        // 处理教师移除事件
        handleRemoveTeacher(removedTeacherId) {
            if (this.originalTeachers.includes(removedTeacherId)) {
                this.loadDeleteClassesTeacher(removedTeacherId);
            }
        },
        // 执行删除教师关联
        loadDeleteClassesTeacher(teacherId) {
            const data = {
                teaids: teacherId,
                claids: this.from.id,
            };

            this.loading = true;
            DeleteClassesTeacher(data)
                .then(() => {
                    this.$message.success(msgcon("教师移除成功"));
                    this.originalTeachers = this.originalTeachers.filter((id) => id !== teacherId);
                })
                .catch((err) => {
                    this.$message.error(msgcon("教师移除失败"));
                    console.error(err);
                    this.from.teachers.push(teacherId);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 更新班级就餐人数
        loadUpdateClassJcrs() {
            const data = {
                id: this.from.id,
                zcrs: this.from.zcrs,
                zwrs: this.from.zwrs,
                wsrs: this.from.wsrs,
                qyrs: this.from.qyrs,
            };

            console.log("提交的人数数据:", data);
            const paths = { classId: this.from.id };
            return UpdateClassJcrs(paths, data)
                .then(() => {
                    this.$message.success(msgcon("就餐人数更新成功"));
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.$message.error(msgcon("就餐人数更新失败"));
                    console.error("人数更新失败:", err);
                    return Promise.reject(err);
                });
        },
        // 添加教师关联
        loadClassAddTeacher() {
            const newTeachers = this.from.teachers.filter((teacherId) => !this.originalTeachers.includes(teacherId));

            if (newTeachers.length === 0) {
                return Promise.resolve();
            }

            const data = {
                cid: [this.from.id],
                tid: newTeachers,
            };

            return ClassAddTeacher(data)
                .then(() => {
                    this.$message.success(msgcon("教师添加成功"));
                    return Promise.resolve();
                })
                .catch((err) => {
                    this.$message.error(msgcon("添加教师失败"));
                    console.error(err);
                    return Promise.reject(err);
                });
        },
        // 检查人数是否有变化
        hasCountChanges() {
            return (
                this.from.zcrs !== this.originalCounts.zcrs ||
                this.from.zwrs !== this.originalCounts.zwrs ||
                this.from.wsrs !== this.originalCounts.wsrs ||
                this.from.qyrs !== this.originalCounts.qyrs
            );
        },
        // 表单提交
        onSubmit() {
            this.$refs["rules-from"].validate((valid) => {
                if (valid) {
                    this.loading = true;

                    const operations = [];

                    if (this.hasCountChanges()) {
                        operations.push(this.loadUpdateClassJcrs());
                    }

                    operations.push(this.loadClassAddTeacher());

                    Promise.all(operations)
                        .then(() => {
                            this.submitSuccess();
                        })
                        .catch((err) => {
                            console.error("操作失败:", err);
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                } else {
                    this.$message.warning(msgcon("请完善表单信息"));
                    return false;
                }
            });
        },
    },
    created() {},
};
</script>

<style scoped>
.round-button {
    min-width: 100px;
    margin-left: 10px;
}
</style>
