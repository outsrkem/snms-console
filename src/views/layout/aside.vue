<template>
    <div>
        <div>
            <el-aside class="aside" style="width: auto">
                <p style="text-align: center">营养餐就餐记录系统</p>
                <el-menu :default-active="activePath" unique-opened>
                    <el-menu-item index="/stuclass" @click="OnSwitchRoutes('/stuclass')">
                        <el-icon><User /></el-icon>
                        <template #title><span>班级管理</span></template>
                    </el-menu-item>
                    <el-menu-item index="/meals" @click="OnSwitchRoutes('/meals')">
                        <el-icon><Bowl /></el-icon>
                        <template #title><span>就餐管理</span></template>
                    </el-menu-item>
                    <el-menu-item index="/report" @click="OnSwitchRoutes('/report')">
                        <el-icon><Document /></el-icon>
                        <template #title><span>报表管理</span></template>
                    </el-menu-item>
                </el-menu>
            </el-aside>
        </div>
    </div>
</template>

<script>
export default {
    name: "AppAside",
    components: {},
    props: {},

    data() {
        return {
            activePath: "",
        };
    },
    computed: {},
    watch: {},
    methods: {
        OnSwitchRoutes(activePath) {
            this.$router.push({ path: activePath });
        },
    },
    created() {
        this.$globalBus.on("updateActivePath", (data) => {
            this.activePath = data || "/";
        });
    },
    beforeUnmount() {
        this.$globalBus.off("updateActivePath");
    },
};
</script>

<style scoped>
.el-aside {
    /* 处理菜单右边的阴影 */
    background-color: #ffffff;
    .el-menu {
        border-right: none;
    }
}
</style>
