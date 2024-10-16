<template>
    <div style="min-width: 1000px">
        <MyHeader title="查看报表"></MyHeader>
        <div class="my_refresh">
            <div style="margin-bottom: 10px; display: flex; justify-content: left; align-items: center">
                <span>报表类型：</span>
                <el-button :type="ms.type" size="small" @click="onSwitchReport('ms')">单个班级月报表</el-button>
                <el-button :type="da.type" size="small" @click="onSwitchReport('da')">所有班级日报表</el-button>
                <el-button :type="ma.type" size="small" @click="onSwitchReport('ma')">所有班级月报表</el-button>
            </div>
            <div>
                <el-button type="primary" size="small" @click="onUpdateRecord()">数据订正</el-button>
            </div>
        </div>
        <el-divider style="margin-top: 10px; margin-bottom: 10px"></el-divider>
        <DailyMeals v-if="rda === true" ref="Refresh" />
        <MonthlyMeals v-if="rms" ref="Refresh" />
        <MealsAll v-if="rma" ref="Refresh"></MealsAll>
        <UpdateRecord ref="UpdateRecord" @call-parent="onRefresh"></UpdateRecord>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import DailyMeals from "./dailyMeals.vue";
import MonthlyMeals from "./monthlyMeals.vue";
import MealsAll from "./mealsAll.vue";
import UpdateRecord from "./updateRecord.vue";
export default {
    name: "ReportIndex",
    components: { MyHeader, DailyMeals, MonthlyMeals, MealsAll, UpdateRecord },
    props: {},
    data() {
        return {
            report: "da", // da, ma, ms
            da: {
                //所有班级日报表
                type: "",
                disabled: false,
            },
            ma: {
                //所有班级月报表
                type: "",
                disabled: false,
            },
            ms: {
                //单个班级月报表
                type: "",
                disabled: false,
            },
            rda: false, // 报表类型：report  DailyMeals
            rma: false,
            rms: false, //单个班级月报表
        };
    },
    computed: {},
    methods: {
        onSwitchReport(val = "ms") {
            this.$router.push({ query: { t: val } });
            this.da.type = "";
            this.ma.type = "";
            this.ms.type = "";
            this.rda = false;
            this.rma = false;
            this.rms = false;
            if (val === "da") {
                this.rda = true;
                this.da = {
                    type: "primary",
                    disabled: true,
                };
                return;
            }
            if (val === "ma") {
                this.rma = true;
                this.ma = {
                    type: "primary",
                    disabled: true,
                };
                return;
            }
            if (val === "ms") {
                this.rms = true;
                this.ms = {
                    type: "primary",
                    disabled: true,
                };
                return;
            }
        },
        // 刷新子页面页面
        onRefresh() {
            this.$refs.Refresh.onRefresh();
        },
        onUpdateRecord() {
            this.$refs.UpdateRecord.openUpdateRecordDialog();
        },
    },
    created() {
        this.onSwitchReport(this.$route.query.t);
    },
};
</script>

<style scoped lang="less">
.my_refresh {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
