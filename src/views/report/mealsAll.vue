<template>
    <div v-if="permissionDenied === true">
        <el-result icon="warning" title="您没有权限" />
    </div>
    <div v-else>
        <div style="margin-bottom: 10px; display: flex; justify-content: left; align-items: center">
            <div style="margin-right: 20px">
                <h4 style="margin-top: 0px; margin-bottom: 0px">{{ schoolName }} ● {{ displayData }}就餐信息</h4>
            </div>
            <div style="margin-right: 20px">
                <el-date-picker size="small" v-model="yearMonth" type="month" value-format="YYYY-MM" :clearable="false" @change="onChanYearMonth" />
            </div>
            <div>
                <el-button size="small" type="success" :loading="bl.pm" @click="onPreviousMonth">前一月</el-button>
                <el-button size="small" type="success" :loading="bl.tm" @click="onCurrentMonth">本月</el-button>
                <el-button size="small" type="success" :loading="bl.nm" @click="onNextMonth">后一月</el-button>
                <el-button size="small" type="success" :loading="bl.rf" @click="onRefresh">刷新</el-button>
                <el-button size="small" type="success" :loading="bl.pr" @click="onPrint()">打印</el-button>
            </div>
        </div>
        <div v-loading="bl.pl">
            <div v-if="tableData.length === 0"><el-empty :image-size="200" /></div>
            <div id="print-body" v-else>
                <table>
                    <thead style="display: table-header-group">
                        <tr>
                            <th>日期</th>
                            <th>{{ displayData }}</th>
                            <!-- <th>班级</th> -->
                            <th colspan="3">早餐</th>
                            <th colspan="3">午餐</th>
                            <th v-if="showDinner" colspan="3">晚餐</th>
                            <th colspan="3">企业</th>
                        </tr>
                        <tr>
                            <th class="serial-col">No.</th>
                            <th class="meal-col">班级</th>
                            <!-- 早餐 -->
                            <th>应有人数</th>
                            <th>实际人数</th>
                            <th>未就餐学生</th>

                            <!-- 午餐 -->
                            <th>应有人数</th>
                            <th>实际人数</th>
                            <th>未就餐学生</th>

                            <!-- 晚餐 -->
                            <th v-if="showDinner">应有人数</th>
                            <th v-if="showDinner">实际人数</th>
                            <th v-if="showDinner">未就餐学生</th>

                            <!-- 企业 -->
                            <th>应有人数</th>
                            <th>实际人数</th>
                            <th>未就餐学生</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.class_name }}</td>
                            <!-- 早餐 -->
                            <td>{{ item.meals.breakfast.expected }}</td>
                            <td>{{ item.meals.breakfast.actual }}</td>
                            <td>{{ item.meals.breakfast.canteen_absent_diners }}</td>
                            <!-- 午餐 -->
                            <td>{{ item.meals.lunch.expected }}</td>
                            <td>{{ item.meals.lunch.actual }}</td>
                            <td>{{ item.meals.lunch.canteen_absent_diners }}</td>
                            <!-- 晚餐 -->
                            <td v-if="showDinner">{{ item.meals.dinner.expected }}</td>
                            <td v-if="showDinner">{{ item.meals.dinner.actual }}</td>
                            <td v-if="showDinner">{{ item.meals.dinner.canteen_absent_diners }}</td>
                            <!-- 企业 -->
                            <td>{{ item.meals.enterprise.expected }}</td>
                            <td>{{ item.meals.enterprise.actual }}</td>
                            <td>{{ item.meals.enterprise.canteen_absent_diners }}</td>
                        </tr>
                        <tr v-if="tableData.length > 0">
                            <td>--</td>
                            <td>合计</td>
                            <!-- 早餐 -->
                            <td>{{ calculateColumn("breakfast", "expected") }}</td>
                            <td>{{ calculateColumn("breakfast", "actual") }}</td>
                            <td>--</td>
                            <!-- 午餐 -->
                            <td>{{ calculateColumn("lunch", "expected") }}</td>
                            <td>{{ calculateColumn("lunch", "actual") }}</td>
                            <td>--</td>
                            <!-- 晚餐 -->
                            <td v-if="showDinner">{{ calculateColumn("dinner", "expected") }}</td>
                            <td v-if="showDinner">{{ calculateColumn("dinner", "actual") }}</td>
                            <td v-if="showDinner">--</td>
                            <!-- 企业 -->
                            <td>{{ calculateColumn("enterprise", "expected") }}</td>
                            <td>{{ calculateColumn("enterprise", "actual") }}</td>
                            <td>--</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<!-- 所有班级月报表 -->

