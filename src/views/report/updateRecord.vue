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

                <div>
                    <el-table :data="originalData" style="width: 100%">
                        <el-table-column prop="expected" label="应有人数" />
                        <el-table-column prop="actual" label="实际人数" />
                        <el-table-column prop="canteen_absent_diners" label="未就餐学生" />
                    </el-table>
                </div>
                <!-- 有数据才展示输入表单 -->
                <div v-if="originalData.length > 0">
                    <el-divider style="margin-bottom: 20px; margin-top: 20px"><el-text>订正数据</el-text></el-divider>
                    <div style="display: flex">
                        <div style="width: 50%; padding-right: 10px">
                            <el-form label-position="top" label-width="auto" :model="detailInfo">
                                <el-form-item label="应有人数">
                                    <el-input v-model="detailInfo.expected" disabled />
                                </el-form-item>
                                <el-form-item label="实际人数">
                                    <el-input v-model="detailInfo.actual" disabled />
                                </el-form-item>
                                <el-form-item label="未就餐学生">
                                    <el-input v-model="detailInfo.canteen_absent_diners" disabled>
                                        <template #append>{{ detailInfo.canteen_number }}人</template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                        </div>
                        <div style="width: 50%; padding-left: 10px">
                            <el-form label-position="top" label-width="auto" :model="updateDate">
                                <el-form-item label="应有人数">
                                    <el-input v-model="updateDate.expected" @input="onCleanMsg()" />
                                </el-form-item>
                                <el-form-item label="实际人数">
                                    <el-input v-model="updateDate.actual" @input="onCleanMsg()" />
                                </el-form-item>
                                <el-form-item label="未就餐学生(姓名之间使用英文逗号或空格分隔)">
                                    <el-input v-model="updateDate.canteen_absent_diners" @input="onNameCountCanteen()">
                                        <template #append>{{ updateDate.canteen_number }}人</template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
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
                { value: "enterprise", label: "企业" },
            ],
            classList: [],
            from: {
                period: "",
                classId: "",
                date: "",
            },
            originalData: [], // 原始数据列表
            detailInfo: [], // 本次待修改数据
            // 更新后的数据
            updateDate: {
                expected: "",
                actual: "",
                canteen_absent_diners: "",
                enterprise_absent_diners: "",
            },
            record: "", // 待修改的数据id
            SubmitDisabled: true,
            SubmitLoading: false,
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
            this.detailInfo = {};
            this.originalData = [];
            const paths = { class_id: this.from.classId };
            const params = { md: this.from.date, mp: this.from.period };
            GetMealsDetail(paths, params)
                .then((res) => {
                    const detail = res.payload.detail;
                    if (detail.length > 0) {
                        this.record = detail[0].id;
                        this.detailInfo = detail[0];
                        this.originalData = detail; // 加载原始数据，用表格展示，用于检查数据重复的情况
                        this.updateDate = {
                            expected: detail[0].expected,
                            actual: detail[0].actual,
                            period: detail[0].period,
                            canteen_number: detail[0].canteen_number,
                            canteen_absent_diners: detail[0].canteen_absent_diners,
                            enterprise_number: detail[0].enterprise_number,
                            enterprise_absent_diners: detail[0].enterprise_absent_diners,
                        };
                        this.SubmitDisabled = false;
                    } else {
                        this.$notify({ duration: 2000, title: "没有查询到数据", type: "warning" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$notify({ duration: 5000, title: "查询失败", message: err.date, type: "error" });
                });
        },
        // 发送修改数据请求
        loadUpdateMealsRecord: function (data) {
            const paths = { id: this.record };
            UpdateMealsRecord(paths, data)
                .then(() => {
                    this.onRefresh(); // 刷新页面
                    this.onCloseDialog();
                    this.$notify({ duration: 2000, title: "操作成功", type: "success" });
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
        // 更新页面
        onRefresh() {
            this.$emit("call-parent");
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
            this.detailInfo = {};
            this.originalData = [];
            this.checkmsg = "";
        },
        // 重置检查消息
        onCleanMsg() {
            this.checkmsg = "";
        },
        // 查询数据
        onSelectRecord() {
            if (!this.from.date || this.from.date === "") {
                this.$notify({ duration: 2000, title: "请选择就餐日期", type: "warning" });
                return;
            }
            if (!this.from.classId || this.from.classId === "") {
                this.$notify({ duration: 2000, title: "请选择班级", type: "warning" });
                return;
            }
            if (!this.from.period || this.from.period === "") {
                this.$notify({ duration: 2000, title: "请选择就餐时段", type: "warning" });
                return;
            }
            this.loadGetMealsDetail();
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
        // 计算输入了几个姓名（食堂）
        onNameCountCanteen() {
            this.onCleanMsg();
            this.updateDate.canteen_number = this.statisticsStudent(this.updateDate.canteen_absent_diners);
        },
        // 计算输入了几个姓名（企业）
        onNameCountEnterprise() {
            this.onCleanMsg();
            this.updateDate.enterprise_number = this.statisticsStudent(this.updateDate.enterprise_absent_diners);
        },
        // 提交按钮
        onSubmit() {
            let expected = Number(this.updateDate.expected); // 预期人数
            let actual = Number(this.updateDate.actual); // 实际人数
            let canteen_number = Number(this.updateDate.canteen_number); //食堂未就餐数目
            let enterprise_number = Number(this.updateDate.enterprise_number); // 企业未就餐数目
            let allStudentsWithoutMeals = canteen_number + enterprise_number; // 所有未就餐学生姓名统计之和
            if (expected < actual) {
                this.checkmsg = "实际人数超了应有人数";
                return;
            }
            // 处理姓名并检测数目是否匹配
            if (allStudentsWithoutMeals + actual != expected) {
                console.log("allStudentsWithoutMeals: ", allStudentsWithoutMeals);
                console.log("actual: ", actual);
                console.log("expected: ", expected);
                this.checkmsg = "未就餐学生所填数据不匹配";
                return;
            }

            // 把姓名转换为目标格式(用逗号分隔)
            let canteen_absent_diners = this.strNameToArr(this.updateDate.canteen_absent_diners).join(",");
            let enterprise_absent_diners = this.strNameToArr(this.updateDate.enterprise_absent_diners).join(",");
            let oldData = this.detailInfo;
            // 检查数据是否修改
            if (
                expected === oldData.expected &&
                actual === oldData.actual &&
                canteen_absent_diners === oldData.canteen_absent_diners &&
                enterprise_absent_diners === oldData.enterprise_absent_diners
            ) {
                this.checkmsg = "数据没有修改";
                return;
            }
            this.SubmitLoading = true;
            // 准备提交的数据
            const data = {
                expected: expected, // 预期人数
                actual: actual, // 实际人数
                canteen_number: canteen_number, // 食堂人数
                canteen_absent_diners: canteen_absent_diners, // 食堂姓名
                enterprise_number: enterprise_number, // 企业人数
                enterprise_absent_diners: enterprise_absent_diners, // 企业姓名
            };
            this.loadUpdateMealsRecord(data);
        },
    },
    created() {},
};
</script>

<style scoped lang="less"></style>
