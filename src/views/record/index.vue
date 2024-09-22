<template>
    <MyHeader title="查看记录明细"></MyHeader>
    <div>
        <el-select v-model="class_id" size="large" @change="onChanClass">
            <el-option v-for="(item, index) in ownClass" :key="index" :label="item.name" :value="item.id" />
        </el-select>
        <div style="margin-bottom: 10px"></div>
        <el-collapse v-model="activeName" accordion>
            <el-collapse-item
                v-for="(item, index) in detailInfo"
                :key="index"
                :title="item.meal_date + '     ' + formatPeriod(item.meal_period)"
                :name="index"
            >
                <div>
                    <el-text>班级：{{ showClassName(item.class_id) }}</el-text>
                </div>
                <div>
                    <el-text>应就餐人数：{{ item.expected_diners }}</el-text>
                </div>
                <div>
                    <el-text>实际就餐人数：{{ item.actual_diners }}</el-text>
                </div>
                <div>
                    <el-text>未就餐学生：</el-text>
                    <span v-for="(item, index) in formatStuName(item.absent_diners)" :key="index">
                        <span style="margin-left: 2px; margin-right: 2px"
                            ><el-tag type="primary" size="small">{{ item }}</el-tag>
                        </span>
                    </span>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { GetOwnClass, GetMealsDetail } from "@/api/index.js";
export default {
    name: "RecordIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            detailInfo: "",
            activeName: null,
            ownClass: "",
            class_id: "",
            countdownTimer: null,
        };
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
        loadGetMealsDetail: function () {
            const paths = { class_id: this.class_id };
            GetMealsDetail(paths)
                .then((res) => {
                    this.detailInfo = res.payload.detail;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        showClassName(class_id) {
            // 再班级中找到当前选中的id，并获取其班级名称
            return this.ownClass.find((item) => item.id === class_id).name;
        },
        formatPeriod(item) {
            let value = "";
            switch (item) {
                // 'breakfast 早','lunch 午','dinner 晚'
                case "breakfast":
                    value = "早餐";
                    break;
                case "lunch":
                    value = "午餐";
                    break;
                case "dinner":
                    value = "晚餐";
                    break;
            }
            return value;
        },
        formatStuName(item) {
            const nameArr = item === "" ? [] : item.split(",");
            return nameArr;
        },
        onBack() {
            this.$router.push({ name: "home" });
        },
        onChanClass() {
            this.activeName = null;
            this.loadGetMealsDetail();
        },
        startCountdown(val = 100) {
            if (this.class_id != "" || val <= 0) {
                clearInterval(this.countdownTimer); // 清除定时器
                this.loadGetMealsDetail();
                return;
            }
            this.countdownTimer = setTimeout(() => {
                this.startCountdown(val - 1);
                // 1秒钟10次
            }, 100);
        },
    },
    created() {
        this.loadGetOwnClass();
        this.startCountdown();
    },
};
</script>

<style scoped lang="less"></style>
