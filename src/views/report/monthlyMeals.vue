<template>
    <div>
        <div style="margin-bottom: 10px; display: flex; justify-content: left; align-items: center">
            <div style="margin-right: 20px">
                <h4 style="margin-top: 0px; margin-bottom: 0px">{{ schoolName }} ● {{ displayClass }}</h4>
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
                <el-button size="small" type="success" :loading="bl.pm" @click="onPreviousMonth">前一月</el-button>
                <el-button size="small" type="success" :loading="bl.tm" @click="onCurrentMonth">本月</el-button>
                <el-button size="small" type="success" :loading="bl.nm" @click="onNextMonth">后一月</el-button>
                <el-button size="small" type="success" :loading="bl.rf" @click="onRefresh">刷新</el-button>
                <el-button size="small" type="success" :loading="bl.pr" @click="onPrint(displayClass)">打印</el-button>
            </div>
        </div>
        <div v-loading="bl.pl">
            <div id="print-body">
                <table>
                    <thead style="display: table-header-group">
                        <tr>
                            <th>班级</th>
                            <th>{{ displayClass }}</th>
                            <th colspan="3">早餐</th>
                            <th colspan="3">午餐</th>
                            <th v-if="showDinner" colspan="3">晚餐</th>
                            <th colspan="3">企业</th>
                        </tr>
                        <tr>
                            <th class="serial-col">No.</th>
                            <th class="meal-col">就餐日期</th>
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
                            <td>{{ item.dining_date }}</td>
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
                        <!-- 没有数据不显示合计行 -->
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
                <div v-if="tableData.length === 0"><el-empty :image-size="200" /></div>
            </div>
        </div>
    </div>
