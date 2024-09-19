<template>
    <div class="container-main">
        <div class="container-1">
            <div class="container-2">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "App",
    created() {
        // document.title = "学生营养餐就餐记录系统";
    },
};
</script>

<style></style>
