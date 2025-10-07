<template>
    <div v-if="result.fromt">
        <el-form label-position="top" label-width="auto" :model="fromData" :rules="rules" ref="meal-form">
            <el-form-item :label="selectLable">
                <el-select v-model="fromData.class_id" placeholder="请联系管理员将您添加到对应的班级" @change="handleClassChange">
                    <el-option v-for="item in ownClass" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="就餐日期" prop="dining_date">
                <el-date-picker v-model="fromData.dining_date" type="date" :editable="false" placeholder="日期" value-format="YYYY-MM-DD" :clearable="false" />
            </el-form-item>
            <el-form-item label="就餐时段" prop="period">
                <el-radio-group v-model="fromData.period" @change="handlePeriodChange">
                    <el-radio border value="breakfast" style="margin-right: 10px">早餐</el-radio>
                    <el-radio border value="lunch" style="margin-right: 10px">午餐</el-radio>
                    <el-radio border value="dinner" style="margin-right: 10px">晚餐</el-radio>
                    <el-radio border value="enterprise">企业</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="应就餐人数" prop="expected">
                <el-input v-model.number="fromData.expected" :readonly="isExpectedReadOnly" placeholder="选择班级和时段后自动填充" />
            </el-form-item>
            <el-form-item label="实际就餐人数" prop="actual">
                <el-input v-model.number="fromData.actual" />
            </el-form-item>
            <el-form-item :label="`未就餐学生：${nameCuntMsg}；(1人以上用空格分隔)`" prop="canteen_absent_diners">
                <el-input v-model="fromData.canteen_absent_diners" @input="onCountNumber()" />
                <div v-if="checkmsg != ''">
                    <el-text type="danger">{{ checkmsg }}</el-text>
                </div>
            </el-form-item>
        </el-form>

        <div style="display: flex; justify-content: center; align-items: center">
            <el-button style="width: 100%" type="primary" @click="onNextStep()">提交数据</el-button>
        </div>
    </div>

    <el-dialog width="95%" v-model="dialogVisible" title="提交数据" :before-close="onCance" :close-on-click-modal="false">
        <div class="subdialog">
            <el-text>就餐班级: {{ displayCloas?.name || "未知班级" }}</el-text>
        </div>
        <div class="subdialog">
            <el-text>就餐日期: {{ data.dining_date }}</el-text>
        </div>
        <div class="subdialog">
            <el-text>就餐时段: {{ display_meal_period }}</el-text>
        </div>
        <div class="subdialog">
            <el-text>应就餐人数: {{ data.expected }} 人</el-text>
        </div>
        <div class="subdialog">
            <el-text>实际就餐人数: {{ data.actual }} 人</el-text>
        </div>
        <div class="subdialog">
            <el-text>未就餐学生: {{ data.canteen_absent_diners }}</el-text>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 30px">
            <el-button style="width: 35%" @click="onCance()">返回修改</el-button>
            <el-button style="width: 65%" type="primary" @click="onSubmit()">确认提交</el-button>
        </div>
    </el-dialog>

    <div v-if="result.result" style="margin-top: 30%">
        <el-result icon="success" title="提交成功" sub-title="">
            <template #extra>
                <el-button size="large" type="primary" @click="onBack()">返回首页</el-button>
            </template>
        </el-result>
    </div>
</template>

