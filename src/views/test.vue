<template>
    <MyHeader title="查看报表"></MyHeader>
    <div style="display: flex; justify-content: center; align-items: center">
        <div style="width: 30%">
            <el-select v-model="class_id" @change="onChanClass">
                <el-option v-for="item in ownClass" :key="item.value" :label="item.name" :value="item.id" />
            </el-select>
        </div>
        <div class="block">
            <span class="demonstration">月份</span>
            <el-date-picker v-model="value5" type="month" placeholder="Pick a month" />
        </div>
        <div style="width: 30%">
            <el-button type="primary" @click="printBox()">打印</el-button>
        </div>
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
        };
    },
    computed: {},
    methods: {},
    created() {},
};
</script>

<style scoped lang="less"></style>
