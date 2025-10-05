<template>
    <div>
        <el-dialog v-model="dialogVisible" title="创建班级" width="600">
            <el-form :model="data" label-width="auto" :rules="fromRules" ref="rules-form">
                <el-form-item label="班级编号" prop="code">
                    <el-input v-model.number="data.code" placeholder="请输入3位数字（101-999）" />
                    <div class="el-form-item__help">
                        格式说明：第一位代表年级(1-9)，后两位代表班级号(01-99)<br />
                        例如：305 表示三年级5班
                    </div>
                </el-form-item>
                <el-form-item label="班级名称" prop="name">
                    <el-input v-model="data.name" placeholder="例如：三年级5班" readonly />
                    <div class="el-form-item__help">班级名称将根据班级编号自动生成</div>
                </el-form-item>
            </el-form>
            <div style="display: flex; justify-content: flex-end">
                <el-button round class="round-button" @click="dialogVisible = false">取消</el-button>
                <el-button round class="round-button" type="primary" @click="onSubmit">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { msgcon } from "../../utils/message.js";
import { CreateClass } from "../../api/index.js";
export default {
    name: "CreateClassIndex",
    components: {},
    data() {
        // 自定义验证规则：检查班级编号是否为101-999之间的整数
        const validateClassCode = (rule, value, callback) => {
            if (!value && value !== 0) {
                return callback(new Error("请输入班级编号"));
            }
            // 验证是否为整数
            if (!Number.isInteger(value)) {
                return callback(new Error("请输入整数"));
            }
            // 验证是否为3位数字且在101-999之间
            if (value < 101 || value > 999) {
                return callback(new Error("班级编号必须在101-999之间"));
            }
            callback();
        };

        return {
            dialogVisible: false,
            data: {
                code: null, // 使用number类型
                name: "",
            },
            fromRules: {
                code: [{ required: true, validator: validateClassCode, trigger: ["blur", "change"] }],
                name: [{ message: "请输入班级名称", trigger: "blur" }],
            },
        };
    },
    methods: {
        // 打开创建对话框
        openDialog() {
            // 重置表单数据
            this.data = {
                code: null,
                name: "",
            };
            // 重置表单验证状态
            this.$nextTick(() => {
                this.$refs["rules-form"].resetFields();
            });
            this.dialogVisible = true;
        },
        // 提交成功处理
        submitSuccess() {
            this.$message.success(msgcon("创建成功"));
            this.dialogVisible = false;
            // 通知父组件刷新数据
            this.$parent.onRefresh();
        },
        // 调用API创建班级
        loadCreateClass() {
            // 构造符合API要求的数据格式，与主页面保持一致
            const requestData = {
                cls: {
                    code: this.data.code, // 直接使用number类型
                },
            };

            CreateClass(requestData)
                .then(() => {
                    this.submitSuccess();
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$message.warning(msgcon("您没有权限"));
                    } else if (err.status === 409) {
                        this.$message.error(msgcon("该班级编号已存在"));
                    } else {
                        this.$message.error(msgcon("创建失败，请稍后重试"));
                    }
                    console.error("创建班级失败:", err);
                });
        },
        // 表单提交
        onSubmit() {
            this.$refs["rules-form"].validate((valid) => {
                if (valid) {
                    this.loadCreateClass();
                } else {
                    this.$message.warning(msgcon("请完善表单信息"));
                    return false;
                }
            });
        },
        // 自动生成班级名称
        autoGenerateClassName() {
            if (this.data.code && Number.isInteger(this.data.code)) {
                const gradeMap = {
                    1: "一年级",
                    2: "二年级",
                    3: "三年级",
                    4: "四年级",
                    5: "五年级",
                    6: "六年级",
                    7: "七年级",
                    8: "八年级",
                    9: "九年级",
                };
                const codeStr = this.data.code.toString().padStart(3, "0");
                const grade = codeStr.charAt(0);
                const classNum = codeStr.slice(1);
                this.data.name = `${gradeMap[grade]}（${parseInt(classNum)}）班`;
            } else {
                this.data.name = "";
            }
        },
    },
    watch: {
        // 监听班级编号变化，自动生成班级名称
        "data.code"(newVal) {
            this.autoGenerateClassName();
        },
    },
};
</script>

<style scoped>
.round-button {
    min-width: 100px;
    margin-left: 10px;
}

.el-form-item__help {
    color: #606266;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
}
</style>
