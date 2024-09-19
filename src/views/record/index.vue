<template>
    <MyHeader title="查看记录明细"></MyHeader>
    <h1>查看记录明细</h1>
</template>

<script>
import MyHeader from "@/views/component/header.vue";
export default {
    name: "RecordIndex",
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