<script>
import { GetOwnClass, RecordMealsData } from "@/api/index.js";
export default {
    name: "MealsIndex",
    components: {},
    props: {},
    data() {
        // 自定义非负数字验证
        const validateNonNegative = (rule, value, callback) => {
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
            fromData: {
                // 输入的数据
                class_id: "",
                dining_date: "", // 日期
                period: "", // 时段
                expected: null, //应就餐人数
                actual: "", //实际就餐人数
                canteen_absent_diners: "", // 食堂未就餐学生
                enterprise_absent_diners: "", // 企业未就餐学生
            },
            data: {
                dining_date: "",
                period: "",
                expected: "",
                actual: "",
                canteen_number: 0,
                canteen_absent_diners: "",
                enterprise_number: 0,
                enterprise_absent_diners: "",
            },
            display_meal_period: "",
            dialogVisible: false,
            rules: {
                dining_date: [{ required: true, message: "请选择就餐日期", trigger: "blur" }],
                period: [{ required: true, message: "请选择就餐时段", trigger: "blur" }],
                expected: [
                    { required: true, message: "请输入应就餐人数", trigger: "blur" },
                    { validator: validateNonNegative, trigger: ["blur", "change"] },
                ],
                actual: [
                    { required: true, message: "请输入实际就餐人数", trigger: "blur" },
                    { validator: validateNonNegative, trigger: ["blur", "change"] },
                ],
            },
            ownClass: [],
            targetClass: {},
            result: {
                fromt: true,
                result: false,
            },
            checkmsg: "",
            selectLable: "选择班级",
            nameCunts: {
                canteen: 0,
                enterprise: 0,
            },
            isExpectedReadOnly: false, // 应就餐人数是否只读
        };
    },
    computed: {
        displayCloas() {
            return this.ownClass.find((item) => item.id === this.fromData.class_id);
        },
        nameCuntMsg() {
            return `(${this.nameCunts.canteen + this.nameCunts.enterprise}人)`;
        },
    },
    methods: {
        loadGetOwnClass: function () {
            const params = { page: 1, page_size: 200 };
            GetOwnClass(params)
                .then((res) => {
                    this.ownClass = res.payload?.class || [];
                    if (this.ownClass.length > 0) {
                        this.fromData.class_id = this.ownClass[0]["id"];
                        // 自动填充第一个班级的默认时段人数
                        this.fillExpectedDiners();
                    }
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.selectLable = "选择班级（您没有获取自己班级的权限）";
                    }
                });
        },
        loadRecordMealsData: function (class_id, data) {
            let paths = { class_id: class_id };
            RecordMealsData(paths, data)
                .then(() => {
                    this.dialogVisible = false;
                    this.result.fromt = false;
                    this.result.result = true;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 2000, title: "您没有权限", type: "warning" });
                    } else {
                        this.$notify({ duration: 2000, title: "不能重复提交", type: "error" });
                    }
                });
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        onCance() {
            this.dialogVisible = false;
        },
        isDateInFuture(dateString) {
            // 将字符串日期转换为Date对象
            const futureDate = new Date(`${dateString} GMT+0800`);
            // 获取当前日期
            const today = new Date();
            // 比较两个日期.如果dateString大于当前时间，返回 true
            return futureDate > today;
        },
        // 姓名转换为数组
        strNameToArr(nameStr) {
            let namse = nameStr.trim().replace(/,/g, " ").trim();
            const nameArr = namse === "" ? [] : namse.split(/\s+/);
            return nameArr;
        },
        // 统计有几个学生姓名
        statisticsStudent(nameStr) {
            const nameArr = this.strNameToArr(nameStr);
            return nameArr.length;
        },
        onCountNumber() {
            let c = this.statisticsStudent(this.fromData.canteen_absent_diners);
            let e = this.statisticsStudent(this.fromData.enterprise_absent_diners);
            this.nameCunts = {
                canteen: c,
                enterprise: e,
            };
        },
        // 处理班级变更
        handleClassChange() {
            this.fillExpectedDiners();
        },
        // 处理时段变更
        handlePeriodChange() {
            this.fillExpectedDiners();
        },
        // 根据班级和时段填充应就餐人数
        fillExpectedDiners() {
            if (!this.fromData.class_id || !this.fromData.period) {
                // 如果班级或时段未选择，不填充
                return;
            }

            // 获取当前选中的班级信息
            const currentClass = this.ownClass.find((cls) => cls.id === this.fromData.class_id);
            if (!currentClass) return;

            // 根据时段填充对应人数
            let expectedNum = 0;

            switch (this.fromData.period) {
                case "breakfast":
                    expectedNum = currentClass.zcrs;
                    break;
                case "lunch":
                    expectedNum = currentClass.zwrs;
                    break;
                case "dinner":
                    expectedNum = currentClass.wsrs;
                    break;
                case "enterprise":
                    expectedNum = currentClass.qyrs;
                    break;
                default:
                    return;
            }

            // 填充数据并设置只读
            this.fromData.expected = expectedNum;
            this.isExpectedReadOnly = true;
        },
        onNextStep() {
            this.$refs["meal-form"].validate((valid) => {
                // 如果表单验证失败，停止请求提交
                if (!valid) {
                    return;
                }
                this.checkmsg = "";

                // 计算未就餐人数（仅用于验证，不提交到后端）
                const no_meal_num = this.fromData.expected - this.fromData.actual;

                this.data = {
                    dining_date: this.fromData.dining_date,
                    period: this.fromData.period,
                    expected: this.fromData.expected,
                    actual: this.fromData.actual,
                    canteen_number: 0,
                    canteen_absent_diners: "",
                    enterprise_number: 0,
                    enterprise_absent_diners: "",
                };

                // 设置显示的就餐时段
                const periodMap = {
                    breakfast: "早餐",
                    lunch: "午餐",
                    dinner: "晚餐",
                    enterprise: "企业餐",
                };
                this.display_meal_period = periodMap[this.data.period] || this.data.period;

                // 检查日期是否超前
                if (this.isDateInFuture(this.fromData.dining_date)) {
                    this.checkmsg = "您不能提交明天的数据";
                    return;
                }

                // 检查实际就餐人数是否超过应就餐人数
                if (this.fromData.actual > this.fromData.expected) {
                    this.checkmsg = "实际就餐人数不能超过应就餐人数";
                    return;
                }

                // 处理姓名并检测数目是否匹配（预期就餐人数=实际就餐人数+未就餐人数）
                const cad = this.strNameToArr(this.fromData.canteen_absent_diners);
                const ead = this.strNameToArr(this.fromData.enterprise_absent_diners);
                if (cad.length + ead.length != no_meal_num) {
                    this.checkmsg = `未就餐学生应该是${no_meal_num}人（应到${this.fromData.expected}人 - 实到${this.fromData.actual}人）`;
                    return;
                }
                this.data.canteen_number = cad.length;
                this.data.enterprise_number = ead.length;
                // 提交的数据，使用逗号隔开
                this.data.canteen_absent_diners = cad.join(",");
                this.data.enterprise_absent_diners = ead.join(",");

                // 显示弹框
                this.dialogVisible = true;
            });
        },
        onSubmit() {
            this.loadRecordMealsData(this.fromData.class_id, this.data);
        },
        initDate() {
            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
            let day = currentDate.getDate().toString().padStart(2, "0");
            this.fromData.dining_date = `${year}-${month}-${day}`;
        },
    },
    created() {
        this.initDate();
        this.loadGetOwnClass();
    },
};
</script>

<style scoped lang="less">
.line-row {
    display: flex;
    margin-bottom: 10px;
}
.subdialog {
    margin-bottom: 10px;
}
</style>
