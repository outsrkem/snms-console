<template>
    <div>
        <el-dialog v-model="dialogVisible" title="登记就餐数据" width="600">
            <MealsIndex />
        </el-dialog>
    </div>
</template>

<script>
import { msgcon } from "../../utils/message.js";
import { CreateClass } from "../../api/index.js";
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
            // 重置表单数据
            this.data = {
                code: null,
                name: "",
            };
            // 重置表单验证状态
            this.$nextTick(() => {
                this.$refs["rules-form"].resetFields();
            });
            this.dialogVisible = true;
        },
    },
};
</script>

<style scoped></style>
