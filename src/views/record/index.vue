<template>
    <MyHeader title="查看记录明细"></MyHeader>
    <div>
        <el-collapse v-model="activeName" accordion>
            <div v-for="(item, index) in detailInfo" :key="index">
                <el-collapse-item :title="item.meal_date + '     ' + formatPeriod(item.meal_period)" :name="index">
                    <div>
                        <el-text>班级：{{ item.class_id }}</el-text>
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
            </div>
        </el-collapse>
    </div>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
import { GetMealsDetail } from "@/api/index.js";
export default {
    name: "RecordIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {
            detailInfo: "",
            activeName: "",
        };
    },
    methods: {
        loadGetMealsDetail: function () {
            GetMealsDetail()
                .then((res) => {
                    this.detailInfo = res.payload.detail;
                })
                .catch((err) => {
                    console.log(err);
                });
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
    },
    created() {
        this.loadGetMealsDetail();
    },
};
</script>

<style scoped lang="less"></style>
