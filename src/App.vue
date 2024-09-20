<template>
    <div class="container-main">
        <div class="container-1">
            <div class="container-2">
                <router-view />
            </div>
            <div v-if="data != ''">
                <h3>Internal Server Error</h3>
                {{ data }}
            </div>
        </div>
    </div>
</template>

<script>
import { Resume } from "@/api/index.js";
export default {
    name: "App",
    data() {
        return { data: "" };
    },
    methods: {
        loadResume: function () {
            Resume()
                .then(() => {})
                .catch((err) => {
                    this.data = err.data;
                });
        },
    },
    created() {
        this.loadResume();
        // document.title = "学生营养餐就餐记录系统";
    },
};
</script>

<style></style>
