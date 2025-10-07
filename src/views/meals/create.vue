<template>
    <div>
        <el-dialog v-model="dialogVisible" title="登记就餐数据" width="600">
            <MealsIndex ref="mealsIndex" />
        </el-dialog>
    </div>
</template>

<script>
import MealsIndex from "../../components/meals/meals.vue";
export default {
    name: "CreateMeals",
    components: { MealsIndex },
    data() {
        return {
            dialogVisible: false,
        };
    },
    methods: {
        // 打开创建对话框
        openDialog() {
            this.dialogVisible = true;
        },
    },
};
</script>

<style scoped></style>
