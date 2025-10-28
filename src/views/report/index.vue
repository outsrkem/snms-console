<template>
    <div>
        <el-card>
            <template #header>
                <div class="my_refresh">
                    <div>
                        <el-space>
                            <span>报表管理</span>
                            <el-button :type="ms.type" @click="onSwitchReport('ms')">单个班级月报表</el-button>
                            <el-button :type="da.type" @click="onSwitchReport('da')">所有班级日报表</el-button>
                            <el-button :type="ma.type" @click="onSwitchReport('ma')">所有班级月报表</el-button>
                        </el-space>
                    </div>
                    <div>
                        <el-space>
                            <el-button type="primary" @click="onUpdateRecord()">数据订正</el-button>
                            <el-button type="primary" :icon="Refresh" @click="onRefresh()" :loading="loading">刷新</el-button>
                        </el-space>
                    </div>
                </div>
            </template>
            <div>
                <!-- 权限拒绝提示 -->
                <div v-if="permissionDenied === true">
                    <el-result icon="warning" title="您没有权限" />
                </div>
                <div v-else style="min-width: 1080px">
                    <div class="my_refresh"></div>
                    <!-- 修复：给每个子组件设置唯一ref，避免重复覆盖 -->
                    <DailyMeals v-if="rda === true" ref="dailyMealsRef" />
                    <MonthlyMeals v-if="rms" ref="monthlyMealsRef" @permission-message="PermissionMessage" />
                    <MealsAll v-if="rma" ref="mealsAllRef" />
                    <UpdateRecord ref="UpdateRecord" @call-parent="onRefresh"></UpdateRecord>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import { Refresh } from "@element-plus/icons-vue";
import DailyMeals from "./dailyMeals.vue";
import MonthlyMeals from "./monthlyMeals.vue";
import MealsAll from "./mealsAll.vue";
import UpdateRecord from "./updateRecord.vue";
export default {
    name: "ReportIndex",
    components: { DailyMeals, MonthlyMeals, MealsAll, UpdateRecord },
    props: {},
    setup() {
        return {
            Refresh, // 图标组件，与ref无关
        };
    },
    data() {
        return {
            loading: false,
            permissionDenied: false, // 修复：初始值应为布尔值，原"false"是字符串，可能导致判断异常
            report: "da", // da=所有班级日报表，ma=所有班级月报表，ms=单个班级月报表
            da: {
                type: "",
                disabled: false,
            },
            ma: {
                type: "",
                disabled: false,
            },
            ms: {
                type: "",
                disabled: false,
            },
            rda: false, // 控制所有班级日报表显示
            rma: false, // 控制所有班级月报表显示
            rms: false, // 控制单个班级月报表显示
        };
    },
    computed: {},
    methods: {
        onSwitchReport(val = "ms") {
            this.$router.push({ query: { t: val } });
            // 重置所有按钮状态和报表显示状态
            this.da.type = "";
            this.ma.type = "";
            this.ms.type = "";
            this.da.disabled = false;
            this.ma.disabled = false;
            this.ms.disabled = false;
            this.rda = false;
            this.rma = false;
            this.rms = false;

            // 激活当前选中的报表
            if (val === "da") {
                this.rda = true;
                this.da.type = "primary";
                this.da.disabled = true;
            } else if (val === "ma") {
                this.rma = true;
                this.ma.type = "primary";
                this.ma.disabled = true;
            } else if (val === "ms") {
                this.rms = true;
                this.ms.type = "primary";
                this.ms.disabled = true;
            }
        },
        // 修复：根据当前显示的报表，调用对应子组件的刷新方法
        onRefresh() {
            // 适配不同报表的刷新逻辑（使用?.避免组件未渲染导致的undefined错误）
            if (this.rda) {
                // 刷新所有班级日报表
                this.$refs.dailyMealsRef?.onRefresh();
            } else if (this.rma) {
                // 刷新所有班级月报表
                this.$refs.mealsAllRef?.onRefresh();
            } else if (this.rms) {
                // 刷新单个班级月报表
                this.$refs.monthlyMealsRef?.onRefresh();
            }
        },
        onUpdateRecord() {
            // 调用数据订正组件的弹窗方法
            this.$refs.UpdateRecord?.openUpdateRecordDialog();
        },
        // 接收子组件的权限状态
        PermissionMessage(msg) {
            this.permissionDenied = msg;
        },
    },
    created() {
        this.$globalBus.emit("updateActivePath", "/report");
        // 初始化时根据路由参数切换报表（默认值为"da"）
        this.onSwitchReport(this.$route.query.t || "da");
    },
};
</script>

<style scoped lang="less">
/* 修复：添加头部布局样式，避免按钮重叠 */
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
</style>
