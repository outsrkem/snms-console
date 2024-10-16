<template>
    <div>
        <el-dialog
            v-model="dialogVisible"
            title="数据订正"
            width="1000"
            draggable
            :close-on-click-modal="false"
            destroy-on-close
            :before-close="onCloseDialog"
        >
            <div style="margin: 20px">
                <div style="text-align: center; margin-top: 20px">
                    <!-- 父容器，用于水平居中和添加一些顶部间距 -->
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <!-- Flexbox 容器，用于水平排列元素并添加间距 -->
                        <div style="flex: 1; max-width: 360px">
                            <el-date-picker
                                size="small"
                                v-model="from.date"
                                type="date"
                                value-format="YYYY-MM-DD"
                                :clearable="false"
                                style="width: 100%"
                                @change="onCleanData"
                            />
                        </div>

                        <div style="flex: 1; max-width: 360px">
                            <el-select size="small" v-model="from.classId" placeholder="选择班级" style="width: 100%" @change="onCleanData">
                                <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id" />
                            </el-select>
                        </div>

                        <div style="flex: 1; max-width: 360px">
                            <el-select size="small" v-model="from.period" placeholder="选择就餐时段" style="width: 100%" @change="onCleanData">
                                <el-option v-for="item in periods" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </div>
                        <div style="flex: 0 0 auto">
                            <!-- 按钮不扩展，保持其自然大小 -->
                            <el-button type="primary" size="small" @click="onSelectRecord()">查询数据</el-button>
                        </div>
                    </div>
                </div>
                <el-divider style="margin-top: 10px; margin-bottom: 10px"></el-divider>
                <!-- <div>{{ from }}</div> -->
                <!-- <div>{{ detailInfo }}</div> -->
                <!-- <el-divider style="margin-bottom: 10px; margin-top: 10px"><el-text>原始数据</el-text></el-divider> -->
                <div>
                    <el-table :data="detailInfo" style="width: 100%">
                        <el-table-column prop="meal_date" label="就餐日期" />
                        <el-table-column label="就餐时段">
                            <template #default="scope">
                                <span>{{ displayPeriods(scope.row.meal_period) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="班级">
                            <template #default="scope">
                                <span>{{ displayClass(scope.row.class_id) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="expected_diners" label="应有人数" />
                        <el-table-column prop="actual_diners" label="实际人数" />
                        <el-table-column prop="absent_diners" label="未就餐学生" />
                    </el-table>
                </div>
                <el-divider style="margin-bottom: 20px; margin-top: 20px"><el-text>订正数据</el-text></el-divider>

                <div style="text-align: center; margin-top: 20px; margin-bottom: 20px">
                    <!-- 父容器，用于水平居中和添加一些顶部间距 -->
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <!-- Flexbox 容器，用于水平排列元素并添加间距 -->
                        <div style="flex: 1; max-width: 150px">
                            <el-text>应有人数</el-text>
                            <el-input v-model="updateDate.expected_diners" placeholder="应有人数" />
                        </div>
                        <div style="flex: 1; max-width: 150px">
                            <span>实际人数</span>
                            <el-input v-model="updateDate.actual_diners" placeholder="实际人数" />
                        </div>
                        <div style="flex: 1; max-width: 100%">
                            <span>未就餐学生(姓名之间使用英文逗号或空格分隔)</span>
                            <el-input v-model="updateDate.absent_diners" placeholder="未就餐学生" @input="onNameCount()"
                                ><template #append>{{ nameCount }}</template></el-input
                            >
                        </div>
                    </div>
                </div>

                <div>
                    <div style="display: flex; justify-content: flex-end">
                        <el-text type="danger" style="margin-right: 12px">{{ checkmsg }}</el-text>
                        <el-button style="width: 100px" @click="onCloseDialog()">取消</el-button>
                        <el-button style="width: 100px" type="primary" :disabled="SubmitDisabled" :loading="SubmitLoading" @click="onSubmit()"
                            >确认</el-button
                        >
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { GetAllClass, GetMealsDetail, UpdateMealsRecord } from "@/api/index.js";
export default {
    name: "UpdateRecord",
    data() {
        return {
            dialogVisible: false,
            periods: [
                { value: "breakfast", label: "早餐" },
                { value: "lunch", label: "午餐" },
                { value: "dinner", label: "晚餐" },
            ],
            classList: [],
            from: {
                period: "",
                classId: "",
                date: "",
            },
            detailInfo: [],
            updateDate: {
                expected_diners: "",
                actual_diners: "",
                absent_diners: "",
            },
            record: "",
            SubmitDisabled: true,
            SubmitLoading: false,
            nameCount: "",
            checkmsg: "",
        };
    },

    methods: {
        // 显示班级
        displayClass(classId) {
            if (classId != "") {
                return this.classList.find((item) => item.id === classId).name;
            } else {
                return "";
            }
        },
        // 显示就餐时段
        displayPeriods(val) {
            //meal_period
            if (val != "") {
                return this.periods.find((item) => item.value === val).label;
            } else {
                return "";
            }
        },
        // 打开弹窗
        openUpdateRecordDialog() {
            this.loadGetAllClass();
            this.from.date = this.formatDate();
            this.dialogVisible = true;
        },
        // 查询所有班级
        loadGetAllClass: function () {
            const params = { page: 1, page_size: 200 };
            GetAllClass(params)
                .then((res) => {
                    this.classList = res.payload.class;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 5000, title: "您没有权限", type: "warning" });
                    } else {
                        this.$notify({ duration: 5000, title: "系统错误", type: "warning" });
                    }
                });
        },
        // 辅助方法，用于格式化日期为YYYY-MM-DD
        formatDate() {
            let today = new Date();
            let year = today.getFullYear();
            let month = String(today.getMonth() + 1).padStart(2, "0"); // 月份从0开始，所以要+1
            let day = String(today.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        },
        // 查询数据
        loadGetMealsDetail: function () {
            this.updateDate = {};
            this.detailInfo = [];
            const paths = { class_id: this.from.classId };
            const params = { md: this.from.date, mp: this.from.period };
            GetMealsDetail(paths, params)
                .then((res) => {
                    const detail = res.payload.detail;
                    if (detail.length > 0) {
                        this.record = detail[0].id;
                        this.detailInfo = detail;
                        this.updateDate.expected_diners = detail[0].expected_diners;
                        this.updateDate.actual_diners = detail[0].actual_diners;
                        this.updateDate.absent_diners = detail[0].absent_diners;
                        this.SubmitDisabled = false;
                        this.onNameCount(); // 计算姓名数目
                    } else {
                        this.$notify({ duration: 2000, title: "没有查询到数据", type: "warning" });
                    }
                })
                .catch((err) => {
                    this.$notify({ duration: 5000, title: "查询失败", message: err.date, type: "error" });
                });
        },
        // 发送修改数据请求
        loadUpdateMealsRecord: function (data) {
            const paths = { id: this.record };
            UpdateMealsRecord(paths, data)
                .then(() => {
                    this.onCloseDialog();
                    this.$notify({ duration: 2000, title: "操作成功", type: "warning" });
                    this.SubmitLoading = false;
                })
                .catch((err) => {
                    if (err.status === 403) {
                        this.$notify({ duration: 2000, title: "您没有权限", type: "warning" });
                    } else {
                        this.$notify({ duration: 2000, title: "操作失败", type: "warning" });
                    }
                    this.SubmitLoading = false;
                });
        },
        // 关闭弹窗
        onCloseDialog() {
            this.dialogVisible = false;
            this.from = {};
            this.onCleanData();
        },
        // 重置数据及状态
        onCleanData() {
            this.SubmitDisabled = true;
            this.updateDate = {};
            this.detailInfo = [];
            this.nameCount = "";
            this.checkmsg = "";
        },
        // 计算输入了几个姓名
        onNameCount() {
            //先将字符串中的逗号替换成空格，在去除两端的空格，英文首位的逗号替换后就多个空格，导致计算多一个人
            let namse = this.updateDate.absent_diners.replace(/[,]/g, " ").trim();
            const nameArr = namse === "" ? [] : namse.split(/\s+/);
            this.nameCount = nameArr.length + "人";
        },
        onSubmit() {
            let expected_diners = Number(this.updateDate.expected_diners); // 预期人数
            let actual_diners = Number(this.updateDate.actual_diners); // 实际人数

            if (expected_diners < actual_diners) {
                this.checkmsg = "实际人数超了应有人数";
                return;
            }
            // 处理姓名并检测数目是否匹配
            let namse = this.updateDate.absent_diners.trim().replace(/,/g, " ").trim();
            const nameArr = namse === "" ? [] : namse.split(/\s+/);
            if (nameArr.length != expected_diners - actual_diners) {
                this.checkmsg = "未就餐学生所填数据不匹配";
                return;
            }
            let absent_diners = nameArr.join(",");
            let oldData = this.detailInfo[0];
            if (expected_diners === oldData.expected_diners && actual_diners === oldData.actual_diners && absent_diners === oldData.absent_diners) {
                this.checkmsg = "数据没有修改";
                return;
            }
            this.SubmitLoading = true;
            const data = {
                expected_diners: expected_diners,
                actual_diners: actual_diners,
                absent_diners: absent_diners,
            };
            this.loadUpdateMealsRecord(data);
        },
        onSelectRecord() {
            // const paths = { class_id: this.from.classId };
            // const params = { md: this.from.date, mp: this.from.period };
            if (this.from.date === "") {
                this.$notify({ duration: 2000, title: "请选择就餐日期", type: "warning" });
                return;
            }
            if (this.from.classId === "") {
                this.$notify({ duration: 2000, title: "请选择班级", type: "warning" });
                return;
            }
            if (this.from.period === "") {
                this.$notify({ duration: 2000, title: "请选择就餐时段", type: "warning" });
                return;
            }
            this.loadGetMealsDetail();
        },
    },
    created() {},
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
