<template>
    <MyHeader title="查看报表"></MyHeader>
    <div style="margin-bottom: 10px; display: flex; justify-content: left; align-items: center">
        <div style="margin-right: 20px">
            <h4 style="margin-top: 0px; margin-bottom: 0px">阳坝小学 ● {{ displayClass }}</h4>
        </div>
        <div style="width: 200px; margin-right: 20px">
            <el-select v-model="class_id" @change="onChanClass">
                <el-option v-for="(item, index) in ownClass" :key="index" :label="item.name" :value="item.id" />
            </el-select>
        </div>
        <div style="margin-right: 20px">
            <el-date-picker v-model="yearMonth" type="month" value-format="YYYY-MM" :clearable="false" @change="onChanYearMonth" />
        </div>
        <div>
            <el-button type="" @click="print(displayClass)">打印</el-button>
        </div>
    </div>
    <div v-if="tableData.length === 0"><el-empty :image-size="200" /></div>
    <div id="print-body" v-else>
        <table>
            <tbody>
                <tr>
                    <th></th>
                    <!-- <th>班级</th> -->
                    <th colspan="3">早餐</th>
                    <th colspan="3">午餐</th>
                    <th colspan="3">晚餐</th>
                </tr>
                <tr>
                    <th class="meal-col">就餐日期</th>
                    <th>应有人数</th>
                    <th>实际人数</th>
                    <th>未就餐学生</th>
                    <th>应有人数</th>
                    <th>实际人数</th>
                    <th>未就餐学生</th>
                    <th>应有人数</th>
                    <th>实际人数</th>
                    <th>未就餐学生</th>
                </tr>
                <tr v-for="(item, index) in tableData" :key="index">
                    <td>{{ item.meal_date }}</td>
                    <td>{{ item.meals.breakfast.expected_diners }}</td>
                    <td>{{ item.meals.breakfast.actual_diners }}</td>
                    <td>{{ item.meals.breakfast.absent_diners }}</td>
                    <td>{{ item.meals.lunch.expected_diners }}</td>
                    <td>{{ item.meals.lunch.actual_diners }}</td>
                    <td>{{ item.meals.lunch.absent_diners }}</td>
                    <td>{{ item.meals.dinner.expected_diners }}</td>
                    <td>{{ item.meals.dinner.actual_diners }}</td>
                    <td>{{ item.meals.dinner.absent_diners }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { GetOwnClass, GetMealsReport } from "@/api/index.js";
export default {
    name: "ReportIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            tableData: [
                {
                    class_id: "",
                    class_name: "",
                    meal_date: "",
                    meals: {
                        breakfast: { absent_diners: "", actual_diners: "", expected_diners: "" },
                        dinner: { absent_diners: "", actual_diners: "", expected_diners: "" },
                        lunch: { absent_diners: "", actual_diners: "", expected_diners: "" },
                    },
                },
            ],
            ownClass: "",
            class_id: "",
            yearMonth: "",
            displayTable: false,
            countdownTimer: null, // 全局变量来存储定时器ID
        };
    },
    computed: {
        displayClass() {
            // 再班级中找到当前选中的id，并获取其班级名称
            if (this.class_id != "") {
                return this.ownClass.find((item) => item.id === this.class_id).name;
            } else {
                return "";
            }
        },
    },
    methods: {
        loadGetOwnClass: function () {
            GetOwnClass()
                .then((res) => {
                    this.ownClass = res.payload.class;
                    this.class_id = res.payload.class[0]["id"];
                })
                .catch(() => {});
        },
        loadGetMealsReport: function () {
            let parts = this.yearMonth.split("-");
            const params = {
                cid: this.class_id,
                y: parts[0],
                m: parts[1],
            };
            this.tableData = [];
            GetMealsReport(params)
                .then((res) => {
                    this.tableData = res.payload.report;
                })
                .catch(() => {});
        },
        onChanClass() {
            this.loadGetMealsReport();
        },
        onChanYearMonth() {
            this.loadGetMealsReport();
        },
        onRefresh() {
            this.loadGetMealsReport();
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        initMonth() {
            let currentDate = new Date();
            let year = currentDate.getFullYear();
            let month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
            this.yearMonth = `${year}-${month}`;
        },
        print(displayClass) {
            // 打印功能
            let title = `查看报表-${this.yearMonth}`;
            let headline = `阳坝小学 ● ${displayClass}`;
            var html = document.getElementById("print-body").innerHTML;
            const printWindow = window.open("", "_blank");
            printWindow.document.write(
                `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><title>${title}</title><style>table {width: 100%;border-collapse: collapse;}th, td {border: 1px solid black;text-align: center;}th, td {padding: 3px;/* 表格边框到文字的间距 */}.meal-col {min-width: 100px;}@media print {body::before {content: "${headline}";display: block;text-align: center;font-size: 15px;/* 打印时表格标题字体大小 */font-weight: bold;margin-bottom: 20px;}th, td {font-size: 8pt;/* 打印时表格单元格的字体大小 */}thead {display: table-header-group;}table {width: 100% !important;border-collapse: collapse;}tr {page-break-inside: avoid;page-break-after: auto;}td {page-break-inside: avoid;}@page {margin: 1cm 1.5cm 1cm 1.5cm;/* 页边距上、右、下、左 */}}</style></head><body><div class="print-content"></div></body></html>`
            );
            printWindow.document.close();
            const contentContainer = printWindow.document.querySelector(".print-content");
            contentContainer.innerHTML = html;
            printWindow.print();
        },
        startCountdown(val = 100) {
            if (this.class_id != "" || val <= 0) {
                clearInterval(this.countdownTimer); // 清除定时器
                this.loadGetMealsReport();
                return;
            }
            this.countdownTimer = setTimeout(() => {
                this.startCountdown(val - 1);
                // 1秒钟10次
            }, 100);
        },
    },
    created() {
        this.initMonth();
        this.loadGetOwnClass();
        this.startCountdown(); // 使用定时器控制，函数执行时，确保上一个执行完成
    },
};
</script>

<style scoped lang="less">
table {
    width: 100%;
    border-collapse: collapse;
}
th,
td {
    border: 1px solid black;
    text-align: center;
}
th,
td {
    padding: 5px;
}
th {
    background-color: #f2f2f2;
}
.meal-col {
    min-width: 100px;
}
</style>
