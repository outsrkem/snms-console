<template>
    <MyHeader title="查看报表"></MyHeader>
    <h1>查看报表</h1>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
export default {
    name: "ReportIndex",
    components: { MyHeader },
    props: {},
    data() {
        return {};
    },
    methods: {
        onBack() {
            this.$router.push({ name: "home" });
        },
    },
    created() {},
};
</script>

<style scoped lang="less"></style>
