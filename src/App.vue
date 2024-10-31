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
import { Resume } from "@/api/index.js";
import { loadOptions } from "@/utils/common.js";
export default {
    name: "App",
    data() {
        return { data: "" };
    },
    methods: {
        loadResume: async function () {
            await Resume();
        },
    },
    created() {
        this.loadResume();
        loadOptions();
        // document.title = "学生营养餐就餐记录系统";
    },
};
</script>

<style></style>
