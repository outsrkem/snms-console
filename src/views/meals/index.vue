<template>
    <div>
        <MyHeader title="登记就餐数据"></MyHeader>
        <el-form label-position="top" label-width="auto" :model="fromData" :rules="rules" ref="meal-form">
            <el-form-item label="就餐日期" prop="meal_date">
                <el-date-picker
                    v-model="fromData.meal_date"
                    type="date"
                    :editable="false"
                    placeholder="日期"
                    value-format="YYYY-MM-DD"
                    :clearable="false"
                />
            </el-form-item>
            <el-form-item label="就餐时段" prop="meal_period">
                <el-radio-group v-model="fromData.meal_period">
                    <el-radio border value="breakfast">早餐</el-radio>
                    <el-radio border value="lunch">午餐</el-radio>
                    <el-radio border value="dinner">晚餐</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="应就餐人数" prop="expected_diners">
                <el-input v-model.number="fromData.expected_diners" />
            </el-form-item>
            <el-form-item label="未就餐人数" prop="no_meal_num">
                <el-input v-model.number="fromData.no_meal_num" />
            </el-form-item>
            <el-form-item label="未就餐学生" prop="absent_diners">
                <el-input v-model="fromData.absent_diners" />
            </el-form-item>
        </el-form>
        <div style="display: flex; justify-content: center; align-items: center">
            <el-button style="width: 100%" size="large" type="primary" @click="onNextStep()">提交数据</el-button>
        </div>
        <el-dialog width="95%" v-model="dialogVisible" title="提交数据" :before-close="onCance" :close-on-click-modal="false">
            <div class="subdialog">
                <el-text>就餐日期: {{ data.meal_date }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>就餐时段: {{ display_meal_period }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>应就餐人数: {{ data.expected_diners }} 人</el-text>
            </div>
            <div class="subdialog">
                <el-text>实际就餐人数: {{ data.actual_diners }} 人 ({{ fromData.no_meal_num }}人未就餐)</el-text>
            </div>
            <div class="subdialog">
                <el-text>未就餐学生: {{ data.absent_diners }}</el-text>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 30px">
                <el-button style="width: 35%" @click="onCance()">返回修改</el-button>
                <el-button style="width: 65%" type="primary" @click="onSubmit()">确认提交</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
export default {
    name: "MealsIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            fromData: {
                absent_diners: "",
                meal_period: "",
                meal_date: "",
                no_meal_num: "",
            },
            data: {
                meal_date: "",
                meal_period: "",
                expected_diners: "",
                actual_diners: "",
                absent_diners: "",
            },
            display_meal_period: "",
            dialogVisible: false,
            rules: {
                meal_date: [{ required: true, message: "请选择就餐日期", trigger: "blur" }],
                meal_period: [{ required: true, message: "请选择就餐时段", trigger: "blur" }],
                expected_diners: [
                    { required: true, message: "请输入应就餐人数", trigger: "blur" },
                    { type: "number", message: "请输入数字" },
                ],
                no_meal_num: [
                    { required: true, message: "请输入未就餐人数", trigger: "blur" },
                    { type: "number", message: "请输入数字" },
                ],
                absent_diners: [{ message: "请输入未就餐学生姓名" }],
            },
        };
    },
    methods: {
        onBack() {
            this.$router.push({ name: "home" });
        },
        onCance() {
            this.dialogVisible = false;
        },
        onNextStep() {
            this.$refs["meal-form"].validate((valid) => {
                // 如果表单验证失败，停止请求提交
                if (!valid) {
                    return;
                }
                this.data = {
                    meal_date: this.fromData.meal_date,
                    meal_period: this.fromData.meal_period,
                    expected_diners: this.fromData.expected_diners,
                    actual_diners: this.fromData.expected_diners - this.fromData.no_meal_num,
                    absent_diners: this.fromData.absent_diners,
                };
                switch (this.data.meal_period) {
                    // 'breakfast','lunch','dinner'
                    case "breakfast":
                        this.display_meal_period = "早餐";
                        break;
                    case "lunch":
                        this.display_meal_period = "午餐";
                        break;
                    case "dinner":
                        this.display_meal_period = "晚餐";
                        break;
                }
                this.dialogVisible = true;
            });
        },
        onSubmit() {
            // 未就餐学生姓名使用空格分开，程序按空格处理成数组
            // 并与未就餐人数比较，数目匹配才可以提交
        },
        initDate() {
            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
            let day = currentDate.getDate().toString().padStart(2, "0");
            this.fromData.meal_date = `${year}-${month}-${day}`;
        },
    },
    created() {
        this.initDate();
    },
};
</script>

<style scoped lang="less">
.line-row {
    display: flex;
    // justify-content: center;
    // align-items: center;
    margin-bottom: 10px;
}
.subdialog {
    margin-bottom: 10px;
}
</style>
