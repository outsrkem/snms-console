<template>
    <div>
        <MyHeader title="登记就餐数据"></MyHeader>
        <div v-if="result.fromt">
            <el-form label-position="top" label-width="auto" :model="fromData" :rules="rules" ref="meal-form">
                <el-form-item :label="selectLable">
                    <el-select v-model="fromData.class_id" placeholder="权限不足或无数据">
                        <el-option v-for="item in ownClass" :key="item.value" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="就餐日期" prop="meal_date">
                    <el-date-picker
                        v-model="fromData.dining_date"
                        type="date"
                        :editable="false"
                        placeholder="日期"
                        value-format="YYYY-MM-DD"
                        :clearable="false"
                    />
                </el-form-item>
                <el-form-item label="就餐时段" prop="period">
                    <el-radio-group v-model="fromData.period">
                        <el-radio border value="breakfast">早餐</el-radio>
                        <el-radio border value="lunch">午餐</el-radio>
                        <el-radio border value="dinner">晚餐</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="应就餐人数" prop="expected">
                    <el-input v-model.number="fromData.expected" />
                </el-form-item>
                <el-form-item label="未就餐人数" prop="no_meal_num">
                    <el-input v-model.number="fromData.no_meal_num" />
                </el-form-item>
                <!-- <el-form-item :label="'未就餐学生：' + noMealNameCunt + '（1人以上用空格分隔）'" prop="absent_diners"> -->
                <el-form-item :label="`未就餐学生：${nameCuntMsg}；(1人以上用空格分隔)`" prop="absent_diners">
                    <el-input v-model="fromData.canteen_absent_diners" @input="onCountNumber()">
                        <template #prepend>食堂</template>
                    </el-input>

                    <span style="width: 100%; height: 5px"></span>
                    <span v-if="!(fromData.period === 'breakfast') && fromData.period !== ''" style="width: 100%">
                        <el-input v-model="fromData.enterprise_absent_diners" @input="onCountNumber()">
                            <template #prepend>企业</template>
                        </el-input>
                    </span>

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
                <el-text>就餐班级: {{ displayCloas.name }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>就餐日期: {{ data.dining_date }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>就餐时段: {{ display_meal_period }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>应就餐人数: {{ data.expected }} 人</el-text>
                <el-text type="danger">（{{ fromData.no_meal_num }}人未就餐）</el-text>
            </div>
            <div class="subdialog">
                <el-text>实际就餐人数: {{ data.actual }} 人</el-text>
            </div>
            <div class="subdialog">
                <el-text>食堂未就餐: {{ data.canteen_absent_diners }}</el-text>
            </div>
            <div class="subdialog">
                <el-text>企业未就餐: {{ data.enterprise_absent_diners }}</el-text>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 30px">
                <el-button style="width: 35%" @click="onCance()">返回修改</el-button>
                <el-button style="width: 65%" type="primary" @click="onSubmit()">确认提交</el-button>
            </div>
        </el-dialog>

        <div v-if="result.result" style="margin-top: 30%">
            <el-result icon="success" title="提交成功" sub-title="">
                <template #extra>
                    <!-- <el-button type="primary" @click="onContinue()">还要提交</el-button> -->
                    <el-button size="large" type="primary" @click="onBack()">返回首页</el-button>
                </template>
            </el-result>
        </div>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { GetOwnClass, RecordMealsData } from "@/api/index.js";
export default {
    name: "MealsIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            fromData: {
                // 输入的数据
                class_id: "",
                dining_date: "", // 日期
                period: "", // 时段
                expected: null, //应就餐人数
                no_meal_num: "", //未就餐人数
                canteen_absent_diners: "", // 食堂学生
                enterprise_absent_diners: "", // 企业学生
            },
            data: {
                // 待提交数据
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
                    { type: "number", message: "请输入数字" },
                ],
                no_meal_num: [
                    { required: true, message: "请输入未就餐人数", trigger: "blur" },
                    { type: "number", message: "请输入数字" },
                ],
                absent_diners: [{ message: "请输入未就餐学生姓名" }],
            },
            ownClass: [],
            targetClass: {},
            result: {
                fromt: true,
                result: false,
            },
            checkmsg: "",
            selectLable: "选择班级",
            noMealNameCunt: "",
            nameCunts: {
                canteen: 0,
                enterprise: 0,
            },
        };
    },
    // displayCloas
    computed: {
        displayCloas() {
            return this.ownClass.find((item) => item.id === this.targetClass.id);
        },
        nameCuntMsg() {
            return `(食堂${this.nameCunts.canteen}人，企业${this.nameCunts.enterprise}人)`;
        },
    },
    methods: {
        loadGetOwnClass: function () {
            const params = { page: 1, page_size: 200 };
            GetOwnClass(params)
                .then((res) => {
                    this.ownClass = res.payload.class;
                    this.fromData.class_id = res.payload.class[0]["id"];
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.selectLable = "选择班级（您没有权限）";
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
        onContinue() {
            this.$router.push({ name: "meals" });
            window.location.reload(); // 刷新页面，初始化数据，可优化，暂不需要
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
            //先将字符串中的逗号替换成空格，在去除两端的空格，英文首位的逗号替换后就多个空格，导致计算多一个人
            // let namse = this.fromData.canteen_absent_diners.replace(/[,]/g, " ").trim();
            // const nameArr = namse === "" ? [] : namse.split(/\s+/);
            // this.noMealNameCunt = nameArr.length + "人";
            let c = this.statisticsStudent(this.fromData.canteen_absent_diners);
            let e = this.statisticsStudent(this.fromData.enterprise_absent_diners);
            this.nameCunts = {
                canteen: c,
                enterprise: e,
            };
        },

        onNextStep() {
            this.$refs["meal-form"].validate((valid) => {
                // 如果表单验证失败，停止请求提交
                if (!valid) {
                    return;
                }
                this.checkmsg = "";
                this.data = {
                    // dining_date: this.fromData.dining_date,
                    // period: this.fromData.period,
                    // expected: this.fromData.expected_diners,
                    // actual: this.fromData.expected_diners - this.fromData.no_meal_num,
                    // absent_diners: this.fromData.absent_diners,

                    dining_date: this.fromData.dining_date,
                    period: this.fromData.period,
                    expected: this.fromData.expected,
                    actual: this.fromData.expected - this.fromData.no_meal_num,
                    canteen_number: 0,
                    canteen_absent_diners: "",
                    enterprise_number: 0,
                    enterprise_absent_diners: "",
                };
                this.targetClass = {
                    id: this.fromData.class_id,
                    name: "班级",
                };
                switch (this.data.period) {
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

                // 检查日期是否超前
                if (this.isDateInFuture(this.fromData.dining_date)) {
                    this.checkmsg = "您不能提交明天的数据";
                    return;
                }

                // 检查就餐人数和未就餐人数是否正常
                if (this.fromData.expected < this.fromData.no_meal_num) {
                    this.checkmsg = "未就餐人数超了过总人数";
                    return;
                }

                // 处理姓名并检测数目是否匹配
                const cad = this.strNameToArr(this.fromData.canteen_absent_diners);
                const ead = this.strNameToArr(this.fromData.enterprise_absent_diners);
                if (cad.length + ead.length != this.fromData.no_meal_num) {
                    this.checkmsg = "未就餐学生姓名与未就餐人数不匹配";
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
            // 未就餐学生姓名使用空格分开，程序按空格处理成数组
            // 并与未就餐人数比较，数目匹配才可以提交
            this.loadRecordMealsData(this.targetClass.id, this.data);
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