<script>
import { withDelay } from "../../utils/common.js";
import { isTimestampOver } from "../../utils/date.js";
import { msgcon } from "../../utils/message.js";
import { GetMonthlyMealsAll, RequestPrint } from "@/api/index.js";
export default {
    name: "MealsAll", // 所有班级月报表
    data() {
        return {
            tableData: [],
            yearMonth: "",
            displayTable: false,
            permissionDenied: false,
            bl: {
                pm: false, // 前一月
                tm: false, // 本月
                nm: false, // 后一月
                rf: false, // 刷新
                pr: false, // 打印
                pl: false, // 页面加载状态
            },
            resptime: null, // 响应时间戳
        };
    },
    computed: {
        displayData() {
            let parts = this.yearMonth.split("-");
            return `${parts[0]}年${parts[1]}月`;
        },
        showDinner() {
            // 控制是否显示晚餐的表格列
            let ss = window.localStorage.getItem("COLUMN_OF_REPORT");
            let cor = JSON.parse(ss);
            if (cor.dinner === "off") {
                return false;
            } else {
                return true;
            }
        },
    },
    methods: {
        // 表格列求和统计
        calculateColumn(x1, x2) {
            let sum = this.tableData.reduce((sum, item) => {
                const score = Number(item.meals[x1][x2]) || 0;
                return sum + score;
            }, 0);
            return sum > 0 ? sum : "";
        },
        loadGetMonthlyMealsAll: function (date = this.yearMonth) {
            let parts = date.split("-");
            const params = {
                page: 1,
                page_size: 200,
                y: parts[0],
                m: parts[1],
            };
            withDelay(() => GetMonthlyMealsAll(params))
                .then((res) => {
                    this.resptime = res.metadata.time; // 保存响应时间戳
                    this.tableData = res.payload.items;
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
        onChanYearMonth() {
            this.onRefresh();
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
            let date = new Date(`${this.yearMonth} GMT+0800`);
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
            let date = new Date(`${this.yearMonth} GMT+0800`);
            date.setMonth(date.getMonth() + 1);
            this.yearMonth = this.formatDate(date);
            this.onRefresh();
        },
        onRefresh() {
            this.switchButtonLoading("rf");
            this.loadGetMonthlyMealsAll();
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        executePrint(schoolName, displayData) {
            // 打印功能
            let title = `查看报表 - ${schoolName} - 全校每月就餐信息 - ${this.yearMonth}`;
            let headline = `${schoolName} ● ${displayData}份全校就餐统计`;
            var html = document.getElementById("print-body").innerHTML;
            const printWindow = window.open("", "_blank");
            printWindow.document.write(
                `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8" /><title>${title}</title><style>table {width: 100%;border-collapse: collapse;}th, td {border: 1px solid black;text-align: center;}th, td {padding: 3px;/* 表格边框到文字的间距 */}.meal-col {min-width: 100px;}.serial-col {min-width: 40px;}@media print {body::before {content: "${headline}";display: block;text-align: center;font-size: 15px;/* 打印时表格标题字体大小 */font-weight: bold;margin-bottom: 20px;}th, td {font-size: 8pt;/* 打印时表格单元格的字体大小 */}thead {display: table-header-group;}table {width: 100% !important;border-collapse: collapse;}tr {page-break-inside: avoid;page-break-after: auto;}td {page-break-inside: avoid;}@page {margin: 1cm 1.5cm 1cm 1.5cm;/* 页边距上、右、下、左 */}}</style></head><body><div class="print-content"></div></body></html>`,
            );
            printWindow.document.close();
            const contentContainer = printWindow.document.querySelector(".print-content");
            contentContainer.innerHTML = html;
            printWindow.print();
        },
        onPrint() {
            // 打印按钮加载状态
            this.bl.pr = true;
            if (isTimestampOver(this.resptime, 1)) {
                // 如果数据时1分钟前加载的，就拒绝打印
                this.$message.warning(msgcon("当前数据已超时，请点击刷新后再打印"));
                this.bl.pr = false;
                return;
            }
            const data = { report_name: "MealsAll" };
            RequestPrint(data)
                .then(() => {
                    // 校验权限，有权限打印
                    if (this.schoolName === "" || this.schoolName === undefined || this.schoolName === null) {
                        // 没有获取到学校名称
                        this.$confirm("没有获取到学校名称，是否继续打印", "警告", {
                            confirmButtonText: "继续",
                            cancelButtonText: "取消",
                            type: "warning",
                        })
                            .then(() => {
                                this.bl.pr = false;
                                this.executePrint(this.schoolName, this.displayData);
                            })
                            .catch(() => {
                                this.bl.pr = false;
                            });
                    } else {
                        this.bl.pr = false;
                        this.executePrint(this.schoolName, this.displayData);
                    }
                })
                .catch((err) => {
                    if (err.status === 403) {
                        // 无权限打印
                        this.$notify({ duration: 5000, title: "您没有打印权限", type: "warning" });
                    } else {
                        console.log(err);
                        this.$notify({ duration: 5000, title: "打印错误", type: "error" });
                    }
                    this.bl.pr = false;
                });
        },
        loadSchoolName() {
            let sn = window.localStorage.getItem("SCHOOL_NAME");
            this.schoolName = sn;
        },
    },
    created() {
        this.loadSchoolName();
        this.yearMonth = this.formatDate(new Date());
        this.onRefresh();
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
    min-width: 120px;
}
.serial-col {
    min-width: 40px;
}
</style>