</template>
<!-- 单个班级月报表 -->
<script>
import { withDelay } from "../../utils/common.js";
import { isTimestampOver } from "../../utils/date.js";
import { msgcon } from "../../utils/message.js";
import { GetAllClass, GetMonthlyMeals, RequestPrint } from "@/api/index.js";
export default {
    name: "MonthlyMeals", // 单个班级月报表
    data() {
        return {
            tableData: [],
            ownClass: "",
            class_id: "",
            yearMonth: "",
            bl: {
                // 按钮加载状态集合
                pm: false, // 前一月
                tm: false, // 本月
                nm: false, // 后一月
                rf: false, // 刷新
                pr: false, // 打印
                pl: false, // 页面加载
            },
            currentDate: new Date(), // 默认当前日期
            options: {},
            schoolName: "",
            resptime: null, // 响应时间戳（用于打印超时判断）
        };
    },
    computed: {
        displayClass() {
            // 匹配当前选中班级名称（可选链避免无数据报错）
            return this.class_id ? this.ownClass.find((item) => item.id === this.class_id)?.name || "" : "";
        },
        showDinner() {
            // 从本地存储控制晚餐列显示/隐藏，默认显示
            const cor = JSON.parse(window.localStorage.getItem("COLUMN_OF_REPORT") || "{}");
            return cor.dinner !== "off";
        },
    },
    watch: {
        // 监听班级ID变化，有值时加载数据（初始化立即执行）
        class_id: {
            immediate: true,
            handler(newVal) {
                if (newVal) this.loadGetMonthlyMeals();
            },
        },
    },
    methods: {
        // 表格列求和（x1=餐别类型，x2=统计字段：expected/actual）
        calculateColumn(x1, x2) {
            return this.tableData.reduce((sum, item) => {
                const val = Number(item.meals[x1][x2]) || 0;
                return sum + val;
            }, 0);
        },
        // 加载学校名称（从本地存储获取，默认空字符串）
        loadSchoolName() {
            this.schoolName = window.localStorage.getItem("SCHOOL_NAME") || "";
        },
        // 加载所有班级列表
        loadGetAllClass() {
            GetAllClass({ page: 1, page_size: 200 })
                .then((res) => {
                    this.ownClass = res.payload.class;
                    this.class_id = res.payload.class[0]?.id || ""; // 默认选中第一个班级
                })
                .catch((err) => {
                    if (err.status === 403) this.SendPermissionMessage();
                    else this.$notify({ duration: 5000, title: err.data, type: "error" });
                });
        },
        // 加载月度就餐数据
        loadGetMonthlyMeals() {
            const [y, m] = this.yearMonth.split("-");
            const paths = { class_id: this.class_id };
            const params = { y, m };

            withDelay(() => GetMonthlyMeals(paths, params))
                .then((res) => {
                    this.resptime = res.metadata.time;
                    this.tableData = res.payload.items;
                    this.switchButtonLoading(); // 关闭所有加载状态
                })
                .catch((err) => {
                    this.tableData = [];
                    if (err.status === 403) this.SendPermissionMessage();
                    else this.$notify({ duration: 5000, title: err.data, type: "error" });
                });
        },
        // 发送权限不足事件（给父组件处理）
        SendPermissionMessage() {
            this.$emit("permission-message", true);
        },
        // 切换班级触发刷新
        onChanClass() {
            this.onRefresh();
        },
        // 切换年月触发刷新
        onChanYearMonth() {
            this.onRefresh();
        },
        // 控制按钮加载状态：val为按钮标识（如pm/tm），默认关闭所有加载
        switchButtonLoading(val = false) {
            if (["pm", "tm", "nm", "rf", "pr"].includes(val)) {
                this.bl[val] = true;
                this.bl.pl = true;
            } else {
                Object.keys(this.bl).forEach((key) => (this.bl[key] = false));
            }
        },
        // 格式化日期为 YYYY-MM 格式
        formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            return `${year}-${month}`;
        },
        // 前一月
        onPreviousMonth() {
            this.switchButtonLoading("pm");
            const date = new Date(this.yearMonth);
            date.setMonth(date.getMonth() - 1);
            this.yearMonth = this.formatDate(date);
            this.onRefresh();
        },
        // 本月
        onCurrentMonth() {
            this.switchButtonLoading("tm");
            this.yearMonth = this.formatDate(new Date());
            this.onRefresh();
        },
        // 后一月
        onNextMonth() {
            this.switchButtonLoading("nm");
            const date = new Date(this.yearMonth);
            date.setMonth(date.getMonth() + 1);
            this.yearMonth = this.formatDate(date);
            this.onRefresh();
        },
        // 刷新数据
        onRefresh() {
            this.switchButtonLoading("rf");
            this.loadGetMonthlyMeals();
        },
        // 执行打印逻辑
        executePrint(displayClass) {
            const title = `查看报表 - ${this.schoolName} - 班级月就餐信息 - ${this.yearMonth}`;
            const headline = `${this.schoolName} ● ${displayClass}`;
            const html = document.getElementById("print-body").innerHTML;

            // 打开新窗口打印
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8" />
                    <title>${title}</title>
                    <style>
                        table {width: 100%;border-collapse: collapse;}
                        th, td {border: 1px solid #000;text-align: center;padding: 3px;}
                        .meal-col {min-width: 100px;}
                        .serial-col {min-width: 40px;}
                        @media print {
                            body::before {content: "${headline}";display: block;text-align: center;font-size: 15px;font-weight: bold;margin-bottom: 20px;}
                            th, td {font-size: 8pt;}
                            thead {display: table-header-group;}
                            table {width: 100% !important;}
                            tr, td {page-break-inside: avoid;}
                            @page {margin: 1cm 1.5cm;}
                        }
                    </style>
                </head>
                <body><div class="print-content">${html}</div></body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        },
        // 打印按钮点击事件（含权限校验和超时判断）
        onPrint(displayClass) {
            this.bl.pr = true;
            // 数据超时（1分钟前加载），提示刷新
            if (isTimestampOver(this.resptime, 1)) {
                this.$message.warning(msgcon("当前数据已超时，请点击刷新后再打印"));
                this.bl.pr = false;
                return;
            }

            // 校验打印权限
            RequestPrint({ report_name: "MonthlyMeals" })
                .then(() => {
                    this.bl.pr = false;
                    // 无学校名称时弹窗确认
                    if (!this.schoolName) {
                        this.$confirm("没有获取到学校名称，是否继续打印？", "警告", {
                            confirmButtonText: "继续",
                            cancelButtonText: "取消",
                            type: "warning",
                        }).then(() => this.executePrint(displayClass));
                    } else {
                        this.executePrint(displayClass);
                    }
                })
                .catch((err) => {
                    this.bl.pr = false;
                    const msg = err.status === 403 ? "您没有打印权限" : "打印错误";
                    this.$notify({ duration: 5000, title: msg, type: err.status === 403 ? "warning" : "error" });
                });
        },
    },
    created() {
        this.loadSchoolName();
        this.switchButtonLoading("rf"); // 初始化时开启刷新按钮加载状态
        this.yearMonth = this.formatDate(new Date()); // 默认当前年月
        this.loadGetAllClass(); // 加载班级列表
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
    border: 1px solid #000;
    text-align: center;
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
