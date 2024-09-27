<template>
    <div v-if="permissionDenied === true">
        <el-result icon="warning" title="您没有权限" />
    </div>
    <div v-else>
        <div style="margin-bottom: 10px; display: flex; justify-content: left; align-items: center">
            <div style="margin-right: 20px">
                <h4 style="margin-top: 0px; margin-bottom: 0px">阳坝镇中心小学 ● {{ displayClass }}</h4>
            </div>

            <div style="width: 200px; margin-right: 20px">
                <el-select size="small" v-model="class_id" @change="onChanClass">
                    <el-option v-for="(item, index) in ownClass" :key="index" :label="item.name" :value="item.id" />
                </el-select>
            </div>
            <div style="margin-right: 20px">
                <el-date-picker size="small" v-model="yearMonth" type="month" value-format="YYYY-MM" :clearable="false" @change="onChanYearMonth" />
            </div>
            <div>
                <el-button size="small" type="primary" :loading="bl.pm" @click="onPreviousMonth">前一月</el-button>
                <el-button size="small" type="primary" :loading="bl.tm" @click="onCurrentMonth">本月</el-button>
                <el-button size="small" type="primary" :loading="bl.nm" @click="onNextMonth">后一月</el-button>
                <el-button size="small" type="primary" :loading="bl.rf" @click="onRefresh">刷新</el-button>
                <el-button size="small" type="primary" @click="print(displayClass)">打印</el-button>
            </div>
        </div>
        <div v-loading="bl.pl">
            <div v-if="tableData.length === 0"><el-empty :image-size="200" /></div>
            <div id="print-body" v-else>
                <table>
                    <tbody>
                        <tr>
                            <th>班级</th>
                            <th>{{ displayClass }}</th>
                            <!-- <th>班级</th> -->
                            <th colspan="3">早餐</th>
                            <th colspan="3">午餐</th>
                            <th colspan="3">晚餐</th>
                        </tr>
                        <tr>
                            <th>No.</th>
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
                            <td>{{ index + 1 }}</td>
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
                        <tr>
                            <td>--</td>
                            <td>合计</td>
                            <td>{{ calculateTotalExpectedBreakfastDiners }}</td>
                            <td>{{ calculateBreakfastActualDiners }}</td>
                            <td>--</td>
                            <td>{{ calculateTotalExpecteLunchDiners }}</td>
                            <td>{{ calculateLunchtActualDiners }}</td>
                            <td>--</td>
                            <td>{{ calculateTotalExpecteDinnerDiners }}</td>
                            <td>{{ calculateDinnertActualDiners }}</td>
                            <td>--</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { GetOwnClass, GetMealsReport } from "@/api/index.js";
export default {
    name: "MonthlyMeals",
    data() {
        return {
            tableData: [],
            ownClass: "",
            class_id: "",
            yearMonth: "",
            displayTable: false,
            countdownTimer: null, // 全局变量来存储定时器ID
            permissionDenied: false,
            bl: {
                pm: false, //前一月
                tm: false, //本月
                nm: false, //后一月
                rf: false, //刷新
                pr: false, //打印
                pl: false, // 页面加载状态
            },
            currentDate: new Date(), // 默认当前日期
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
        calculateTotalExpectedBreakfastDiners() {
            // 早餐的“预期用餐者”总数
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.breakfast.expected_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        calculateBreakfastActualDiners() {
            // 早餐的“实际用餐者”
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.breakfast.actual_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        calculateTotalExpecteDinnerDiners() {
            // 午餐的“预期用餐者”总数
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.dinner.expected_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        calculateDinnertActualDiners() {
            // 午餐的“实际用餐者”
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.dinner.actual_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        calculateTotalExpecteLunchDiners() {
            // 晚餐的“预期用餐者”总数
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.lunch.expected_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        calculateLunchtActualDiners() {
            // 晚餐的“实际用餐者”
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals.lunch.actual_diners) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
    },
    methods: {
        loadGetOwnClass: function () {
            const params = { page: 1, page_size: 200 };
            GetOwnClass(params)
                .then((res) => {
                    this.ownClass = res.payload.class;
                    this.class_id = res.payload.class[0]["id"];
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.permissionDenied = true;
                    } else {
                        this.$notify({ duration: 5000, title: err.data, type: "error" });
                    }
                });
        },
        loadGetMealsReport: function () {
            let parts = this.yearMonth.split("-");
            const params = {
                cid: this.class_id,
                y: parts[0],
                m: parts[1],
            };

            GetMealsReport(params)
                .then((res) => {
                    this.tableData = res.payload.report;
                    this.switchButtonLoading();
                })
                .catch((err) => {
                    this.tableData = [];
                    if (err.status === 403) {
                        this.permissionDenied = true;
                    } else {
                        this.$notify({ duration: 5000, title: err.data, type: "error" });
                    }
                });
        },
        onChanClass() {
            this.loadGetMealsReport();
        },
        onChanYearMonth() {
            this.loadGetMealsReport();
        },
        switchButtonLoading(val = false) {
            // 切换按钮的加载状态
            if (val === "pm" || val === "tm" || val === "nm" || val === "rf" || val === "pr") {
                this.bl[val] = true;
                this.bl["pl"] = true;
            } else {
                this.bl = {
                    pm: false,
                    tm: false,
                    nm: false,
                    rf: false,
                    pr: false,
                };
            }
        },
        // 辅助方法，用于格式化日期为YYYY-MM
        formatDate(date) {
            let year = date.getFullYear();
            let month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以要+1
            return `${year}-${month}`;
        },
        onPreviousMonth() {
            this.switchButtonLoading("pm");
            let date = new Date(this.yearMonth);
            date.setMonth(date.getMonth() - 1);
            this.yearMonth = this.formatDate(date);
            this.onRefresh(); // 使用刷新函数，可以使刷新按钮也进入loading状态
        },
        onCurrentMonth() {
            this.switchButtonLoading("tm");
            this.yearMonth = this.formatDate(new Date());
            this.onRefresh();
        },
        onNextMonth() {
            this.switchButtonLoading("nm");
            let date = new Date(this.yearMonth);
            date.setMonth(date.getMonth() + 1);
            this.yearMonth = this.formatDate(date);
            this.onRefresh();
        },
        onRefresh() {
            this.switchButtonLoading("rf");
            this.loadGetMealsReport();
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        print(displayClass) {
            // 打印功能
            let title = `查看报表 - 阳坝镇中心小学 - 班级月就餐信息 - ${this.yearMonth}`;
            let headline = `阳坝镇中心小学 ● ${displayClass}`;
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
        this.switchButtonLoading("rf");
        this.yearMonth = this.formatDate(new Date());
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
