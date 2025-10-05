<template>
    <div>
        <MyHeader title="登记就餐数据"></MyHeader>
        <CompMealsIndex />
    </div>
</template>

<script>
import MyHeader from "../component/header.vue";
import CompMealsIndex from "../../components/meals/meals.vue";
export default {
    name: "MealsIndex",
    components: { MyHeader, CompMealsIndex },
    props: {},
    data() {
        return {};
    },
    computed: {},
    methods: {},
    created() {},
};
</script>

<style scoped lang="less"></style>
